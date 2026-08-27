import Link from "next/link";

export default function Sidebar({ role }: { role: string }) {
  const isManager = role === "MANAGER";

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-base font-bold text-gray-900">BarSystem</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        <Link
          href="/dashboard"
          className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/orders"
          className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Orders
        </Link>
        <Link
          href="/dashboard/products"
          className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Products
        </Link>
        {isManager && (
          <>
            <Link
              href="/dashboard/sales"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Sales History
            </Link>
            <Link
              href="/dashboard/staff"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Staff
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
