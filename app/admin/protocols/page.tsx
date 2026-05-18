import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { QrCodeDisplay } from "./qr-code-display";

async function getProtocolsWithTokens() {
  const result = await db.execute("SELECT id, name, category, qr_token FROM protocols ORDER BY category, id");
  return result.rows as unknown as { id: string; name: string; category: string; qr_token: string }[];
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

export default async function AdminProtocolsPage() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) redirect("/admin");

  const protocols = await getProtocolsWithTokens();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const metas = protocols.filter((p) => p.category === "meta");
  const prots = protocols.filter((p) => p.category === "protocolo");

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
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/admin/dashboard"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 34, height: 34,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, color: "rgba(134,239,172,0.6)",
              textDecoration: "none", fontSize: 16,
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            ←
          </Link>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900, fontSize: 18,
              color: "#f0faf0", textTransform: "uppercase",
              letterSpacing: "0.5px", lineHeight: 1,
            }}>
              QR Codes dos Protocolos
            </h1>
            <p style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: 9,
              color: "rgba(134,239,172,0.4)",
              letterSpacing: "2px", textTransform: "uppercase", marginTop: 3,
            }}>
              Mostre ao participante para escanear
            </p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 56px" }}>
        {/* Metas */}
        <div style={{ marginBottom: 28 }}>
          <div className="stad-section-label" style={{ marginBottom: 18 }}>
            Metas Internacionais
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {metas.map((p) => (
              <QrCard key={p.id} protocol={p} appUrl={appUrl} />
            ))}
          </div>
        </div>

        {/* Protocolos */}
        <div>
          <div className="stad-section-label" style={{ marginBottom: 18 }}>
            Protocolos Assistenciais
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {prots.map((p) => (
              <QrCard key={p.id} protocol={p} appUrl={appUrl} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function QrCard({
  protocol,
  appUrl,
}: {
  protocol: { id: string; name: string; category: string; qr_token: string };
  appUrl: string;
}) {
  const emoji = EMOJI_MAP[protocol.id] ?? "⭐";
  return (
    <div style={{
      background: "rgba(4,11,6,0.75)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, padding: "18px",
      transition: "border-color 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 22 }}>{emoji}</span>
        <div>
          <p style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700, fontSize: 9,
            color: "#F2B705", letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}>
            {protocol.category === "meta" ? "Meta Internacional" : "Protocolo Assistencial"}
          </p>
          <p style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800, fontSize: 14,
            color: "#f0faf0", textTransform: "uppercase",
            letterSpacing: "0.3px", lineHeight: 1.2,
          }}>
            {protocol.name}
          </p>
        </div>
      </div>

      {/* QR Code on white bg */}
      <div style={{
        background: "#fff",
        borderRadius: 10,
        padding: 10,
        display: "flex", justifyContent: "center",
        marginBottom: 10,
      }}>
        <QrCodeDisplay token={protocol.qr_token} appUrl={appUrl} />
      </div>

      <p style={{
        fontFamily: "monospace",
        fontSize: 9, color: "rgba(134,239,172,0.25)",
        wordBreak: "break-all", lineHeight: 1.5,
      }}>
        {protocol.qr_token}
      </p>
    </div>
  );
}
