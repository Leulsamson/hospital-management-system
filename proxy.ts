import { NextRequest, NextResponse } from "next/server";
import { canAccessPath } from "@/lib/rbac";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionToken(token);

  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  if (!canAccessPath(pathname, session.role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
