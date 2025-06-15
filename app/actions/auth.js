"use server";

import { redirect } from "next/navigation";

import { createSession } from "@/lib/auth";

export async function verifyAdminCode(formData) {
  const code = formData.get("code");

  if (code === process.env.ADMIN_CODE) {
    await createSession();
    redirect("/dashboard/projects");
  } else {
    return { error: "Invalid code" };
  }
}
