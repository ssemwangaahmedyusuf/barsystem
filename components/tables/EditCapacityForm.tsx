"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditCapacityForm({
  tableId,
  currentCapacity,
}: {
  tableId: string;
  currentCapacity: number | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [capacity, setCapacity] = useState(currentCapacity?.toString() ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/tables/${tableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ capacity: parseInt(capacity, 10) }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to update");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Edit seats
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1">
      <input
        type="number"
        min={1}
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        autoFocus
        className="w-14 rounded border border-gray-300 px-1 py-1 text-center text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        Cancel
      </button>
      {error && <p className="w-full text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
