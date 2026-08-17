import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required to run the migration.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const schema = await readFile(new URL("../schema.sql", import.meta.url), "utf8");
const statements = schema
  .split(/;\s*(?:\r?\n|$)/)
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(`${statement};`);
}

console.log(`Applied ${statements.length} schema statements.`);
