import { loadEnvConfig } from "@next/env";
import { getDb } from "../lib/db/client";
loadEnvConfig(process.cwd());
async function main() {
  if (
    process.env.SQUARE_ENVIRONMENT !== "sandbox" ||
    process.env.VERCEL_ENV === "production" ||
    !process.env.DATABASE_URL ||
    new URL(process.env.DATABASE_URL).hostname.replace("-pooler.", ".") !== process.env.SANDBOX_DATABASE_HOST
  )
    throw new Error("Sandbox database configuration required");
  const [id, date] = process.argv.slice(2);
  if (
    !/^[\da-f-]{36}$/.test(id || "") ||
    !Number.isFinite(new Date(date).getTime())
  )
    throw new Error("Usage: npm run sandbox:clock -- UUID ISO_DATE");
  await getDb().query(
    "UPDATE trial_orders SET scheduled_charge_at=$2,return_request_deadline=$2 WHERE id=$1 AND status='trial_active'",
    [id, new Date(date)],
  );
  console.info("Sandbox trial dates updated");
}
main()
  .then(() => process.exit(0))
  .catch(() => {
    console.error("Sandbox clock update failed");
    process.exit(1);
  });
