require("dotenv").config();
const { createClient } = require("@libsql/client");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const statements = [
  `ALTER TABLE "new_Refund" RENAME TO "Refund"`,
  `CREATE UNIQUE INDEX "Refund_refundNumber_key" ON "Refund"("refundNumber")`,
  `CREATE INDEX "Refund_orderId_idx" ON "Refund"("orderId")`,
  `CREATE INDEX "Refund_managerId_idx" ON "Refund"("managerId")`,
  `CREATE INDEX "Refund_createdAt_idx" ON "Refund"("createdAt")`,
  `CREATE INDEX "RefundItem_refundId_idx" ON "RefundItem"("refundId")`,
  `CREATE INDEX "RefundItem_productId_idx" ON "RefundItem"("productId")`,
];

async function main() {
  for (const stmt of statements) {
    try {
      await client.execute(stmt);
      console.log("OK:", stmt);
    } catch (err) {
      console.log("SKIPPED (already exists or harmless):", stmt);
      console.log("  ->", err.message);
    }
  }
  console.log("Done.");
}

main();
