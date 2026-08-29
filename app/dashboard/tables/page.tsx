import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import AddTableForm from "@/components/tables/AddTableForm";
import EditCapacityForm from "@/components/tables/EditCapacityForm";

export default async function TablesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  if (!currentUser) {
    return null;
  }

  const tables = await prisma.barTable.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tables</h1>
        <AddTableForm />
      </div>

      {tables.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          No tables have been added yet.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`rounded-lg border p-5 text-center ${
                table.status === "OCCUPIED"
                  ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                  : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
              }`}
            >
              <p className="text-lg font-bold text-gray-900 dark:text-white">{table.name}</p>
              {table.capacity && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Seats {table.capacity}</p>
              )}
              <p
                className={`mt-2 text-sm font-medium ${
                  table.status === "OCCUPIED"
                    ? "text-red-700 dark:text-red-400"
                    : "text-green-700 dark:text-green-400"
                }`}
              >
                {table.status === "OCCUPIED" ? "Occupied" : "Available"}
              </p>
              <EditCapacityForm tableId={table.id} currentCapacity={table.capacity} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
