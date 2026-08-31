import "dotenv/config";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

try {
  console.log("Attempting CREATE TABLE...");
  const createResult = await client.execute(
    `CREATE TABLE IF NOT EXISTS "DebugTest" ("id" TEXT PRIMARY KEY)`
  );
  console.log("Create result:", JSON.stringify(createResult, null, 2));

  console.log("Checking sqlite_master immediately after...");
  const check = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='DebugTest'`
  );
  console.log("Found DebugTest table?", check.rows.length > 0, JSON.stringify(check.rows));
} catch (err) {
  console.error("ERROR CAUGHT:", err);
}
