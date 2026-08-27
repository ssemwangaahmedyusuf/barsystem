"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteStaffButton({
  staffId,
  staffName,
  isActive,
}: {
  staffId: string;
  staffName: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDeactivate() {
    if (!confirm(`Deactivate ${staffName}? They will no longer be able to log in.`)) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/users/${staffId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to deactivate staff member");
      return;
    }
    router.refresh();
  }

  async function handleReactivate() {
    setLoading(true);
    const res = await fetch(`/api/users/${staffId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to reactivate staff member");
      return;
    }
    router.refresh();
  }

  if (isActive) {
    return (
      <button
        onClick={handleDeactivate}
        disabled={loading}
        className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        {loading ? "..." : "Deactivate"}
      </button>
    );
  }

  return (
    <button
      onClick={handleReactivate}
      disabled={loading}
      className="text-sm font-medium text-green-700 hover:text-green-900 disabled:opacity-50"
    >
      {loading ? "..." : "Reactivate"}
    </button>
  );
}
