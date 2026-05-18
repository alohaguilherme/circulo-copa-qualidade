import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token inválido" }, { status: 400 });

  const protocol = await db.execute({
    sql: "SELECT id, name FROM protocols WHERE qr_token = ?",
    args: [token],
  });

  if (protocol.rows.length === 0) {
    return NextResponse.json({ error: "QR code inválido" }, { status: 404 });
  }

  const protocolId = protocol.rows[0].id as string;
  const protocolName = protocol.rows[0].name as string;

  const existing = await db.execute({
    sql: "SELECT 1 FROM user_stickers WHERE user_id = ? AND protocol_id = ?",
    args: [session.userId, protocolId],
  });

  if (existing.rows.length > 0) {
    return NextResponse.json({ alreadyCollected: true, protocolId, protocolName });
  }

  await db.execute({
    sql: "INSERT INTO user_stickers (user_id, protocol_id) VALUES (?, ?)",
    args: [session.userId, protocolId],
  });

  const totalStickers = await db.execute({
    sql: "SELECT COUNT(*) as count FROM user_stickers WHERE user_id = ?",
    args: [session.userId],
  });

  const count = totalStickers.rows[0].count as number;

  return NextResponse.json({ ok: true, protocolId, protocolName, totalCollected: count });
}
