"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefundItemButton({
  orderItemId,
  productName,
  remaining,
}: {
  orderItemId: string;
  productName: string;
  remaining: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRefund() {
    const qtyInput = prompt(`How many "${productName}" are being returned? (max ${remaining})`, "1");
    if (!qtyInput) return;

    const quantity = parseFloat(qtyInput);
    if (!quantity || quantity <= 0 || quantity > remaining) {
      alert("Invalid quantity");
      return;
    }

    const restocked = confirm(
      "Is the item unopened and safe to return to stock?\n\nOK = Restock it\nCancel = Do not restock (opened/damaged)"
    );

    const managerPin = prompt("Enter manager PIN to authorize this refund:");
    if (!managerPin) return;

    setLoading(true);

    const res = await fetch("/api/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderItemId, quantity, restocked, managerPin }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to process refund");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleRefund}
      disabled={loading}
      className="text-sm font-medium text-amber-600 hover:text-amber-800 disabled:opacity-50 dark:text-amber-400 dark:hover:text-amber-300"
    >
      {loading ? "Processing..." : "Return"}
    </button>
  );
}
