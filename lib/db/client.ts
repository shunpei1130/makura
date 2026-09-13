import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
export interface DB {
  query<T = Record<string, unknown>>(
    sql: string,
    values?: unknown[],
  ): Promise<{ rows: T[] }>;
}
export interface Database extends DB {
  transaction<T>(fn: (tx: DB) => Promise<T>): Promise<T>;
}
let pool: Pool | undefined;
export function getDb(): Database {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 10000,
    });
    attachDatabasePool(pool);
  }
  const p = pool;
  return {
    query: async <T>(sql: string, values?: unknown[]) => {
      const r = await p.query(sql, values);
      return { rows: r.rows as T[] };
    },
    transaction: async <T>(fn: (tx: DB) => Promise<T>) => {
      const c = await p.connect();
      try {
        await c.query("BEGIN");
        await c.query("SET LOCAL lock_timeout = '10s'");
        const result = await fn(c as DB);
        await c.query("COMMIT");
        return result;
      } catch (e) {
        await c.query("ROLLBACK");
        throw e;
      } finally {
        c.release();
      }
    },
  };
}
