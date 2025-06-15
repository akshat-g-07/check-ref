import { cookies } from "next/headers";

export async function verifySession() {
  const sessionCookie = (await cookies()).get("session");
  return sessionCookie?.value === "authenticated";
}

export async function createSession() {
  const cookieStore = await cookies();
  cookieStore.set("session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}
