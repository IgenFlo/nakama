import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login");

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Non connecté → login
  if (!session && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Déjà connecté → pas besoin de revoir le login
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Zone admin réservée aux ADMIN
  if (
    pathname.startsWith("/admin") &&
    (session?.user as unknown as { role?: string })?.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|logo-carre\\.png|sw\\.js|manifest\\.webmanifest|icons).*)",
  ],
};
