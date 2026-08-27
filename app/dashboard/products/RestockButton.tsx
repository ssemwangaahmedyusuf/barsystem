"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RestockButton({
  productId,
  productName,
  currentStock,
  unit,
}: {
  productId: string;
  productName: string;
  currentStock: number;
  unit: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/products/${productId}/restock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to restock");
      return;
    }

    setOpen(false);
    setQuantity("");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-blue-700 hover:text-blue-900"
      >
        Restock
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-end gap-2">
      <input
        type="number"
        placeholder={`+ ${unit}`}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        autoFocus
        className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="text-sm font-medium text-gray-900 hover:underline disabled:opacity-50"
      >
        {loading ? "..." : "Add"}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setError(""); setQuantity(""); }}
        className="text-sm text-gray-500 hover:underline"
      >
        Cancel
      </button>
      {error && <p className="absolute mt-8 text-xs text-red-600">{error}</p>}
    </form>
  );
}
