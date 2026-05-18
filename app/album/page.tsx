import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PROTOCOLS } from "@/lib/protocols";
import { LogoutButton } from "@/components/logout-button";

async function getUserData(userId: string) {
  const [user, stickers] = await Promise.all([
    db.execute({ sql: "SELECT name, sector FROM users WHERE id = ?", args: [userId] }),
    db.execute({ sql: "SELECT protocol_id, scanned_at FROM user_stickers WHERE user_id = ?", args: [userId] }),
  ]);
  return {
    user: user.rows[0],
    collectedMap: new Map(
      stickers.rows.map((r) => [r.protocol_id as string, r.scanned_at as string])
    ),
  };
}

const EMOJI_MAP: Record<string, string> = {
  "meta-01-identificacao": "🪪",
  "meta-02-comunicacao": "📢",
  "meta-03-medicamentos": "💊",
  "meta-04-cirurgia-segura": "✂️",
  "meta-05-higiene-maos": "🧴",
  "meta-06-quedas": "🛡️",
  "meta-06-lesao-pressao": "🩹",
  "prot-dor-toracica": "❤️",
  "prot-avc": "🧠",
  "prot-dor": "💉",
  "prot-sepse": "🦠",
  "prot-deterioracao": "📈",
};

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch {
    return "Coletada";
  }
}

export default async function AlbumPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { user, collectedMap } = await getUserData(session.userId);
  const total = PROTOCOLS.length;
  const collected = collectedMap.size;
  const isComplete = collected === total;
  const name = String(user?.name ?? "Funcionário");
  const sector = String(user?.sector ?? "");
  const pct = (collected / total) * 100;

  return (
    <div className="stad-bg">
      {/* ── HEADER ── */}
      <header className="stad-a1 sticky top-0 z-20" style={{
        background: "rgba(4,10,5,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(34,197,94,0.12)",
      }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "14px 20px" }}>
          {/* User row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Avatar */}
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg, #1a4d24, #0d2e14)",
                border: "1.5px solid rgba(242,183,5,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 800, fontSize: 17, color: "#F2B705",
                flexShrink: 0,
              }}>
                {getInitial(name)}
              </div>
              <div>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800, fontSize: 16,
                  color: "#f0faf0", lineHeight: 1.1,
                  letterSpacing: "0.3px",
                }}>
                  {name}
                </p>
                <p style={{ fontSize: 11, color: "rgba(134,239,172,0.55)", letterSpacing: "0.5px" }}>
                  {sector}
                </p>
              </div>
            </div>
            <LogoutButton />
          </div>

          {/* Progress */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize: 11, fontWeight: 700,
                color: "rgba(134,239,172,0.5)",
                letterSpacing: "2px", textTransform: "uppercase",
              }}>
                Meu Álbum
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900, fontSize: 36, lineHeight: 1,
                  color: collected === 0 ? "rgba(255,255,255,0.3)" : "#F2B705",
                }}>
                  {collected}
                </span>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700, fontSize: 18,
                  color: "rgba(255,255,255,0.25)",
                }}>
                  /{total}
                </span>
              </div>
            </div>
            {isComplete && (
              <div style={{
                background: "linear-gradient(90deg, #C89B00, #F2B705)",
                borderRadius: 20, padding: "5px 14px",
                fontFamily: "var(--font-display)",
                fontWeight: 800, fontSize: 11,
                color: "#0a1a0b", letterSpacing: "1px",
                textTransform: "uppercase",
              }}>
                🏆 Completo!
              </div>
            )}
          </div>

          {/* 12 dot progress */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className={`prog-dot ${i < collected ? "filled" : ""}`} />
            ))}
          </div>
        </div>
      </header>

      {/* ── ALBUM GRID ── */}
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 48px" }}>

        {/* Metas */}
        <div className="stad-a2" style={{ marginBottom: 8 }}>
          <div className="stad-section-label" style={{ marginBottom: 16 }}>
            Metas Internacionais de Segurança
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {PROTOCOLS.filter((p) => p.category === "meta").map((protocol, i) => {
              const collectedAt = collectedMap.get(protocol.id);
              return (
                <Link key={protocol.id} href={`/album/${protocol.id}`} style={{ textDecoration: "none" }}>
                  <StickerCard
                    emoji={EMOJI_MAP[protocol.id] ?? "⭐"}
                    name={protocol.name}
                    collectedAt={collectedAt}
                    delay={i * 40}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Protocolos */}
        <div className="stad-a3" style={{ marginTop: 28, marginBottom: 8 }}>
          <div className="stad-section-label" style={{ marginBottom: 16 }}>
            Protocolos Assistenciais
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {PROTOCOLS.filter((p) => p.category === "protocolo").map((protocol, i) => {
              const collectedAt = collectedMap.get(protocol.id);
              return (
                <Link key={protocol.id} href={`/album/${protocol.id}`} style={{ textDecoration: "none" }}>
                  <StickerCard
                    emoji={EMOJI_MAP[protocol.id] ?? "⭐"}
                    name={protocol.name}
                    collectedAt={collectedAt}
                    delay={i * 40}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="stad-a4" style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700, fontSize: 10,
            color: "rgba(134,239,172,0.25)",
            letterSpacing: "2.5px", textTransform: "uppercase",
          }}>
            Hospital do Círculo · 11 Jun — 16 Jul 2026
          </p>
        </div>
      </main>
    </div>
  );
}

function StickerCard({
  emoji,
  name,
  collectedAt,
  delay,
}: {
  emoji: string;
  name: string;
  collectedAt?: string;
  delay?: number;
}) {
  const collected = !!collectedAt;

  return (
    <div
      className={collected ? "sticker-collected" : "sticker-locked"}
      style={{
        minHeight: 140,
        padding: "14px 14px 12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {collected ? (
        <>
          {/* Gold check badge */}
          <div style={{
            position: "absolute", top: 10, right: 10,
            width: 20, height: 20, borderRadius: "50%",
            background: "rgba(242,183,5,0.15)",
            border: "1px solid rgba(242,183,5,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10,
          }}>
            ✓
          </div>

          {/* Emoji */}
          <div style={{ fontSize: 38, lineHeight: 1 }}>{emoji}</div>

          {/* Name + date */}
          <div>
            <p style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800, fontSize: 12,
              color: "#f0faf0", lineHeight: 1.2,
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              marginBottom: 6,
            }}>
              {name}
            </p>
            <div style={{
              height: 1,
              background: "linear-gradient(90deg, rgba(242,183,5,0.5), transparent)",
              marginBottom: 5,
            }} />
            <p style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: 10,
              color: "#F2B705", letterSpacing: "1px",
              textTransform: "uppercase",
            }}>
              {collectedAt ? formatDate(collectedAt) : "Coletada"}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Ghost emoji */}
          <div style={{
            fontSize: 42, lineHeight: 1, opacity: 0.08,
            position: "absolute", top: 10, right: 10,
            userSelect: "none", pointerEvents: "none",
          }}>
            {emoji}
          </div>

          {/* Lock icon */}
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14,
          }}>
            🔒
          </div>

          {/* Name + cta */}
          <div>
            <p style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800, fontSize: 12,
              color: "rgba(240,250,240,0.6)",
              lineHeight: 1.2, textTransform: "uppercase",
              letterSpacing: "0.3px", marginBottom: 4,
            }}>
              {name}
            </p>
            <p style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: 9,
              color: "rgba(34,197,94,0.5)",
              letterSpacing: "1.5px", textTransform: "uppercase",
            }}>
              Escanear →
            </p>
          </div>
        </>
      )}
    </div>
  );
}
