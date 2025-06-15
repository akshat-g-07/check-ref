import { redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";

import AuthForm from "@/components/auth-form";

export default async function Home() {
  const isAuthenticated = await verifySession();

  if (isAuthenticated) {
    redirect("/dashboard/projects");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthForm />
    </div>
  );
}
