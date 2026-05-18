import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const stickers = await db.execute({
    sql: "SELECT protocol_id, scanned_at FROM user_stickers WHERE user_id = ?",
    args: [session.userId],
  });

  return NextResponse.json({
    stickers: stickers.rows.map((r) => ({
      protocolId: r.protocol_id,
      scannedAt: r.scanned_at,
    })),
  });
}
