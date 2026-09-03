require("dotenv").config();
const { createClient } = require("@libsql/client");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const statements = [
  `DROP TABLE IF EXISTS "RefundItem"`,
  `CREATE TABLE "RefundItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refundId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "total" REAL NOT NULL,
    "restocked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "RefundItem_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RefundItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RefundItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE INDEX "RefundItem_refundId_idx" ON "RefundItem"("refundId")`,
  `CREATE INDEX "RefundItem_orderItemId_idx" ON "RefundItem"("orderItemId")`,
  `CREATE INDEX "RefundItem_productId_idx" ON "RefundItem"("productId")`,
];

async function main() {
  for (const stmt of statements) {
    await client.execute(stmt);
    console.log("OK:", stmt.split("\n")[0].slice(0, 60));
  }
  console.log("Done.");
}

main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
