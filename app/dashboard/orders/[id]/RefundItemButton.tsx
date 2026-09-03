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
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [restocked, setRestocked] = useState(false);
  const [managerPin, setManagerPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function openModal() {
    setQuantity("1");
    setRestocked(false);
    setManagerPin("");
    setError("");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0 || qty > remaining) {
      setError(`Enter a quantity between 1 and ${remaining}`);
      return;
    }
    if (!managerPin) {
      setError("Manager PIN is required");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderItemId, quantity: qty, restocked, managerPin }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to process refund");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={openModal}
        className="whitespace-nowrap text-sm font-medium text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
      >
        Return
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Return {productName}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Up to {remaining} unit(s) can still be refunded.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={remaining}
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={restocked}
                  onChange={(e) => setRestocked(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-700"
                />
                Unopened — return to stock
              </label>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Manager PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={managerPin}
                  onChange={(e) => setManagerPin(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-center tracking-widest text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  {loading ? "Processing..." : "Confirm Return"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
