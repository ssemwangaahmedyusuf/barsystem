import "dotenv/config";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
);

console.log("Connected to:", process.env.TURSO_DATABASE_URL);
console.log("Tables found:");
for (const row of result.rows) {
  console.log(" -", row.name);
}
