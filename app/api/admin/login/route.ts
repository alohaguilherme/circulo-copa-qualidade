import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { createAdminSession, ADMIN_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const encoded = process.env.ADMIN_PASSWORD_HASH;
  const hash = encoded ? Buffer.from(encoded, "base64").toString() : null;
  if (!hash || !(await compare(password, hash))) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const token = await createAdminSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return res;
}
