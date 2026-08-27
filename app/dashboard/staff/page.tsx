import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteStaffButton from "./DeleteStaffButton";
import ChangePinButton from "./ChangePinButton";

export default async function StaffPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  if (!currentUser || currentUser.role !== "MANAGER") {
    redirect("/dashboard");
  }

  const staff = await prisma.user.findMany({
    orderBy: { firstName: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        <Link
          href="/dashboard/staff/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add Staff
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className={`border-t border-gray-100 ${!s.isActive ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 text-gray-900">{s.firstName} {s.lastName}</td>
                <td className="px-4 py-3 text-gray-600">{s.role}</td>
                <td className="px-4 py-3">
                  {s.isActive ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="relative px-4 py-3 text-right">
                  {s.isActive && (
                    <ChangePinButton staffId={s.id} staffName={`${s.firstName} ${s.lastName}`} />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {s.id !== currentUser.id && (
                    <DeleteStaffButton
                      staffId={s.id}
                      staffName={`${s.firstName} ${s.lastName}`}
                      isActive={s.isActive}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
