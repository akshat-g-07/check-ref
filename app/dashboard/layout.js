import { redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";

import Sidebar from "@/components/sidebar";

export default async function DashboardLayout({ children }) {
  const isAuthenticated = await verifySession();

  if (!isAuthenticated) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-900 sm:ml-0">
        <div className="pt-16 sm:pt-0">{children}</div>
      </main>
    </div>
  );
}
