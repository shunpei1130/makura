import { neon } from "@neondatabase/serverless";

export type DbRow = Record<string, any>;
type DbClient = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<DbRow[]>;

let cachedClient: DbClient | undefined;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  cachedClient ??= neon(databaseUrl) as unknown as DbClient;
  return cachedClient;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}
