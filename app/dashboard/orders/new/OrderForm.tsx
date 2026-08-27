"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  sellingPrice: number;
  unit: string;
};

type BarTable = {
  id: string;
  name: string;
};

export default function OrderForm({
  products,
  tables,
}: {
  products: Product[];
  tables: BarTable[];
}) {
  const router = useRouter();
  const [tableId, setTableId] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addToCart(productId: string) {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const next = { ...prev };
      if (next[productId] > 1) {
        next[productId] -= 1;
      } else {
        delete next[productId];
      }
      return next;
    });
  }

  const cartEntries = Object.entries(cart);
  const total = cartEntries.reduce((sum, [productId, qty]) => {
    const product = products.find((p) => p.id === productId);
    return sum + (product?.sellingPrice || 0) * qty;
  }, 0);

  async function handleSubmit() {
    setError("");
    if (cartEntries.length === 0) {
      setError("Add at least one product to the order");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableId: tableId || null,
        items: cartEntries.map(([productId, quantity]) => ({ productId, quantity })),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create order");
      return;
    }

    router.push("/dashboard/orders");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Product picker */}
      <div className="col-span-2">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Table (optional)</label>
          <select
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            className="mt-1 w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
          >
            <option value="">Counter / No table</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product.id)}
              className="rounded-lg border border-gray-200 bg-white p-3 text-left hover:border-gray-400"
            >
              <div className="text-sm font-medium text-gray-900">{product.name}</div>
              <div className="text-xs text-gray-500">
                {product.sellingPrice.toLocaleString()} UGX / {product.unit}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900">Order Summary</h2>

        {cartEntries.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No items yet. Tap a product to add it.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {cartEntries.map(([productId, qty]) => {
              const product = products.find((p) => p.id === productId);
              if (!product) return null;
              return (
                <div key={productId} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-gray-900">{product.name}</div>
                    <div className="text-gray-500">
                      {product.sellingPrice.toLocaleString()} × {qty}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromCart(productId)}
                      className="h-6 w-6 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="w-4 text-center">{qty}</span>
                    <button
                      onClick={() => addToCart(productId)}
                      className="h-6 w-6 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex justify-between text-sm font-semibold text-gray-900">
            <span>Total</span>
            <span>{total.toLocaleString()} UGX</span>
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
