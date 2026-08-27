"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePinButton({
  staffId,
  staffName,
}: {
  staffId: string;
  staffName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/users/${staffId}/pin`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to change PIN");
      return;
    }

    setOpen(false);
    setPin("");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Change PIN
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-end gap-2">
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        placeholder="New PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        autoFocus
        className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="text-sm font-medium text-gray-900 hover:underline disabled:opacity-50"
      >
        {loading ? "..." : "Save"}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setError(""); setPin(""); }}
        className="text-sm text-gray-500 hover:underline"
      >
        Cancel
      </button>
      {error && <p className="absolute mt-8 text-xs text-red-600">{error}</p>}
    </form>
  );
}
