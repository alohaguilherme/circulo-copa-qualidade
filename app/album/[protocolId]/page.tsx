"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { PROTOCOLS } from "@/lib/protocols";
import { QrScanner } from "@/components/qr-scanner";
import Link from "next/link";

type ScanResult = {
  ok?: boolean;
  alreadyCollected?: boolean;
  protocolName?: string;
  totalCollected?: number;
  error?: string;
};

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

function ProtocolContent() {
  const { protocolId } = useParams<{ protocolId: string }>();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  const protocol = PROTOCOLS.find((p) => p.id === protocolId);
  const emoji = protocol ? (EMOJI_MAP[protocol.id] ?? "⭐") : "⭐";

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;
    setLoading(true);
    fetch("/api/sticker/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((d) => { setResult(d); setLoading(false); })
      .catch(() => { setResult({ error: "Erro ao processar QR code" }); setLoading(false); });
  }, [searchParams]);

  if (!protocol) {
    return (
      <div className="stad-bg" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(134,239,172,0.6)", fontFamily: "var(--font-display)", fontSize: 18 }}>
          Protocolo não encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="stad-bg">
      {/* ── HEADER ── */}
      <header style={{ padding: "20px 20px 0", maxWidth: 520, margin: "0 auto" }}>
        <Link
          href="/album"
          className="stad-a1"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-display)",
            fontWeight: 700, fontSize: 11,
            color: "rgba(134,239,172,0.55)",
            letterSpacing: "1.5px", textTransform: "uppercase",
            textDecoration: "none",
            marginBottom: 20,
            transition: "color 0.2s",
          }}
        >
          ← Voltar ao álbum
        </Link>

        {/* Protocol hero card */}
        <div
          className="stad-a2 stad-glass"
          style={{ borderRadius: 18, padding: "20px", marginBottom: 12 }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{
              fontSize: 56, lineHeight: 1,
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
              flexShrink: 0,
            }}>
              {emoji}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700, fontSize: 10,
                color: "#F2B705",
                letterSpacing: "2px", textTransform: "uppercase",
                marginBottom: 4,
              }}>
                {protocol.category === "meta" ? "Meta Internacional" : "Protocolo Assistencial"}
              </p>
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900, fontSize: 22,
                color: "#f0faf0", lineHeight: 1.1,
                letterSpacing: "0.3px",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>
                {protocol.name}
              </h1>
              <p style={{
                fontSize: 13, color: "rgba(134,239,172,0.65)",
                lineHeight: 1.55, fontWeight: 300,
              }}>
                {protocol.description}
              </p>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div
          className="stad-a3"
          style={{
            background: "rgba(4,11,6,0.6)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: "12px 16px",
            marginBottom: 0,
          }}
        >
          <p style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700, fontSize: 9,
            color: "rgba(134,239,172,0.4)",
            letterSpacing: "2px", textTransform: "uppercase",
            marginBottom: 8,
          }}>
            Sessões disponíveis
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {protocol.sessions.map((s) => (
              <span
                key={s}
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700, fontSize: 11,
                  background: "rgba(242,183,5,0.1)",
                  border: "1px solid rgba(242,183,5,0.25)",
                  color: "#F2B705",
                  borderRadius: 20, padding: "3px 10px",
                  letterSpacing: "0.5px",
                }}
              >
                {s}/2026
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── SCANNER / RESULT ── */}
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "20px 20px 48px" }}>
        {loading ? (
          <LoadingCard />
        ) : result === null ? (
          <div className="stad-a4">
            <p style={{
              textAlign: "center",
              fontSize: 13, color: "rgba(134,239,172,0.5)",
              lineHeight: 1.6, marginBottom: 16,
              fontWeight: 300,
            }}>
              Peça ao condutor para mostrar o QR desta estação e escaneie para receber sua figurinha.
            </p>
            <QrScanner protocolId={protocolId} onResult={setResult} />
          </div>
        ) : result.error ? (
          <ErrorCard message={result.error} onRetry={() => setResult(null)} />
        ) : result.alreadyCollected ? (
          <AlreadyCollectedCard emoji={emoji} name={protocol.name} />
        ) : (
          <SuccessCard emoji={emoji} name={protocol.name} total={result.totalCollected ?? 0} />
        )}
      </main>
    </div>
  );
}

export default function ProtocolPage() {
  return (
    <Suspense fallback={
      <div className="stad-bg" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(134,239,172,0.5)", fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 2 }}>
          CARREGANDO...
        </div>
      </div>
    }>
      <ProtocolContent />
    </Suspense>
  );
}

/* ── Sub-components ── */

function LoadingCard() {
  return (
    <div style={{
      textAlign: "center", padding: "40px 20px",
      color: "rgba(134,239,172,0.5)",
      fontFamily: "var(--font-display)",
      fontSize: 14, letterSpacing: "2px",
      textTransform: "uppercase",
    }}>
      Processando...
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      background: "rgba(127,29,29,0.25)",
      border: "1px solid rgba(239,68,68,0.25)",
      borderRadius: 18, padding: "28px 24px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <p style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800, fontSize: 16,
        color: "#fca5a5", textTransform: "uppercase",
        letterSpacing: "0.5px", marginBottom: 6,
      }}>
        QR inválido
      </p>
      <p style={{ fontSize: 13, color: "rgba(252,165,165,0.7)", marginBottom: 20, fontWeight: 300 }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        className="stad-gold-btn"
        style={{ padding: "12px 28px", borderRadius: 10, fontSize: 12 }}
      >
        Tentar novamente
      </button>
    </div>
  );
}

function AlreadyCollectedCard({ emoji, name }: { emoji: string; name: string }) {
  return (
    <div style={{
      background: "rgba(120,90,0,0.2)",
      border: "1px solid rgba(242,183,5,0.3)",
      borderRadius: 18, padding: "28px 24px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>{emoji}</div>
      <p style={{
        fontFamily: "var(--font-display)",
        fontWeight: 900, fontSize: 20,
        color: "#F2B705", textTransform: "uppercase",
        letterSpacing: "0.5px", marginBottom: 4,
      }}>
        Já coletada!
      </p>
      <p style={{ fontSize: 13, color: "rgba(242,183,5,0.6)", marginBottom: 20, fontWeight: 300 }}>
        Você já tem {name} no seu álbum.
      </p>
      <Link href="/album" style={{ textDecoration: "none" }}>
        <button className="stad-gold-btn" style={{ padding: "12px 28px", borderRadius: 10, fontSize: 12 }}>
          Ver álbum
        </button>
      </Link>
    </div>
  );
}

function SuccessCard({ emoji, name, total }: { emoji: string; name: string; total: number }) {
  const isComplete = total === 12;
  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(10,28,13,0.95), rgba(6,18,8,0.95))",
      border: "1px solid rgba(242,183,5,0.35)",
      borderTop: "3px solid #F2B705",
      borderRadius: 18, padding: "32px 24px",
      textAlign: "center",
      boxShadow: "0 12px 48px rgba(0,0,0,0.5), 0 0 40px rgba(242,183,5,0.08)",
    }}>
      <div style={{ fontSize: 72, marginBottom: 4, lineHeight: 1 }}>{emoji}</div>

      <p style={{
        fontFamily: "var(--font-display)",
        fontWeight: 900, fontSize: 28,
        color: "#F2B705",
        textTransform: "uppercase",
        letterSpacing: "0.5px", lineHeight: 1,
        marginBottom: 4,
      }}>
        Figurinha coletada!
      </p>
      <p style={{ fontSize: 13, color: "rgba(134,239,172,0.6)", marginBottom: 20, fontWeight: 300 }}>
        {name}
      </p>

      {/* Progress */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12, padding: "12px 16px",
        marginBottom: 20,
      }}>
        <p style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800, fontSize: 14,
          color: isComplete ? "#F2B705" : "#f0faf0",
          letterSpacing: "0.5px",
        }}>
          {total}/12 figurinhas no álbum
        </p>
        {isComplete && (
          <p style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700, fontSize: 11,
            color: "#F2B705", letterSpacing: "1.5px",
            textTransform: "uppercase", marginTop: 4,
          }}>
            🏆 Álbum completo! Fale com a coordenação!
          </p>
        )}
      </div>

      <Link href="/album" style={{ textDecoration: "none" }}>
        <button className="stad-gold-btn" style={{ padding: "13px 32px", borderRadius: 10, fontSize: 13 }}>
          Ver álbum →
        </button>
      </Link>
    </div>
  );
}
