import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CompletedList } from "./completed-list";

async function getStats() {
  const [totalUsers, sectorStats, topUsers, completedAlbums, completers] = await Promise.all([
    db.execute("SELECT COUNT(*) as count FROM users"),
    db.execute(`
      SELECT u.sector, COUNT(DISTINCT u.id) as user_count, COUNT(s.protocol_id) as sticker_count
      FROM users u LEFT JOIN user_stickers s ON s.user_id = u.id
      GROUP BY u.sector ORDER BY sticker_count DESC
    `),
    db.execute(`
      SELECT u.name, u.sector, COUNT(s.protocol_id) as collected
      FROM users u LEFT JOIN user_stickers s ON s.user_id = u.id
      GROUP BY u.id ORDER BY collected DESC LIMIT 10
    `),
    db.execute(`
      SELECT COUNT(*) as count FROM (
        SELECT user_id FROM user_stickers GROUP BY user_id HAVING COUNT(*) = 12
      )
    `),
    db.execute(`
      SELECT u.id, u.name, u.sector, u.album_validated_at,
             MAX(s.scanned_at) as completed_at
      FROM users u
      JOIN user_stickers s ON s.user_id = u.id
      GROUP BY u.id
      HAVING COUNT(s.protocol_id) = 12
      ORDER BY completed_at ASC
    `),
  ]);
  return {
    totalUsers: totalUsers.rows[0].count as number,
    completedAlbums: completedAlbums.rows[0].count as number,
    sectorStats: sectorStats.rows,
    topUsers: topUsers.rows,
    completers: completers.rows as unknown as {
      id: string; name: string; sector: string;
      completed_at: string; album_validated_at: string | null;
    }[],
  };
}

export default async function AdminDashboard() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) redirect("/admin");
  const stats = await getStats();

  return (
    <div className="stad-bg" style={{ minHeight: "100svh" }}>
      {/* ── HEADER ── */}
      <header style={{
        background: "rgba(4,10,5,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(34,197,94,0.12)",
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900, fontSize: 20,
              color: "#f0faf0", textTransform: "uppercase",
              letterSpacing: "0.5px", lineHeight: 1,
            }}>
              Copa da Qualidade
            </h1>
            <p style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: 10,
              color: "#F2B705", letterSpacing: "2px",
              textTransform: "uppercase", marginTop: 3,
            }}>
              Painel Administrativo
            </p>
          </div>
          <Link href="/admin/protocols" style={{ textDecoration: "none" }}>
            <button className="stad-gold-btn" style={{
              padding: "9px 16px", borderRadius: 10, fontSize: 11,
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <span>⊞</span> QR Codes
            </button>
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "28px 24px 56px" }}>

        {/* ── STAT CARDS ── */}
        <div className="stad-a1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          <StatCard
            icon="👥"
            value={String(stats.totalUsers)}
            label="Participantes"
            accent="rgba(34,197,94,0.5)"
          />
          <StatCard
            icon="🏆"
            value={String(stats.completedAlbums)}
            label="Álbuns completos"
            accent="rgba(242,183,5,0.5)"
            gold
          />
        </div>

        {/* ── TOP USERS ── */}
        <div className="stad-a2" style={{ marginBottom: 16 }}>
          <div className="stad-section-label" style={{ marginBottom: 14 }}>
            Mais engajados
          </div>
          <div style={{
            background: "rgba(4,11,6,0.7)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, overflow: "hidden",
          }}>
            {stats.topUsers.length === 0 ? (
              <p style={{
                padding: "20px 20px", fontSize: 13,
                color: "rgba(134,239,172,0.35)",
                fontFamily: "var(--font-body)", fontWeight: 300,
              }}>
                Nenhum participante ainda.
              </p>
            ) : (
              stats.topUsers.map((u, i) => {
                const pct = ((u.collected as number) / 12) * 100;
                const isTop = i === 0;
                return (
                  <div key={i} className="admin-row" style={{ padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <span style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 900, fontSize: 13,
                        color: isTop ? "#F2B705" : "rgba(255,255,255,0.2)",
                        width: 18, flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800, fontSize: 14,
                          color: "#f0faf0", textTransform: "uppercase",
                          letterSpacing: "0.3px",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {String(u.name)}
                        </p>
                        <p style={{ fontSize: 11, color: "rgba(134,239,172,0.45)" }}>
                          {String(u.sector)}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <div style={{ width: 72, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: pct === 100
                            ? "linear-gradient(90deg, #C89B00, #F2B705)"
                            : "rgba(34,197,94,0.6)",
                          borderRadius: 2,
                          transition: "width 0.4s ease",
                        }} />
                      </div>
                      <span style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800, fontSize: 13,
                        color: pct === 100 ? "#F2B705" : "rgba(134,239,172,0.7)",
                        minWidth: 36, textAlign: "right",
                      }}>
                        {String(u.collected)}/12
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── COMPLETED ALBUMS ── */}
        <div className="stad-a3" style={{ marginBottom: 16 }}>
          <div className="stad-section-label" style={{ marginBottom: 14 }}>
            Álbuns completos — validação
          </div>
          <div style={{
            background: "rgba(4,11,6,0.7)",
            border: "1px solid rgba(242,183,5,0.12)",
            borderRadius: 16, overflow: "hidden",
          }}>
            <CompletedList completers={stats.completers} />
          </div>
        </div>

        {/* ── BY SECTOR ── */}
        <div className="stad-a5">
          <div className="stad-section-label" style={{ marginBottom: 14 }}>
            Engajamento por setor
          </div>
          <div style={{
            background: "rgba(4,11,6,0.7)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, overflow: "hidden",
          }}>
            {stats.sectorStats.length === 0 ? (
              <p style={{ padding: "20px 20px", fontSize: 13, color: "rgba(134,239,172,0.35)", fontWeight: 300 }}>
                Nenhum dado ainda.
              </p>
            ) : (
              stats.sectorStats.map((s, i) => (
                <div key={i} className="admin-row" style={{ padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800, fontSize: 14,
                      color: "#f0faf0", textTransform: "uppercase",
                      letterSpacing: "0.3px",
                    }}>
                      {String(s.sector)}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(134,239,172,0.4)" }}>
                      {String(s.user_count)} participante(s)
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900, fontSize: 20,
                      color: "#F2B705", lineHeight: 1,
                    }}>
                      {String(s.sticker_count)}
                    </p>
                    <p style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700, fontSize: 9,
                      color: "rgba(242,183,5,0.5)",
                      letterSpacing: "1.5px", textTransform: "uppercase",
                    }}>
                      figurinhas
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({
  icon, value, label, accent, gold,
}: {
  icon: string;
  value: string;
  label: string;
  accent: string;
  gold?: boolean;
}) {
  return (
    <div style={{
      background: "rgba(4,11,6,0.7)",
      border: `1px solid ${accent}`,
      borderRadius: 16, padding: "20px 18px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -10, right: -10,
        fontSize: 60, opacity: 0.06, userSelect: "none",
        pointerEvents: "none",
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
      <p style={{
        fontFamily: "var(--font-display)",
        fontWeight: 900, fontSize: 42, lineHeight: 1,
        color: gold ? "#F2B705" : "#f0faf0",
      }}>
        {value}
      </p>
      <p style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700, fontSize: 10,
        color: "rgba(134,239,172,0.45)",
        letterSpacing: "1.5px", textTransform: "uppercase",
        marginTop: 4,
      }}>
        {label}
      </p>
    </div>
  );
}
