"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function BeerGlassIllustration() {
  return (
    <svg
      viewBox="0 0 120 140"
      className="mx-auto h-28 w-28"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Handle */}
      <path
        d="M92 40c14 0 22 10 22 24s-8 24-22 24"
        fill="none"
        stroke="#D97706"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Glass body */}
      <path
        d="M22 30h68l-6 90c-.5 6-5 11-11 11H39c-6 0-10.5-5-11-11L22 30Z"
        fill="#FEF3C7"
        stroke="#D97706"
        strokeWidth="3"
      />
      {/* Beer liquid */}
      <path
        d="M27 42h58l-5 76c-.4 5-4 9-9 9H41c-5 0-8.6-4-9-9L27 42Z"
        fill="#FBBF24"
      />
      {/* Bubbles */}
      <circle cx="48" cy="70" r="2.5" fill="#FDE68A" />
      <circle cx="62" cy="90" r="2" fill="#FDE68A" />
      <circle cx="55" cy="110" r="2.5" fill="#FDE68A" />
      <circle cx="70" cy="65" r="1.8" fill="#FDE68A" />
      {/* Foam */}
      <path
        d="M20 28c0-7 6-13 14-13 3 0 6 1 8 3 3-5 8-8 14-8s11 3 14 8c2-2 5-3 8-3 8 0 14 6 14 13 0 8-6 14-14 14H34c-8 0-14-6-14-14Z"
        fill="#FFFDF5"
        stroke="#EAB308"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-800 dark:bg-gray-900">
        <BeerGlassIllustration />

        <h1 className="mt-4 text-center text-xl font-bold text-black dark:text-white">
          Bar Management System
        </h1>
        <p className="mt-1 text-center text-sm text-gray-700 dark:text-gray-400">
          Enter your PIN to log in
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-center text-xl tracking-[0.4em] text-black placeholder-gray-400 focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />

          {error && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
