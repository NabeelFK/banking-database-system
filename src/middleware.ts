import { NextRequest, NextResponse } from "next/server";

function parseTokenRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded).role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isCustomerRoute = pathname.startsWith("/customer");
  const isManagerRoute = pathname === "/employee/manager";
  const isEmployeeRoute =
    pathname.startsWith("/employee") && pathname !== "/employee/login";

  // No token → redirect to appropriate login
  if ((isCustomerRoute || isEmployeeRoute) && !token) {
    const dest = isEmployeeRoute
      ? new URL("/employee/login", request.url)
      : new URL("/login", request.url);
    dest.searchParams.set("from", pathname);
    return NextResponse.redirect(dest);
  }

  if (!token) return NextResponse.next();

  const role = parseTokenRole(token);

  // Customer trying to access employee routes → employee login
  if (isEmployeeRoute && role === "customer") {
    return NextResponse.redirect(new URL("/employee/login", request.url));
  }

  // Employee/manager trying to access customer routes → customer login
  if (isCustomerRoute && (role === "employee" || role === "manager")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Non-manager trying to access /employee/manager → employee dashboard
  if (isManagerRoute && role === "employee") {
    return NextResponse.redirect(new URL("/employee/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/customer/:path*", "/employee/:path*"],
};
