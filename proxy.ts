import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/album")) {
    const token = req.cookies.get("session")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try {
      await jwtVerify(token, SECRET);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/admin/dashboard") || pathname.startsWith("/admin/protocols")) {
    const token = req.cookies.get("admin_session")?.value;
    if (!token) return NextResponse.redirect(new URL("/admin", req.url));
    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (!payload.admin) return NextResponse.redirect(new URL("/admin", req.url));
    } catch {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/album/:path*", "/admin/dashboard/:path*", "/admin/protocols/:path*"],
};
