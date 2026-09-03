import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ActivityPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  if (!currentUser || currentUser.role !== "MANAGER") {
    redirect("/dashboard");
  }

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  const formatter = new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  function typeLabel(type: string) {
    if (type === "LOGIN") return "Login";
    if (type === "ORDER_PLACED") return "Order Placed";
    if (type === "REFUND") return "Refund";
    return type;
  }

  function typeBadgeClass(type: string) {
    if (type === "LOGIN") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
    if (type === "ORDER_PLACED") {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    }
    if (type === "REFUND") {
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Staff logins, orders, and refunds, most recent first.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
            No activity yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${typeBadgeClass(n.type)}`}
                      >
                        {typeLabel(n.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{n.message}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {formatter.format(n.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
