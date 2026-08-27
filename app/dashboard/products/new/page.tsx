import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProductForm from "./ProductForm";

export default async function NewProductPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  if (!currentUser || currentUser.role !== "MANAGER") {
    redirect("/dashboard/products");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
      <div className="mt-6 max-w-md">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
