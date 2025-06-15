import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Check if the user is trying to access dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session || session.value !== "authenticated") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If user is authenticated and trying to access home page, redirect to dashboard
  if (pathname === "/") {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (session && session.value === "authenticated") {
      return NextResponse.redirect(new URL("/dashboard/projects", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
