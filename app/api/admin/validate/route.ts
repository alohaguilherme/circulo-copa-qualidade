import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { userId, undo } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });

  await db.execute({
    sql: "UPDATE users SET album_validated_at = ? WHERE id = ?",
    args: [undo ? null : new Date().toISOString(), userId],
  });

  return NextResponse.json({ ok: true });
}
