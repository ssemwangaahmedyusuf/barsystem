import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;
  const isManager = currentUser?.role === "MANAGER";

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [todaysOrders, openOrders, allActiveProducts] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: startOfToday },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.order.count({
      where: { status: "OPEN" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { currentStock: "asc" },
    }),
  ]);

  const todaysSales = todaysOrders.reduce((sum, o) => sum + o.total, 0);
  const todaysOrderCount = todaysOrders.length;
  const lowStockProducts = allActiveProducts.filter(
    (p) => p.currentStock <= p.minimumStock
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Welcome to your bar management dashboard.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isManager && (
          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">Today's Sales</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {todaysSales.toLocaleString()} UGX
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{todaysOrderCount} order(s) today</p>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Open Orders</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{openOrders}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Awaiting payment</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Items</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{lowStockProducts.length}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">At or below minimum stock</p>
        </div>
      </div>

      {isManager && lowStockProducts.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Current Stock</th>
                  <th className="px-4 py-3 font-medium">Minimum</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => (
                  <tr key={product.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{product.name}</td>
                    <td className="px-4 py-3 font-medium text-red-600 dark:text-red-400">
                      {product.currentStock} {product.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {product.minimumStock} {product.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
