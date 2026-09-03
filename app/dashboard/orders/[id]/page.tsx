import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import PaymentForm from "./PaymentForm";
import CancelOrderButton from "./CancelOrderButton";
import PrintButton from "./PrintButton";
import Receipt from "./Receipt";
import RefundItemButton from "./RefundItemButton";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;
  const isManager = currentUser?.role === "MANAGER";

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true, refundItems: true } },
      table: true,
      waiter: true,
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = order.total - totalPaid;

  const formattedDate = new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(order.createdAt);

  const canCancel = isManager && order.status !== "CANCELLED" && order.payments.length === 0;

  return (
    <div>
      <div className="no-print flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {order.table?.name || "Counter"} · Waiter: {order.waiter?.firstName} {order.waiter?.lastName} · Status: {order.status}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">Placed: {formattedDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <PrintButton />
          {canCancel && <CancelOrderButton orderId={order.id} />}
        </div>
      </div>

      <div className="no-print mt-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Unit Price</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Refunded</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const refundedQty = item.refundItems.reduce((sum, r) => sum + r.quantity, 0);
                const remaining = item.quantity - refundedQty;
                return (
                  <tr key={item.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{item.product.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.quantity}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.unitPrice.toLocaleString()} UGX</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.total.toLocaleString()} UGX</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{refundedQty > 0 ? refundedQty : "-"}</td>
                    <td className="px-4 py-3">
                      {isManager && order.status !== "CANCELLED" && remaining > 0 && (
                        <RefundItemButton
                          orderItemId={item.id}
                          productName={item.product.name}
                          remaining={remaining}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="text-gray-900 dark:text-white">{order.total.toLocaleString()} UGX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Paid</span>
              <span className="text-gray-900 dark:text-white">{totalPaid.toLocaleString()} UGX</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900 dark:text-white">Balance</span>
              <span className="text-gray-900 dark:text-white">{balance.toLocaleString()} UGX</span>
            </div>
          </div>

          {order.status === "CANCELLED" ? (
            <p className="mt-4 border-t border-gray-100 pt-4 text-sm font-medium text-red-700 dark:border-gray-800 dark:text-red-400">
              This order was cancelled.
            </p>
          ) : balance > 0 ? (
            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
              <PaymentForm orderId={order.id} balance={balance} />
            </div>
          ) : (
            <p className="mt-4 border-t border-gray-100 pt-4 text-sm font-medium text-green-700 dark:border-gray-800 dark:text-green-400">
              Fully paid
            </p>
          )}
        </div>
      </div>

      <Receipt
        orderNumber={order.orderNumber}
        tableName={order.table?.name || "Counter"}
        waiterName={`${order.waiter?.firstName || ""} ${order.waiter?.lastName || ""}`.trim() || "-"}
        date={formattedDate}
        items={order.items}
        total={order.total}
        totalPaid={totalPaid}
      />
    </div>
  );
}
