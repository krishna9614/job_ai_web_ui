import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = ["jobai_access_token", "jobai_refresh_token"];
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"];
const GUEST_ONLY = ["/login", "/signup"];

/**
 * Optimistic routing based on the presence of the session cookies. The backend still verifies
 * the token on every request; an invalid cookie is cleared by the API proxy on its first 401.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));

  if (!hasSession && PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  if (hasSession && GUEST_ONLY.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login", "/signup"],
};
