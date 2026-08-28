"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Cancel this order? Stock will be restored. This cannot be undone.")) {
      return;
    }
    setLoading(true);

    const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to cancel order");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {loading ? "Cancelling..." : "Cancel Order"}
    </button>
  );
}
