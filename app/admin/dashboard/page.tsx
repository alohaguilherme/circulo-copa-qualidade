import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PROTOCOLS } from "@/lib/protocols";
import { CompletedList } from "./completed-list";

const TOTAL_PROTOCOLS = PROTOCOLS.length;

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
        SELECT user_id FROM user_stickers GROUP BY user_id HAVING COUNT(*) = ${TOTAL_PROTOCOLS}
      )
    `),
    db.execute(`
      SELECT u.id, u.name, u.sector, u.album_validated_at,
             MAX(s.scanned_at) as completed_at
      FROM users u
      JOIN user_stickers s ON s.user_id = u.id
      GROUP BY u.id
      HAVING COUNT(s.protocol_id) = ${TOTAL_PROTOCOLS}
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
        background: "rgba(255,248,242,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(251,75,0,0.15)",
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <Image
              src="/assets/logo-laranja.png"
              alt="Círculo Saúde"
              width={140}
              height={50}
              priority
              style={{ height: 32, width: "auto", objectFit: "contain", flexShrink: 0 }}
            />
            <div style={{
              width: 1, height: 32, background: "rgba(31,18,9,0.12)", flexShrink: 0,
            }} />
            <div style={{ minWidth: 0 }}>
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900, fontSize: 18,
                color: "#1F1209", textTransform: "uppercase",
                letterSpacing: "0.5px", lineHeight: 1,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                Copa da Qualidade
              </h1>
              <p style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700, fontSize: 10,
                color: "#FB4B00", letterSpacing: "2px",
                textTransform: "uppercase", marginTop: 3,
              }}>
                Painel Administrativo
              </p>
            </div>
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
            accent="rgba(251,75,0,0.55)"
          />
          <StatCard
            icon="🏆"
            value={String(stats.completedAlbums)}
            label="Álbuns completos"
            accent="rgba(251,75,0,0.55)"
            gold
          />
        </div>

        {/* ── TOP USERS ── */}
        <div className="stad-a2" style={{ marginBottom: 16 }}>
          <div className="stad-section-label" style={{ marginBottom: 14 }}>
            Mais engajados
          </div>
          <div style={{
            background: "rgba(255,248,242,0.7)",
            border: "1px solid rgba(31,18,9,0.06)",
            borderRadius: 16, overflow: "hidden",
          }}>
            {stats.topUsers.length === 0 ? (
              <p style={{
                padding: "20px 20px", fontSize: 13,
                color: "rgba(122,47,0,0.4)",
                fontFamily: "var(--font-body)", fontWeight: 300,
              }}>
                Nenhum participante ainda.
              </p>
            ) : (
              stats.topUsers.map((u, i) => {
                const pct = ((u.collected as number) / TOTAL_PROTOCOLS) * 100;
                const isTop = i === 0;
                return (
                  <div key={i} className="admin-row" style={{ padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <span style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 900, fontSize: 13,
                        color: isTop ? "#FB4B00" : "rgba(31,18,9,0.18)",
                        width: 18, flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800, fontSize: 14,
                          color: "#1F1209", textTransform: "uppercase",
                          letterSpacing: "0.3px",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {String(u.name)}
                        </p>
                        <p style={{ fontSize: 11, color: "rgba(122,47,0,0.5)" }}>
                          {String(u.sector)}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <div style={{ width: 72, height: 4, background: "rgba(31,18,9,0.06)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: pct === 100
                            ? "linear-gradient(90deg, #A53000, #FB4B00)"
                            : "rgba(251,75,0,0.6)",
                          borderRadius: 2,
                          transition: "width 0.4s ease",
                        }} />
                      </div>
                      <span style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800, fontSize: 13,
                        color: pct === 100 ? "#FB4B00" : "rgba(251,75,0,0.7)",
                        minWidth: 36, textAlign: "right",
                      }}>
                        {String(u.collected)}/{TOTAL_PROTOCOLS}
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
            background: "rgba(255,248,242,0.7)",
            border: "1px solid rgba(251,75,0,0.15)",
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
            background: "rgba(255,248,242,0.7)",
            border: "1px solid rgba(31,18,9,0.06)",
            borderRadius: 16, overflow: "hidden",
          }}>
            {stats.sectorStats.length === 0 ? (
              <p style={{ padding: "20px 20px", fontSize: 13, color: "rgba(122,47,0,0.4)", fontWeight: 300 }}>
                Nenhum dado ainda.
              </p>
            ) : (
              stats.sectorStats.map((s, i) => (
                <div key={i} className="admin-row" style={{ padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800, fontSize: 14,
                      color: "#1F1209", textTransform: "uppercase",
                      letterSpacing: "0.3px",
                    }}>
                      {String(s.sector)}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(122,47,0,0.5)" }}>
                      {String(s.user_count)} participante(s)
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900, fontSize: 20,
                      color: "#FB4B00", lineHeight: 1,
                    }}>
                      {String(s.sticker_count)}
                    </p>
                    <p style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700, fontSize: 9,
                      color: "rgba(251,75,0,0.55)",
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
      background: "rgba(255,248,242,0.7)",
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
        color: gold ? "#FB4B00" : "#1F1209",
      }}>
        {value}
      </p>
      <p style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700, fontSize: 10,
        color: "rgba(122,47,0,0.5)",
        letterSpacing: "1.5px", textTransform: "uppercase",
        marginTop: 4,
      }}>
        {label}
      </p>
    </div>
  );
}
