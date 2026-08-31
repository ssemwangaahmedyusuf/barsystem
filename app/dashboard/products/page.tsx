import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
import DeleteProductButton from "./DeleteProductButton";
import RestockButton from "./RestockButton";

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;
  const isManager = currentUser?.role === "MANAGER";

  const categories = await prisma.category.findMany({
    include: {
      products: { orderBy: { name: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  const hasAnyProducts = categories.some((c) => c.products.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
        {isManager && (
          <Link
            href="/dashboard/products/new"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Add Product
          </Link>
        )}
      </div>

      {!hasAnyProducts ? (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          No products yet.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {categories
            .filter((category) => category.products.length > 0)
            .map((category) => (
              <div
                key={category.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-800">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {category.name}
                    <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                      ({category.products.length})
                    </span>
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-gray-600 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-2 font-medium">Name</th>
                        <th className="px-4 py-2 font-medium">Price</th>
                        <th className="px-4 py-2 font-medium">Stock</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                        {isManager && <th className="px-4 py-2 font-medium"></th>}
                        {isManager && <th className="px-4 py-2 font-medium"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {category.products.map((product) => (
                        <tr
                          key={product.id}
                          className={`border-t border-gray-100 dark:border-gray-800 ${
                            !product.isActive ? "opacity-50" : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-gray-900 dark:text-white">{product.name}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {product.sellingPrice.toLocaleString()} UGX
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {product.currentStock} {product.unit}
                          </td>
                          <td className="px-4 py-3">
                            {product.isActive ? (
                              <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                                Inactive
                              </span>
                            )}
                          </td>
                          {isManager && (
                            <td className="relative px-4 py-3 text-right">
                              {product.isActive && (
                                <RestockButton
                                  productId={product.id}
                                  productName={product.name}
                                  currentStock={product.currentStock}
                                  unit={product.unit}
                                />
                              )}
                            </td>
                          )}
                          {isManager && (
                            <td className="px-4 py-3 text-right space-x-3">
                              {product.isActive && (
                                <>
                                  <Link
                                    href={`/dashboard/products/${product.id}/edit`}
                                    className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                  >
                                    Edit
                                  </Link>
                                  <DeleteProductButton productId={product.id} productName={product.name} />
                                </>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
