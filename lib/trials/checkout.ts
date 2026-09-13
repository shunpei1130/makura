import { z } from "zod";
import { hash, AppError, publicToken } from "../security";
import type { Database } from "../db/client";
import { gateway, type SquareGateway } from "../square/client";
import { PRODUCTS, CONSENT_VERSION, dates, type Trial } from "./model";
import { enqueue } from "../email/service";
export const checkoutSchema = z
  .object({
    key: z.uuid(),
    type: z.enum(["vertical", "horizontal"]),
    name: z.string().trim().min(1).max(100),
    email: z
      .email()
      .max(254)
      .transform((v) => v.toLowerCase()),
    phone: z.string().regex(/^[+0-9 ()-]{9,20}$/),
    postalCode: z.string().regex(/^\d{3}-?\d{4}$/),
    address1: z.string().trim().min(5).max(250),
    address2: z.string().trim().max(150).default(""),
    sourceId: z.string().min(10).max(200),
    consent: z.literal(true),
    consentVersion: z.literal(CONSENT_VERSION),
  })
  .strict();
export async function checkout(
  db: Database,
  input: z.infer<typeof checkoutSchema>,
  api: SquareGateway = gateway,
  now = new Date(),
) {
  const { sourceId, ...stable } = input;
  const inputHash = hash(JSON.stringify(stable));
  await db.query(
    "INSERT INTO checkout_intents(key,input_hash) VALUES($1,$2) ON CONFLICT(key) DO NOTHING",
    [input.key, inputHash],
  );
  return db.transaction(async (tx) => {
    const intent = (
      await tx.query<{ input_hash: string }>(
        "SELECT input_hash FROM checkout_intents WHERE key=$1 FOR UPDATE",
        [input.key],
      )
    ).rows[0];
    if (intent.input_hash !== inputHash)
      throw new AppError("CHECKOUT_CHANGED", 409);
    const existing = (
      await tx.query<Trial>(
        "SELECT * FROM trial_orders WHERE checkout_key=$1",
        [input.key],
      )
    ).rows[0];
    if (existing)
      return { url: `/return/${publicToken(existing.id)}?complete=1` };
    const customer = await api.createCustomer(
      input.key,
      input.name,
      input.email,
    );
    const card = await api.storeCard(
      hash(`${input.key}:${sourceId}`).slice(0, 40),
      sourceId,
      customer,
      input.name,
    );
    const { deadline } = dates(now);
    const id = input.key;
    const token = publicToken(id);
    const number = "MG-" + id.replaceAll("-", "").slice(0, 12).toUpperCase();
    const { rows } = await tx.query<Trial>(
      `INSERT INTO trial_orders(id,order_number,public_token_hash,checkout_key,product_type,product_name,customer_name,email,phone,postal_code,address1,address2,square_customer_id,square_card_id,trial_started_at,return_request_deadline,scheduled_charge_at,consent_version,consented_at) VALUES($1,$2,$3,$1,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$15,$16,$14) RETURNING *`,
      [
        id,
        number,
        hash(token),
        input.type,
        PRODUCTS[input.type],
        input.name,
        input.email,
        input.phone,
        input.postalCode,
        input.address1,
        input.address2,
        customer,
        card,
        now,
        deadline,
        CONSENT_VERSION,
      ],
    );
    await enqueue(
      tx,
      rows[0],
      "0円トライアルを受け付けました",
      "本日のお支払いは0円です。カード登録が完了しました。30日後、返品が成立しない場合は13,480円（税込）を登録カードへ1回だけ自動請求します。原則7営業日以内に発送します。",
    );
    await enqueue(
      tx,
      rows[0],
      "新しいトライアル申込",
      "新しい申込を受け付けました。管理画面で枕・箱・案内カードの出荷を確認してください。",
      "new-order-admin",
      true,
    );
    return { url: `/return/${token}?complete=1` };
  });
}
