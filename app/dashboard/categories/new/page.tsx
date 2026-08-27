import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryForm from "./CategoryForm";

export default async function NewCategoryPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  if (!currentUser || currentUser.role !== "MANAGER") {
    redirect("/dashboard/categories");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Add Category</h1>
      <div className="mt-6 max-w-md">
        <CategoryForm />
      </div>
    </div>
  );
}
