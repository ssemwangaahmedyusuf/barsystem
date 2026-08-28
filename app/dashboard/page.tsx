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
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">
        Welcome to your bar management dashboard.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isManager && (
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600">Today's Sales</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {todaysSales.toLocaleString()} UGX
            </p>
            <p className="mt-1 text-xs text-gray-500">{todaysOrderCount} order(s) today</p>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-600">Open Orders</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{openOrders}</p>
          <p className="mt-1 text-xs text-gray-500">Awaiting payment</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-600">Low Stock Items</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
          <p className="mt-1 text-xs text-gray-500">At or below minimum stock</p>
        </div>
      </div>

      {isManager && lowStockProducts.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Low Stock Alerts</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Current Stock</th>
                <th className="px-4 py-3 font-medium">Minimum</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((product) => (
                <tr key={product.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">
                    {product.currentStock} {product.unit}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {product.minimumStock} {product.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
