import { createHmac } from "node:crypto";
import { AppError, required, secureEqual } from "../security";
export type Payment = {
  id: string;
  status: string;
  amount_money: { amount: number; currency: string };
  reference_id?: string;
  location_id?: string;
  customer_id?: string;
  receipt_url?: string;
  note?: string;
};
export class SquareError extends Error {
  constructor(
    public code: string,
    public uncertain = false,
  ) {
    super(code);
  }
}
export function squareConfig() {
  const environment = required("SQUARE_ENVIRONMENT");
  if (!["sandbox", "production"].includes(environment))
    throw new AppError("SERVICE_UNAVAILABLE", 503);
  if (process.env.VERCEL_ENV === "preview" && environment !== "sandbox")
    throw new AppError("SERVICE_UNAVAILABLE", 503);
  if (process.env.VERCEL_ENV === "production" && environment !== "production")
    throw new AppError("SERVICE_UNAVAILABLE", 503);
  const applicationId = required("NEXT_PUBLIC_SQUARE_APPLICATION_ID");
  if ((environment === "sandbox") !== applicationId.startsWith("sandbox-"))
    throw new AppError("SERVICE_UNAVAILABLE", 503);
  return {
    environment,
    applicationId,
    locationId: required("NEXT_PUBLIC_SQUARE_LOCATION_ID"),
    base:
      environment === "production"
        ? "https://connect.squareup.com"
        : "https://connect.squareupsandbox.com",
  };
}
export async function square<T>(path: string, body?: unknown): Promise<T> {
  const cfg = squareConfig();
  let response: Response;
  try {
    response = await fetch(cfg.base + "/v2" + path, {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${required("SQUARE_ACCESS_TOKEN")}`,
        "Content-Type": "application/json",
        "Square-Version": "2026-08-19",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
  } catch {
    throw new SquareError("CONNECTION_UNKNOWN", true);
  }
  let data: Record<string, unknown>;
  try {
    data = await response.json();
  } catch {
    throw new SquareError("RESPONSE_UNKNOWN", true);
  }
  if (!response.ok) {
    const errors = data.errors as { code?: string }[] | undefined;
    throw new SquareError(
      errors?.[0]?.code || "SQUARE_ERROR",
      response.status >= 500 || response.status === 429,
    );
  }
  return data as T;
}
export interface SquareGateway {
  createCustomer(key: string, name: string, email: string): Promise<string>;
  storeCard(
    key: string,
    source: string,
    customer: string,
    name: string,
  ): Promise<string>;
  pay(
    key: string,
    card: string,
    customer: string,
    orderId: string,
  ): Promise<Payment>;
  getPayment(id: string): Promise<Payment>;
}
export const gateway: SquareGateway = {
  async createCustomer(key, name, email) {
    const r = await square<{ customer: { id: string } }>("/customers", {
      idempotency_key: key,
      given_name: name,
      email_address: email,
    });
    return r.customer.id;
  },
  async storeCard(key, source, customer, name) {
    const r = await square<{ card: { id: string } }>("/cards", {
      idempotency_key: key,
      source_id: source,
      card: { customer_id: customer, cardholder_name: name },
    });
    return r.card.id;
  },
  async pay(key, card, customer, orderId) {
    return (
      await square<{ payment: Payment }>("/payments", {
        idempotency_key: key,
        source_id: card,
        customer_id: customer,
        location_id: squareConfig().locationId,
        reference_id: orderId,
        note: `makura-attempt:${key}`,
        amount_money: { amount: 13480, currency: "JPY" },
        autocomplete: true,
        customer_details: { customer_initiated: false, seller_keyed_in: false },
      })
    ).payment;
  },
  async getPayment(id) {
    return (
      await square<{ payment: Payment }>(`/payments/${encodeURIComponent(id)}`)
    ).payment;
  },
};
export function verifyWebhook(
  raw: string,
  signature: string,
  url: string,
  key: string,
) {
  const expected = createHmac("sha256", key)
    .update(url + raw)
    .digest("base64");
  return secureEqual(expected, signature);
}
