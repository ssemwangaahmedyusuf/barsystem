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
      className="text-xs font-medium text-gray-600 underline hover:text-gray-900 disabled:opacity-50 dark:text-gray-400 dark:hover:text-white"
    >
      {loading ? "Updating..." : label}
    </button>
  );
}
