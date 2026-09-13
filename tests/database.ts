import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { loadEnvConfig } from "@next/env";
import { readFileSync, readdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { DB, Database } from "../lib/db/client";
const live = process.env.RUN_DATABASE_INTEGRATION === "true";
if (live) loadEnvConfig(process.cwd());
const schema = "test_makura_" + randomUUID().replaceAll("-", "");
let memory: PGlite;
let pool: Pool;
let serial = Promise.resolve();
const tables =
  "email_outbox,audit_events,payment_attempts,trial_orders,checkout_intents,system_controls,webhook_events";
export const fixture = {
  live,
  db: {
    query: async <T>(sql: string, params?: unknown[]) => ({
      rows: (live
        ? await pool.query(sql, params)
        : await memory.query(sql, params)
      ).rows as T[],
    }),
    transaction: async <T>(fn: (tx: DB) => Promise<T>) => {
      if (live) {
        const c = await pool.connect();
        try {
          await c.query("BEGIN");
          await c.query("SET LOCAL lock_timeout='10s'");
          const result = await fn(c as DB);
          await c.query("COMMIT");
          return result;
        } catch (e) {
          await c.query("ROLLBACK");
          throw e;
        } finally {
          c.release();
        }
      }
      let release!: () => void;
      const prev = serial;
      serial = new Promise<void>((r) => (release = r));
      await prev;
      try {
        return await memory.transaction((tx) =>
          fn({
            query: async <R>(sql: string, params?: unknown[]) => ({
              rows: (await tx.query(sql, params)).rows as R[],
            }),
          }),
        );
      } finally {
        release();
      }
    },
  } as Database,
  async start() {
    if (live) {
      const connectionString = process.env.DATABASE_URL_UNPOOLED;
      if (
        !connectionString ||
        process.env.SQUARE_ENVIRONMENT !== "sandbox" ||
        process.env.VERCEL_ENV === "production" ||
        new URL(connectionString).hostname !== process.env.SANDBOX_DATABASE_HOST
      )
        throw new Error("EXPLICIT_SANDBOX_DATABASE_REQUIRED");
      pool = new Pool({
        connectionString,
        max: 6,
        options: "-c search_path=" + schema,
        connectionTimeoutMillis: 15000,
      });
      await pool.query('CREATE SCHEMA "' + schema + '"');
    } else memory = new PGlite();
    for (const f of readdirSync("drizzle")
      .filter((f) => f.endsWith(".sql"))
      .sort()) {
      let sql = readFileSync("drizzle/" + f, "utf8");
      if (live) sql = sql.replaceAll('"public".', '"' + schema + '".');
      if (live) await pool.query(sql);
      else await memory.exec(sql);
    }
  },
  async reset() {
    await fixture.db.query("TRUNCATE " + tables + " CASCADE");
  },
  async stop() {
    if (live && pool) {
      if (!/^test_makura_[a-f0-9]{32}$/.test(schema))
        throw new Error("INVALID_TEST_SCHEMA");
      await pool.query('DROP SCHEMA "' + schema + '" CASCADE');
      await pool.end();
    } else if (memory) await memory.close();
  },
};
