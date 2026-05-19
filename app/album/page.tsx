import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PROTOCOLS, FIG_MAP } from "@/lib/protocols";
import { UserMenu } from "@/components/user-menu";

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
        background: "rgba(255,248,242,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(251,75,0,0.15)",
      }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "14px 20px" }}>
          {/* Logo + user menu */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <Image
              src="/assets/logo-laranja.png"
              alt="Círculo Saúde"
              width={140}
              height={50}
              priority
              style={{ height: 32, width: "auto", objectFit: "contain" }}
            />
            <UserMenu name={name} sector={sector} />
          </div>

          {/* Progress */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize: 11, fontWeight: 700,
                color: "rgba(122,47,0,0.6)",
                letterSpacing: "2px", textTransform: "uppercase",
              }}>
                Meu Álbum
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900, fontSize: 36, lineHeight: 1,
                  color: collected === 0 ? "rgba(31,18,9,0.28)" : "#FB4B00",
                }}>
                  {collected}
                </span>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700, fontSize: 18,
                  color: "rgba(31,18,9,0.22)",
                }}>
                  /{total}
                </span>
              </div>
            </div>
            {isComplete && (
              <div style={{
                background: "linear-gradient(90deg, #A53000, #FB4B00)",
                borderRadius: 20, padding: "5px 14px",
                fontFamily: "var(--font-display)",
                fontWeight: 800, fontSize: 11,
                color: "#FFFFFF", letterSpacing: "1px",
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
                    figSrc={FIG_MAP[protocol.id]}
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
                    figSrc={FIG_MAP[protocol.id]}
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
            color: "rgba(122,47,0,0.3)",
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
  figSrc,
  name,
  collectedAt,
  delay,
}: {
  figSrc?: string;
  name: string;
  collectedAt?: string;
  delay?: number;
}) {
  const collected = !!collectedAt;

  return (
    <div
      className={collected ? "sticker-collected" : "sticker-locked"}
      style={{
        padding: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden",
        animationDelay: delay ? `${delay}ms` : undefined,
      }}
    >
      {/* Fig image */}
      <div style={{
        position: "relative",
        width: "100%",
        aspectRatio: "3 / 5",
        borderRadius: 10,
        overflow: "hidden",
        background: "#FFF1DC",
      }}>
        {figSrc && (
          <Image
            src={figSrc}
            alt={name}
            fill
            sizes="(max-width: 520px) 50vw, 240px"
            style={{
              objectFit: "cover",
              filter: collected ? "none" : "grayscale(0.9) brightness(0.95)",
              opacity: collected ? 1 : 0.5,
              transition: "filter 0.3s, opacity 0.3s",
            }}
          />
        )}

        {collected ? (
          <div style={{
            position: "absolute", top: 8, right: 8,
            width: 24, height: 24, borderRadius: "50%",
            background: "#FB4B00",
            color: "#FFFFFF",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900,
            boxShadow: "0 2px 8px rgba(251,75,0,0.4)",
          }}>
            ✓
          </div>
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(255,248,242,0.92)",
              border: "1.5px solid rgba(251,75,0,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
              boxShadow: "0 4px 12px rgba(31,18,9,0.15)",
            }}>
              🔒
            </div>
          </div>
        )}
      </div>

      {/* Name + caption */}
      <div style={{ padding: "0 4px 2px", minHeight: 42 }}>
        <p style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800, fontSize: 11,
          color: collected ? "#1F1209" : "rgba(31,18,9,0.6)",
          lineHeight: 1.2,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          marginBottom: 3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {name}
        </p>
        <p style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700, fontSize: 9,
          color: "#FB4B00",
          letterSpacing: "1.2px",
          textTransform: "uppercase",
        }}>
          {collected ? (collectedAt ? formatDate(collectedAt) : "Coletada") : "Escanear →"}
        </p>
      </div>
    </div>
  );
}
