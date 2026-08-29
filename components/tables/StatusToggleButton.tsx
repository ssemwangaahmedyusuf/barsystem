"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusToggleButton({
  tableId,
  status,
}: {
  tableId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isOccupied = status === "OCCUPIED";
  const nextStatus = isOccupied ? "AVAILABLE" : "OCCUPIED";
  const label = isOccupied ? "Mark Available" : "Mark Occupied";

  async function handleClick() {
    setLoading(true);
    const res = await fetch(`/api/tables/${tableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-md border px-2 py-1 text-xs font-medium disabled:opacity-50 ${
        isOccupied
          ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900"
          : "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
      }`}
    >
      {loading ? "Updating..." : label}
    </button>
  );
}
