import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const [totalUsersResult, completedResult, sectorResult, recentResult] = await Promise.all([
    db.execute("SELECT COUNT(*) as count FROM users"),
    db.execute(`
      SELECT COUNT(DISTINCT user_id) as count FROM user_stickers
      GROUP BY user_id HAVING COUNT(*) = 12
    `),
    db.execute(`
      SELECT u.sector, COUNT(DISTINCT u.id) as user_count,
             COUNT(s.protocol_id) as sticker_count
      FROM users u
      LEFT JOIN user_stickers s ON s.user_id = u.id
      GROUP BY u.sector
      ORDER BY sticker_count DESC
    `),
    db.execute(`
      SELECT u.name, u.sector, COUNT(s.protocol_id) as collected
      FROM users u
      LEFT JOIN user_stickers s ON s.user_id = u.id
      GROUP BY u.id
      ORDER BY collected DESC
      LIMIT 10
    `),
  ]);

  return NextResponse.json({
    totalUsers: totalUsersResult.rows[0].count,
    completedAlbums: completedResult.rows.length,
    bySector: sectorResult.rows,
    topUsers: recentResult.rows,
  });
}
