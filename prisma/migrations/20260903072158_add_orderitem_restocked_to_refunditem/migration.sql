/*
  Warnings:

  - Added the required column `orderItemId` to the `RefundItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RefundItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refundId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "total" REAL NOT NULL,
    "restocked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "RefundItem_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RefundItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RefundItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RefundItem" ("id", "productId", "quantity", "refundId", "total", "unitPrice") SELECT "id", "productId", "quantity", "refundId", "total", "unitPrice" FROM "RefundItem";
DROP TABLE "RefundItem";
ALTER TABLE "new_RefundItem" RENAME TO "RefundItem";
CREATE INDEX "RefundItem_refundId_idx" ON "RefundItem"("refundId");
CREATE INDEX "RefundItem_orderItemId_idx" ON "RefundItem"("orderItemId");
CREATE INDEX "RefundItem_productId_idx" ON "RefundItem"("productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
