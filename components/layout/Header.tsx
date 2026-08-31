"use client";

import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

function roleLabel(role: string) {
  if (role === "MANAGER") return "Manager";
  if (role === "WAITER") return "Waiter";
  return role;
}

export default function Header({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Bar Management System</h1>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-gray-700 sm:inline dark:text-gray-300">
          Welcome, {userName}, {roleLabel(role)}
        </span>
        {role === "MANAGER" && <NotificationBell />}
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Log Out
        </button>
      </div>
    </header>
  );
}
