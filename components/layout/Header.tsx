"use client";

import { useRouter } from "next/navigation";

export default function Header({
  userName,
}: {
  userName: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">Bar Management System</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">Welcome, {userName}</span>
        <button
          onClick={handleLogout}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Log Out
        </button>
      </div>
    </header>
  );
}
