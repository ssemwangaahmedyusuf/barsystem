import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppShell({
  children,
  userName,
  role,
}: {
  children: React.ReactNode;
  userName: string;
  role: string;
}) {
  return (
    <div className="flex h-screen flex-col sm:flex-row">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="no-print">
          <Header userName={userName} role={role} />
        </div>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 dark:bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}
