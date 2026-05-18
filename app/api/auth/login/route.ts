import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { hashEmail } from "@/lib/crypto";
import { createSession, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, name, sector } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });
    }

    const emailHash = await hashEmail(email);

    let userId: string;

    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email_hash = ?",
      args: [emailHash],
    });

    if (existing.rows.length > 0) {
      userId = existing.rows[0].id as string;
    } else {
      if (!name || !sector) {
        return NextResponse.json({ error: "Nome e setor obrigatórios no primeiro acesso" }, { status: 400 });
      }
      userId = nanoid();
      await db.execute({
        sql: "INSERT INTO users (id, email, email_hash, name, sector) VALUES (?, ?, ?, ?, ?)",
        args: [userId, email.trim().toLowerCase(), emailHash, name.trim(), sector.trim()],
      });
    }

    const token = await createSession(userId);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
