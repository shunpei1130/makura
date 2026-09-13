import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { fixture } from "./database";
import { checkout } from "../lib/trials/checkout";
import {
  requestReturn,
  tracking,
  adminAction,
  returnDeadlines,
  load,
} from "../lib/trials/service";
import { chargeOne, reconcilePayment, reminders } from "../lib/trials/billing";
import { sendOutbox } from "../lib/email/service";
import {
  addDays,
  canCharge,
  CONSENT_VERSION,
  retryAt,
} from "../lib/trials/model";
import { hash, publicToken, seal, unseal } from "../lib/security";
import {
  SquareError,
  gateway,
  square,
  verifyWebhook,
  type Payment,
  type SquareGateway,
} from "../lib/square/client";
import { createHmac } from "node:crypto";
const db = fixture.db;
const squareSandbox = process.env.RUN_SQUARE_SANDBOX === "true";
const start = new Date("2026-01-31T15:00:00Z");
const paid = new Map<string, Payment>();
let requests: string[] = [];
let fail: string | null = null;
let loseResponse = false;
const mock: SquareGateway = {
  createCustomer: async (...args) =>
    squareSandbox ? gateway.createCustomer(...args) : "customer-test",
  storeCard: async (key, source, customer, name) => {
    if (!squareSandbox) return "card-test";
    // Square's reusable Sandbox nonce requires this documented test postal code.
    return (
      await square<{ card: { id: string } }>("/cards", {
        idempotency_key: key,
        source_id: "cnon:card-nonce-ok",
        card: {
          customer_id: customer,
          cardholder_name: name,
          billing_address: { postal_code: "94103" },
        },
      })
    ).card.id;
  },
  getPayment: async (id) => {
    if (squareSandbox) return gateway.getPayment(id);
    const p = [...paid.values()].find((x) => x.id === id);
    if (!p) throw new Error("missing");
    return p;
  },
  pay: async (key, card, customer, id) => {
    requests.push(key);
    if (fail) {
      if (squareSandbox)
        return gateway.pay(key, "ccof:customer-card-id-declined", customer, id);
      throw new SquareError(fail);
    }
    if (squareSandbox)
      paid.set(key, await gateway.pay(key, card, customer, id));
    if (!paid.has(key))
      paid.set(key, {
        id: randomUUID(),
        status: "COMPLETED",
        amount_money: { amount: 13480, currency: "JPY" },
        reference_id: id,
        customer_id: customer,
        note: `makura-attempt:${key}`,
      });
    if (loseResponse) {
      loseResponse = false;
      throw new SquareError("TIMEOUT", true);
    }
    return paid.get(key)!;
  },
};
async function order() {
  const id = randomUUID();
  await checkout(
    db,
    {
      key: id,
      type: "vertical",
      name: "試験 太郎",
      email: "test@example.com",
      phone: "09012345678",
      postalCode: "1000001",
      address1: "東京都千代田区試験町1",
      address2: "",
      sourceId: "test-card-token",
      consent: true,
      consentVersion: CONSENT_VERSION,
    },
    mock,
    start,
  );
  return { id, token: publicToken(id) };
}
beforeAll(async () => {
  if (
    squareSandbox &&
    (!fixture.live || process.env.SQUARE_ENVIRONMENT !== "sandbox")
  )
    throw new Error("EXPLICIT_SANDBOX_REQUIRED");
  process.env.APP_SECRET = "test-only-".repeat(8);
  process.env.APP_URL = "https://test.example.com";
  process.env.AUTO_CHARGE_ENABLED = "true";
  await fixture.start();
});
beforeEach(async () => {
  await fixture.reset();
  await db.query(
    "INSERT INTO system_controls(key,enabled) VALUES('auto_charge_enabled',true)",
  );
  paid.clear();
  requests = [];
  fail = null;
  loseResponse = false;
  process.env.AUTO_CHARGE_ENABLED = "true";
});
afterAll(() => fixture.stop());
describe("trial lifecycle", () => {
  it("A: registration is zero and a retained pillow is charged once after 30 days", async () => {
    const { id } = await order();
    expect(requests).toHaveLength(0);
    expect((await load(db, id)).scheduled_charge_at).toEqual(
      addDays(start, 30),
    );
    await chargeOne(db, id, mock, addDays(start, 31));
    expect(paid.size).toBe(1);
    expect((await load(db, id)).status).toBe("paid");
    await chargeOne(db, id, mock, addDays(start, 32));
    expect(requests).toHaveLength(1);
  });
  it("B: a timely return holds billing", async () => {
    const { id, token } = await order();
    await requestReturn(db, token, addDays(start, 29));
    expect(await chargeOne(db, id, mock, addDays(start, 31))).toBe("skipped");
    expect(paid.size).toBe(0);
  });
  it("C: tracking holds in transit, and seller approval waives product without any card charge", async () => {
    const { id, token } = await order();
    await requestReturn(db, token, addDays(start, 29));
    await tracking(db, token, "ヤマト運輸", "123456789012", addDays(start, 34));
    await chargeOne(db, id, mock, addDays(start, 40));
    await adminAction(
      db,
      id,
      "return-received",
      { pillow: true, box: true },
      "admin",
      addDays(start, 41),
    );
    await adminAction(
      db,
      id,
      "return-approve",
      {},
      "admin",
      addDays(start, 41),
    );
    expect((await load(db, id)).status).toBe("return_accepted");
    await chargeOne(db, id, mock, addDays(start, 45));
    expect(paid.size).toBe(0);
  });
  it("D: no expiry until the final notice has actually been sent and grace elapsed", async () => {
    const { id, token } = await order();
    await requestReturn(db, token, addDays(start, 1));
    await returnDeadlines(db, addDays(start, 10));
    expect((await load(db, id)).status).toBe("return_requested");
    await db.query(
      "UPDATE trial_orders SET grace_notified_at=$2,grace_deadline=$3 WHERE id=$1",
      [id, addDays(start, 10), addDays(start, 11)],
    );
    await returnDeadlines(db, addDays(start, 12));
    expect((await load(db, id)).status).toBe("return_expired");
    await chargeOne(db, id, mock, addDays(start, 12));
    expect(paid.size).toBe(0);
    await chargeOne(db, id, mock, addDays(start, 31));
    expect(paid.size).toBe(1);
  });
  it("E: missing box rejects, waits for original charge date, and charges no extra shipping", async () => {
    const { id, token } = await order();
    await requestReturn(db, token, addDays(start, 1));
    await adminAction(
      db,
      id,
      "return-received",
      { pillow: true, box: false },
      "admin",
      addDays(start, 3),
    );
    await expect(
      adminAction(db, id, "return-approve", {}, "admin"),
    ).rejects.toThrow("RETURN_ITEMS_REQUIRED");
    await adminAction(
      db,
      id,
      "return-reject",
      { reason: "箱の不足" },
      "admin",
      addDays(start, 4),
    );
    await chargeOne(db, id, mock, addDays(start, 5));
    expect(paid.size).toBe(0);
    await chargeOne(db, id, mock, addDays(start, 31));
    expect(paid.size).toBe(0);
    await sendOutbox(db, 100, async () => "test-message-id");
    await chargeOne(db, id, mock, addDays(start, 31));
    expect([...paid.values()].map((p) => p.amount_money.amount)).toEqual([
      13480,
    ]);
  });
  it("F: definitive decline retries with a new key only when due", async () => {
    const { id } = await order();
    fail = "INSUFFICIENT_FUNDS";
    await chargeOne(db, id, mock, addDays(start, 31));
    expect((await load(db, id)).status).toBe("payment_failed");
    await chargeOne(db, id, mock, addDays(start, 31.5));
    expect(requests).toHaveLength(1);
    fail = null;
    await chargeOne(db, id, mock, addDays(start, 32));
    expect(requests).toHaveLength(2);
    expect(requests[0]).not.toBe(requests[1]);
    expect(paid.size).toBe(1);
  });
  it("G: concurrent cron calls create only one completed payment", async () => {
    const { id } = await order();
    await Promise.all([
      chargeOne(db, id, mock, addDays(start, 31)),
      chargeOne(db, id, mock, addDays(start, 31)),
      chargeOne(db, id, mock, addDays(start, 31)),
    ]);
    expect(paid.size).toBe(1);
    expect(requests).toHaveLength(1);
  });
  it("H: exactly at the deadline a valid return wins over billing", async () => {
    const { id, token } = await order();
    const deadline = addDays(start, 30);
    await Promise.all([
      requestReturn(db, token, deadline),
      chargeOne(db, id, mock, deadline),
    ]);
    await chargeOne(db, id, mock, addDays(start, 31));
    expect(paid.size).toBe(0);
    expect((await load(db, id)).billing_hold).toBe(true);
  });
  it("lost payment response reuses the persisted key and never charges twice", async () => {
    const { id } = await order();
    loseResponse = true;
    await chargeOne(db, id, mock, addDays(start, 31));
    expect((await load(db, id)).status).toBe("charge_processing");
    await expect(
      adminAction(db, id, "retry-payment", {}, "admin"),
    ).rejects.toThrow("PAYMENT_RECONCILIATION_REQUIRED");
    await chargeOne(db, id, mock, addDays(start, 32));
    expect(requests[0]).toBe(requests[1]);
    expect(paid.size).toBe(1);
    expect((await load(db, id)).status).toBe("paid");
  });
  it("kill switch prevents all CreatePayment calls", async () => {
    const { id } = await order();
    process.env.AUTO_CHARGE_ENABLED = "false";
    await chargeOne(db, id, mock, addDays(start, 31));
    expect(requests).toHaveLength(0);
    process.env.AUTO_CHARGE_ENABLED = "true";
    await db.query("UPDATE system_controls SET enabled=false");
    await chargeOne(db, id, mock, addDays(start, 31));
    expect(requests).toHaveLength(0);
  });
  it("webhooks reconcile payments even while automatic charging is disabled", async () => {
    const { id } = await order();
    loseResponse = true;
    await chargeOne(db, id, mock, addDays(start, 31));
    process.env.AUTO_CHARGE_ENABLED = "false";
    await reconcilePayment(db, [...paid.values()][0]);
    expect((await load(db, id)).status).toBe("paid");
    expect(requests).toHaveLength(1);
  });
  it("an older failed webhook cannot be applied to a later payment attempt", async () => {
    const { id } = await order();
    const pending: Payment = {
      id: "failed-payment",
      status: "FAILED",
      amount_money: { amount: 13480, currency: "JPY" },
      customer_id: "customer-test",
      reference_id: id,
    };
    await chargeOne(
      db,
      id,
      {
        ...mock,
        pay: async (key) => ({ ...pending, note: `makura-attempt:${key}` }),
      },
      addDays(start, 31),
    );
    const firstKey = (
      await db.query<{ idempotency_key: string }>(
        "SELECT idempotency_key FROM payment_attempts WHERE trial_order_id=$1",
        [id],
      )
    ).rows[0].idempotency_key;
    loseResponse = true;
    await chargeOne(db, id, mock, addDays(start, 32));
    await reconcilePayment(db, {
      ...pending,
      note: `makura-attempt:${firstKey}`,
    });
    expect((await load(db, id)).status).toBe("charge_processing");
    await reconcilePayment(db, [...paid.values()][0]);
    expect((await load(db, id)).status).toBe("paid");
  });
  it("obsolete return notices are canceled before delivery", async () => {
    const { id, token } = await order();
    await requestReturn(db, token, addDays(start, 1));
    await returnDeadlines(db, addDays(start, 10));
    await adminAction(
      db,
      id,
      "confirm-shipped",
      {},
      "admin",
      addDays(start, 10),
    );
    const subjects: string[] = [];
    const result = await sendOutbox(db, 100, async (mail) => {
      subjects.push(mail.subject);
      return "test-email-id";
    });
    expect(result.canceled).toBe(1);
    expect(subjects.some((s) => s.includes("最終のご案内"))).toBe(false);
    expect((await load(db, id)).grace_deadline).toBeNull();
  });
  it("mail failure leaves rejection blocked until successful delivery", async () => {
    const { id, token } = await order();
    await requestReturn(db, token, start);
    await adminAction(
      db,
      id,
      "return-received",
      { pillow: true, box: false },
      "admin",
    );
    await adminAction(db, id, "return-reject", { reason: "箱の不足" }, "admin");
    await sendOutbox(db, 100, async () => {
      throw new Error("offline");
    });
    expect(await chargeOne(db, id, mock, addDays(start, 31))).toBe("skipped");
    await db.query("UPDATE email_outbox SET next_attempt_at=now()");
    await sendOutbox(db, 100, async () => "sent");
    expect(await chargeOne(db, id, mock, addDays(start, 31))).toBe("charged");
  });
  it("box waiver allows approval and extending updates both deadlines", async () => {
    const { id, token } = await order();
    await adminAction(db, id, "extend", { days: 5 }, "admin");
    let t = await load(db, id);
    expect(t.scheduled_charge_at).toEqual(addDays(start, 35));
    expect(t.return_request_deadline).toEqual(t.scheduled_charge_at);
    await requestReturn(db, token, addDays(start, 32));
    await adminAction(
      db,
      id,
      "return-received",
      { pillow: true, box: false },
      "admin",
    );
    await adminAction(db, id, "waive-box", {}, "admin");
    await adminAction(db, id, "return-approve", {}, "admin");
    t = await load(db, id);
    expect(canCharge(t, addDays(start, 40))).toBe(false);
  });
  it("manual hold release never releases a return hold", async () => {
    const { id, token } = await order();
    await requestReturn(db, token, start);
    await adminAction(db, id, "hold", {}, "admin");
    await adminAction(db, id, "release", {}, "admin");
    expect((await load(db, id)).billing_hold).toBe(true);
  });
  it("notification jobs advance past the first batch and never strand later orders", async () => {
    const { id } = await order();
    const ids = Array.from({ length: 300 }, () => randomUUID());
    await db.query(
      `INSERT INTO trial_orders SELECT (jsonb_populate_record(NULL::trial_orders,
       to_jsonb(t)||jsonb_build_object('id',x.id,'checkout_key',x.id,'order_number',x.id,'public_token_hash',x.id))).*
       FROM trial_orders t CROSS JOIN unnest($2::uuid[]) AS x(id) WHERE t.id=$1`,
      [id, ids],
    );
    await reminders(db, addDays(start, 24));
    await reminders(db, addDays(start, 24));
    expect(
      Number(
        (
          await db.query<{ n: string }>(
            "SELECT count(*) AS n FROM email_outbox WHERE dedupe_key LIKE '%:reminder:7:%'",
          )
        ).rows[0].n,
      ),
    ).toBe(301);
    expect((await reminders(db, addDays(start, 24))).checked).toBe(0);
    await db.query(
      "UPDATE trial_orders SET status='return_requested',return_review_status='pending',billing_hold=true,return_requested_at=$1,return_ship_deadline=$2",
      [start, addDays(start, 7)],
    );
    await returnDeadlines(db, addDays(start, 8));
    await returnDeadlines(db, addDays(start, 8));
    expect(
      Number(
        (
          await db.query<{ n: string }>(
            "SELECT count(*) AS n FROM email_outbox WHERE kind='返送期限超過・最終のご案内'",
          )
        ).rows[0].n,
      ),
    ).toBe(301);
    expect((await returnDeadlines(db, addDays(start, 8))).checked).toBe(0);
  }, 240000);
  it("outbound shipping requires all three packing checks", async () => {
    const { id } = await order();
    await expect(
      adminAction(
        db,
        id,
        "ship",
        { pillow: true, box: false, guide: true },
        "admin",
      ),
    ).rejects.toThrow("PACKING_REQUIRED");
  });
  it("hard card errors stop retries and cancellation cannot erase paid orders", async () => {
    const { id } = await order();
    fail = "CARD_EXPIRED";
    await chargeOne(db, id, mock, addDays(start, 31));
    expect((await load(db, id)).status).toBe("collection_failed");
    await chargeOne(db, id, mock, addDays(start, 40));
    expect(requests).toHaveLength(1);
  });
});
it("calculates fixed 30 days across month/year boundaries and absolute retry schedule", () => {
  expect(addDays(new Date("2026-12-15T00:00:00Z"), 30).toISOString()).toBe(
    "2027-01-14T00:00:00.000Z",
  );
  expect(retryAt(start, 1)).toEqual(addDays(start, 1));
  expect(retryAt(start, 2)).toEqual(addDays(start, 3));
  expect(retryAt(start, 3)).toEqual(addDays(start, 7));
  expect(retryAt(start, 4)).toBeNull();
});
it("validates webhook signature against exact URL and unmodified body", () => {
  const body = '{"a":1}',
    url = "https://test.example.com/api/webhooks/square",
    key = "test-key";
  const sig = createHmac("sha256", key)
    .update(url + body)
    .digest("base64");
  expect(verifyWebhook(body, sig, url, key)).toBe(true);
  expect(verifyWebhook(body + " ", sig, url, key)).toBe(false);
  expect(verifyWebhook(body, sig, url + "/", key)).toBe(false);
});
it("stores only hashed order tokens and encrypts queued mail", () => {
  const token = publicToken("test");
  expect(hash(token)).not.toContain(token);
  const ciphertext = seal("private@example.com");
  expect(ciphertext).not.toContain("private");
  expect(unseal(ciphertext)).toBe("private@example.com");
});
