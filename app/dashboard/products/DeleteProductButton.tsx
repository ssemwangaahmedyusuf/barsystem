"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove ${productName}? If it has order history, it will be deactivated instead of deleted.`)) {
      return;
    }
    setLoading(true);

    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to remove product");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {loading ? "..." : "Remove"}
    </button>
  );
}
