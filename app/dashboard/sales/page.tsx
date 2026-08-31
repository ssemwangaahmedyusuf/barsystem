import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DateRangeFilter from "./DateRangeFilter";
import { getBusinessDayStart } from "@/lib/business-day";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  if (!currentUser || currentUser.role !== "MANAGER") {
    redirect("/dashboard");
  }

  const params = await searchParams;

  const businessDayStart = getBusinessDayStart();
  const defaultFrom = new Date(businessDayStart);
  defaultFrom.setDate(defaultFrom.getDate() - 6);

  const from = params.from ? new Date(params.from) : defaultFrom;
  const to = params.to ? new Date(params.to) : new Date();
  to.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
    include: {
      waiter: true,
      table: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeOrders = orders.filter((o) => o.status !== "CANCELLED");
  const totalSales = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const paidOrders = orders.filter((o) => o.status === "PAID");
  const totalCollected = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const totalProfit = activeOrders.reduce((sum, order) => {
    const orderProfit = order.items.reduce((itemSum, item) => {
      const costTotal = item.product.costPrice * item.quantity;
      return itemSum + (item.total - costTotal);
    }, 0);
    return sum + orderProfit;
  }, 0);

  const formatter = new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales History</h1>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        Business day starts 8:00 AM (matches receipts exactly)
      </p>

      <div className="mt-4">
        <DateRangeFilter
          defaultFrom={from.toISOString().slice(0, 10)}
          defaultTo={to.toISOString().slice(0, 10)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{activeOrders.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales Value</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{totalSales.toLocaleString()} UGX</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Profit</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{totalProfit.toLocaleString()} UGX</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Collected (Paid)</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{totalCollected.toLocaleString()} UGX</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium">Table</th>
                <th className="px-4 py-3 font-medium">Waiter</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    No orders in this date range.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-t border-gray-100 dark:border-gray-800 ${
                      order.status === "CANCELLED" ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatter.format(order.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.table?.name || "Counter"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {order.waiter ? `${order.waiter.firstName} ${order.waiter.lastName}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.status}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.total.toLocaleString()} UGX</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
