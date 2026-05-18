"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function safeJson(res: Response): Promise<Record<string, string> | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

const SECTORS = [
  "UTI",
  "Emergência",
  "Bloco Cirúrgico",
  "Centro Cirúrgico",
  "Internação Clínica",
  "Internação Cirúrgica",
  "Maternidade",
  "Neonatologia",
  "Oncologia",
  "Pediatria",
  "Pronto-Socorro",
  "Radiologia",
  "Reabilitação",
  "Farmácia",
  "Laboratório",
  "Nutrição",
  "Administrativo",
  "Outro",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: "10px",
  color: "#f0faf0",
  fontSize: "16px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
  fontFamily: "'DM Sans', sans-serif",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: 600,
  color: "rgba(134,239,172,0.55)",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  marginBottom: "7px",
  fontFamily: "'DM Sans', sans-serif",
};

function InputField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        borderColor: focused ? "rgba(242,183,5,0.55)" : "rgba(255,255,255,0.09)",
        boxShadow: focused ? "0 0 0 3px rgba(242,183,5,0.1), 0 0 12px rgba(242,183,5,0.08)" : "none",
        ...(props.disabled ? { opacity: 0.45, cursor: "not-allowed" } : {}),
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

function SelectField(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...inputStyle,
        borderColor: focused ? "rgba(242,183,5,0.55)" : "rgba(255,255,255,0.09)",
        boxShadow: focused ? "0 0 0 3px rgba(242,183,5,0.1)" : "none",
        appearance: "none",
        WebkitAppearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(134,239,172,0.5)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        paddingRight: "38px",
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [isNew, setIsNew] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) { router.push("/album"); return; }
    const data = await safeJson(res);
    if (data?.error === "Nome e setor obrigatórios no primeiro acesso") {
      setIsNew(true);
      setLoading(false);
      return;
    }
    setError(data?.error ?? "Erro ao entrar");
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !sector) { setError("Preencha todos os campos"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, sector }),
    });
    if (res.ok) { router.push("/album"); return; }
    const data = await safeJson(res);
    setError(data?.error ?? "Erro ao cadastrar");
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @keyframes lk-float {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-7px) rotate(1deg); }
        }
        @keyframes lk-pulse-glow {
          0%,100% { filter: drop-shadow(0 0 14px rgba(242,183,5,0.35)); }
          50% { filter: drop-shadow(0 0 28px rgba(242,183,5,0.65)); }
        }
        @keyframes lk-up {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes lk-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes lk-spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .lk-badge  { animation: lk-float 3.4s ease-in-out infinite, lk-pulse-glow 3.4s ease-in-out infinite; }
        .lk-a1 { animation: lk-up 0.55s 0.00s ease both; }
        .lk-a2 { animation: lk-up 0.55s 0.09s ease both; }
        .lk-a3 { animation: lk-up 0.55s 0.18s ease both; }
        .lk-a4 { animation: lk-up 0.55s 0.27s ease both; }
        .lk-btn {
          background: linear-gradient(90deg, #D4A005 0%, #F2B705 30%, #FFCF2F 55%, #F2B705 80%, #D4A005 100%);
          background-size: 250% auto;
          transition: background-position 0.55s ease, transform 0.12s ease, box-shadow 0.2s ease;
        }
        .lk-btn:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 6px 28px rgba(242,183,5,0.38);
          transform: translateY(-1px);
        }
        .lk-btn:active:not(:disabled) { transform: translateY(0) scale(0.985); }
        .lk-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #060f08 inset !important;
          -webkit-text-fill-color: #f0faf0 !important;
          caret-color: #f0faf0;
        }
        select option { background: #0d1f10; color: #f0faf0; }
        .lk-back-btn {
          background: transparent;
          border: none;
          color: rgba(134,239,172,0.5);
          font-size: 13px;
          cursor: pointer;
          padding: 8px;
          width: 100%;
          transition: color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .lk-back-btn:hover { color: rgba(134,239,172,0.85); }

        /* Grass lines — subtle */
        .lk-bg {
          background-color: #040d06;
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='32' viewBox='0 0 28 32'%3E%3Cpath d='M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z' fill='none' stroke='rgba(255,255,255,0.028)' stroke-width='0.6'/%3E%3C/svg%3E"),
            radial-gradient(ellipse 70% 55% at 50% -5%, rgba(22,163,74,0.22) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 50% 110%, rgba(34,197,94,0.07) 0%, transparent 70%);
        }
      `}</style>

      <div
        className="lk-bg"
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative arcs — stadium lights feel */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "600px", height: "300px", pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 0%, rgba(242,183,5,0.07) 0%, transparent 60%)",
        }} />

        <div style={{ width: "100%", maxWidth: "360px" }}>

          {/* ── BADGE ── */}
          <div className="lk-a1" style={{ textAlign: "center", marginBottom: "32px" }}>
            <div className="lk-badge" style={{ display: "inline-block", marginBottom: "18px" }}>
              {/* Hexagonal gold shape */}
              <svg width="88" height="100" viewBox="0 0 88 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="hexGold" x1="0" y1="0" x2="88" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFD94A" />
                    <stop offset="50%" stopColor="#F2B705" />
                    <stop offset="100%" stopColor="#C98B00" />
                  </linearGradient>
                  <linearGradient id="hexShine" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                    <stop offset="40%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                <path d="M44 2 L86 26 L86 74 L44 98 L2 74 L2 26 Z" fill="url(#hexGold)" />
                <path d="M44 2 L86 26 L86 74 L44 98 L2 74 L2 26 Z" fill="url(#hexShine)" />
                <text x="44" y="60" textAnchor="middle" fontSize="36" dominantBaseline="middle">🏆</text>
              </svg>
            </div>

            <div>
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(44px, 14vw, 58px)",
                lineHeight: 0.88,
                color: "#F2B705",
                letterSpacing: "-1px",
                textTransform: "uppercase",
                margin: 0,
              }}>
                Copa da
              </h1>
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(44px, 14vw, 58px)",
                lineHeight: 0.88,
                color: "#ffffff",
                letterSpacing: "-1px",
                textTransform: "uppercase",
                margin: 0,
              }}>
                Qualidade
              </h1>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                color: "rgba(134,239,172,0.6)",
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                marginTop: "10px",
              }}>
                Assistencial
              </p>
            </div>
          </div>

          {/* ── CARD ── */}
          <div
            className="lk-a2"
            style={{
              background: "rgba(4,13,6,0.86)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(34,197,94,0.18)",
              borderRadius: "20px",
              padding: "28px 26px",
              boxShadow: "0 28px 56px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {isNew === null ? (
              <>
                <h2 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "22px",
                  color: "#f0faf0",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  margin: "0 0 4px",
                }}>
                  Acessar álbum
                </h2>
                <p style={{
                  fontSize: "13px",
                  color: "rgba(134,239,172,0.5)",
                  marginBottom: "24px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                }}>
                  Entre com seu e-mail institucional
                </p>

                <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <label style={labelStyle}>E-mail</label>
                    <InputField
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@circulo.com.br"
                    />
                  </div>

                  {error && <ErrorBanner>{error}</ErrorBanner>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="lk-btn"
                    style={{
                      width: "100%",
                      padding: "14px",
                      border: "none",
                      borderRadius: "10px",
                      color: "#0c1a0d",
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    {loading ? "Verificando..." : "Entrar no Campo →"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "22px",
                  color: "#f0faf0",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  margin: "0 0 4px",
                }}>
                  Primeiro acesso
                </h2>
                <p style={{
                  fontSize: "13px",
                  color: "rgba(134,239,172,0.5)",
                  marginBottom: "22px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                }}>
                  Preencha para receber seu álbum
                </p>

                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={labelStyle}>E-mail</label>
                    <InputField type="text" value={email} disabled readOnly />
                  </div>

                  <div>
                    <label style={labelStyle}>Nome completo</label>
                    <InputField
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Setor / Unidade</label>
                    <SelectField
                      required
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                    >
                      <option value="">Selecione seu setor</option>
                      {SECTORS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </SelectField>
                  </div>

                  {error && <ErrorBanner>{error}</ErrorBanner>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="lk-btn"
                    style={{
                      width: "100%",
                      padding: "14px",
                      border: "none",
                      borderRadius: "10px",
                      color: "#0c1a0d",
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      marginTop: "4px",
                    }}
                  >
                    {loading ? "Criando álbum..." : "Criar Meu Álbum ⚽"}
                  </button>

                  <button
                    type="button"
                    className="lk-back-btn"
                    onClick={() => { setIsNew(null); setError(""); }}
                  >
                    ← Voltar
                  </button>
                </form>
              </>
            )}
          </div>

          {/* ── FOOTER ── */}
          <div className="lk-a3" style={{ textAlign: "center", marginTop: "22px" }}>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "10px",
              color: "rgba(134,239,172,0.3)",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
            }}>
              Hospital do Círculo &nbsp;·&nbsp; 11 Jun — 16 Jul 2026
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13px",
      color: "#fca5a5",
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.18)",
      borderRadius: "8px",
      padding: "9px 12px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <span style={{ fontSize: "15px" }}>⚠</span>
      {children}
    </div>
  );
}
