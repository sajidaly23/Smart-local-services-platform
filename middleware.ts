import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

function decodeJwtPayload(token: string): { id: string; role: string; email: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files, images, favicon
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  // Remove locale prefix if present (e.g., /en/dashboard -> /dashboard)
  const segments = pathname.split("/").filter(Boolean);
  const hasLocale = segments.length > 0 && (segments[0] === "en" || segments[0] === "ur");
  const normalizedPath = hasLocale
    ? "/" + segments.slice(1).join("/")
    : pathname;

  const currentLocale = hasLocale ? segments[0] : "en";

  // Check role-protected dashboard routes
  if (normalizedPath.startsWith("/dashboard")) {
    const token = request.cookies.get("localconnect_token")?.value;
    const session = token ? decodeJwtPayload(token) : null;

    if (!session) {
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role specific enforcement
    if (normalizedPath.startsWith("/dashboard/admin") && session.role !== "admin") {
      const target =
        session.role === "provider"
          ? `/${currentLocale}/dashboard/provider`
          : `/${currentLocale}/dashboard/customer`;
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (
      normalizedPath.startsWith("/dashboard/provider") &&
      session.role !== "provider" &&
      session.role !== "admin"
    ) {
      return NextResponse.redirect(new URL(`/${currentLocale}/dashboard/customer`, request.url));
    }

    if (
      normalizedPath.startsWith("/dashboard/customer") &&
      session.role !== "customer" &&
      session.role !== "admin"
    ) {
      return NextResponse.redirect(new URL(`/${currentLocale}/dashboard/provider`, request.url));
    }
  }

  // If user is already logged in, redirect away from /login and /register
  if (normalizedPath === "/login" || normalizedPath === "/register") {
    const token = request.cookies.get("localconnect_token")?.value;
    const session = token ? decodeJwtPayload(token) : null;
    if (session) {
      let target = `/${currentLocale}/dashboard/customer`;
      if (session.role === "provider") target = `/${currentLocale}/dashboard/provider`;
      if (session.role === "admin") target = `/${currentLocale}/dashboard/admin`;
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // Pass to internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

