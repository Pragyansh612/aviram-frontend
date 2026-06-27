import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/signup"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/applications",
  "/opportunities",
  "/outreach",
  "/companies",
];

function hasSession(request: NextRequest): boolean {
  return request.cookies.get("aviram-session")?.value === "1";
}

function isOnboarded(request: NextRequest): boolean {
  return request.cookies.get("aviram-onboarded")?.value === "1";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = hasSession(request);
  const onboarded = isOnboarded(request);

  if (AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (authed) {
      const dest = onboarded ? "/dashboard" : "/onboarding";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!authed) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    if (pathname.startsWith("/dashboard") && !onboarded) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    if (pathname.startsWith("/onboarding") && onboarded) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/applications/:path*",
    "/opportunities/:path*",
    "/outreach/:path*",
    "/companies/:path*",
  ],
};
