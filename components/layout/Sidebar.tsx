"use client";

import Link from "next/link";
import { useState } from "react";

export default function Sidebar({ role }: { role: string }) {
  const isManager = role === "MANAGER";
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex flex-1 flex-col gap-1 p-4">
      <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
        Dashboard
      </Link>
      <Link href="/dashboard/orders" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
        Orders
      </Link>
      <Link href="/dashboard/tables" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
        Tables
      </Link>
      <Link href="/dashboard/products" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
        Products
      </Link>
      {isManager && (
        <>
          <Link href="/dashboard/categories" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
            Categories
          </Link>
          <Link href="/dashboard/sales" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
            Sales History
          </Link>
          <Link href="/dashboard/staff" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
            Staff
          </Link>
        </>
      )}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="no-print flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 sm:hidden dark:border-gray-800 dark:bg-gray-900">
        <span className="text-base font-bold text-gray-900 dark:text-white">BarSystem</span>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:text-gray-200"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="no-print border-b border-gray-200 bg-white sm:hidden dark:border-gray-800 dark:bg-gray-900">
          {links}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="no-print hidden h-screen w-56 flex-col border-r border-gray-200 bg-white sm:flex dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
          <span className="text-base font-bold text-gray-900 dark:text-white">BarSystem</span>
        </div>
        {links}
      </aside>
    </>
  );
}
