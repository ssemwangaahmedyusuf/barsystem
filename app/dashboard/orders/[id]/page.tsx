import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PaymentForm from "./PaymentForm";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
      <p className="mt-1 text-sm text-gray-600">
        {order.table?.name || "Counter"} · Waiter: {order.waiter?.firstName} {order.waiter?.lastName} · Status: {order.status}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Placed: {formattedDate}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Unit Price</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-900">{item.product.name}</td>
                  <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-gray-600">{item.unitPrice.toLocaleString()} UGX</td>
                  <td className="px-4 py-3 text-gray-600">{item.total.toLocaleString()} UGX</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="text-gray-900">{order.total.toLocaleString()} UGX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paid</span>
              <span className="text-gray-900">{totalPaid.toLocaleString()} UGX</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900">Balance</span>
              <span className="text-gray-900">{balance.toLocaleString()} UGX</span>
            </div>
          </div>

          {balance > 0 ? (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <PaymentForm orderId={order.id} balance={balance} />
            </div>
          ) : (
            <p className="mt-4 border-t border-gray-100 pt-4 text-sm font-medium text-green-700">
              Fully paid
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
