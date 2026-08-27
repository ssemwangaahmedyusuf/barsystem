import { prisma } from "@/lib/prisma";
import OrderForm from "./OrderForm";

export default async function NewOrderPage() {
  const [products, tables] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.barTable.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
      <div className="mt-6">
        <OrderForm products={products} tables={tables} />
      </div>
    </div>
  );
}
