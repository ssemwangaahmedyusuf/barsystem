"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  categoryId: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
};

export default function EditProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [unit, setUnit] = useState(product.unit);
  const [costPrice, setCostPrice] = useState(product.costPrice.toString());
  const [sellingPrice, setSellingPrice] = useState(product.sellingPrice.toString());
  const [minimumStock, setMinimumStock] = useState(product.minimumStock.toString());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        categoryId,
        unit,
        costPrice,
        sellingPrice,
        minimumStock,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update product");
      return;
    }

    router.push("/dashboard/products");
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Unit</label>
        <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost Price (UGX)</label>
          <input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Selling Price (UGX)</label>
          <input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Minimum Stock (alert)</label>
        <input
          type="number"
          value={minimumStock}
          onChange={(e) => setMinimumStock(e.target.value)}
          className={inputClass}
        />
      </div>

      <p className="text-xs text-gray-500">
        Current stock: {product.currentStock} {product.unit} — use "Restock" to add more.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
