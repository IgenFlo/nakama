import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login");

  // Non connecté → login
  if (!request.auth && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Déjà connecté → pas besoin de revoir le login
  if (request.auth && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Zone admin réservée aux ADMIN
  if (pathname.startsWith("/admin") && request.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons).*)",
  ],
};
