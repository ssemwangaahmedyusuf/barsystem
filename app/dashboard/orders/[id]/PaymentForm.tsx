"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentForm({
  orderId,
  balance,
}: {
  orderId: string;
  balance: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(balance.toString());
  const [method, setMethod] = useState("CASH");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, amount, method }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to record payment");
      return;
    }

    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (UGX)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Method</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
          <option value="CASH">Cash</option>
          <option value="MOBILE_MONEY">Mobile Money</option>
          <option value="CARD">Card</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
      >
        {loading ? "Recording..." : "Record Payment"}
      </button>
    </form>
  );
}
