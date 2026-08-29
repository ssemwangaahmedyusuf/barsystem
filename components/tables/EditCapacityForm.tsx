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
        className="mt-1 text-xs text-gray-400 underline hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
      >
        Edit seats
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1 flex items-center justify-center gap-1">
      <input
        type="number"
        min={1}
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        autoFocus
        className="w-14 rounded border border-gray-300 px-1 py-0.5 text-center text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
      <button
        type="submit"
        disabled={loading}
        className="text-xs font-medium text-gray-700 underline disabled:opacity-50 dark:text-gray-300"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-xs text-gray-400 underline dark:text-gray-500"
      >
        Cancel
      </button>
      {error && <p className="w-full text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
