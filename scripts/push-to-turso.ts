import "dotenv/config";
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const rawSql = readFileSync(
    "prisma/migrations/20260821094848_add_pin_to_user/migration.sql",
    "utf-8"
  );

  // Remove comment lines (lines starting with --) before splitting into statements
  const cleanedSql = rawSql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = cleanedSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Running ${statements.length} statements against Turso...`);

  for (const statement of statements) {
    await client.execute(statement);
    console.log("✓ Executed:", statement.slice(0, 60).replace(/\n/g, " ") + "...");
  }

  console.log("Done! Schema pushed to Turso.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
