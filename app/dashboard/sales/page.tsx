import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DateRangeFilter from "./DateRangeFilter";

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const defaultFrom = new Date(today);
  defaultFrom.setDate(defaultFrom.getDate() - 6);

  const from = params.from ? new Date(params.from) : defaultFrom;
  const to = params.to ? new Date(params.to) : new Date();
  to.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
    include: { waiter: true, table: true },
    orderBy: { createdAt: "desc" },
  });

  const activeOrders = orders.filter((o) => o.status !== "CANCELLED");
  const totalSales = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const paidOrders = orders.filter((o) => o.status === "PAID");
  const totalCollected = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const formatter = new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>

      <div className="mt-4">
        <DateRangeFilter
          defaultFrom={from.toISOString().slice(0, 10)}
          defaultTo={to.toISOString().slice(0, 10)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{activeOrders.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-600">Total Sales Value</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalSales.toLocaleString()} UGX</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-600">Total Collected (Paid)</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalCollected.toLocaleString()} UGX</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
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
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No orders in this date range.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className={`border-t border-gray-100 ${order.status === "CANCELLED" ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 text-gray-900">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{formatter.format(order.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-600">{order.table?.name || "Counter"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.waiter ? `${order.waiter.firstName} ${order.waiter.lastName}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.status}</td>
                  <td className="px-4 py-3 text-gray-600">{order.total.toLocaleString()} UGX</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
