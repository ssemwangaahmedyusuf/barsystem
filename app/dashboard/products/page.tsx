import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
import DeleteProductButton from "./DeleteProductButton";

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;
  const isManager = currentUser?.role === "MANAGER";

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        {isManager && (
          <Link
            href="/dashboard/products/new"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add Product
          </Link>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {isManager && <th className="px-4 py-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={isManager ? 6 : 5} className="px-4 py-6 text-center text-gray-500">
                  No products yet.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className={`border-t border-gray-100 ${!product.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-gray-600">{product.category.name}</td>
                  <td className="px-4 py-3 text-gray-600">{product.sellingPrice.toLocaleString()} UGX</td>
                  <td className="px-4 py-3 text-gray-600">{product.currentStock} {product.unit}</td>
                  <td className="px-4 py-3">
                    {product.isActive ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  {isManager && (
                    <td className="px-4 py-3 text-right space-x-3">
                      {product.isActive && (
                        <>
                          <Link
                            href={`/dashboard/products/${product.id}/edit`}
                            className="text-sm font-medium text-gray-700 hover:text-gray-900"
                          >
                            Edit
                          </Link>
                          <DeleteProductButton productId={product.id} productName={product.name} />
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
