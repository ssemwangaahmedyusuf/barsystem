require("dotenv").config();
const { createClient } = require("@libsql/client");
const fs = require("fs");
const path = require("path");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const sqlPath = path.join(
    __dirname,
    "../prisma/migrations/20260901092817_add_refund_and_refunditem/migration.sql"
  );
  const sql = fs.readFileSync(sqlPath, "utf-8");
  const statements = sql.split(";").map(s => s.trim()).filter(Boolean);

  console.log(`Applying ${statements.length} statement(s) to Turso...`);
  for (const stmt of statements) {
    console.log("  -> " + stmt.split("\n")[0].slice(0, 60) + "...");
    await client.execute(stmt);
  }
  console.log("Done.");
}

main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
