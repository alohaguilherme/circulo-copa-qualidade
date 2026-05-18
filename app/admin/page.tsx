"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { router.push("/admin/dashboard"); return; }
    setError("Senha incorreta");
    setLoading(false);
  }

  return (
    <div className="stad-bg" style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div className="stad-a1" style={{ width: "100%", maxWidth: 340, textAlign: "center" }}>
        {/* Badge */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 60, height: 60, borderRadius: 16,
            background: "linear-gradient(135deg, rgba(22,163,74,0.3), rgba(16,122,56,0.2))",
            border: "1px solid rgba(34,197,94,0.35)",
            fontSize: 28, marginBottom: 14,
          }}>
            🛡️
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900, fontSize: 28,
            color: "#f0faf0", textTransform: "uppercase",
            letterSpacing: "0.5px", lineHeight: 1, marginBottom: 6,
          }}>
            Painel Admin
          </h1>
          <p style={{
            fontSize: 12, color: "rgba(134,239,172,0.4)",
            letterSpacing: "1.5px", textTransform: "uppercase",
            fontFamily: "var(--font-display)", fontWeight: 700,
          }}>
            Copa da Qualidade Assistencial
          </p>
        </div>

        {/* Form */}
        <div className="stad-glass" style={{ borderRadius: 18, padding: "24px 22px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{
                display: "block", fontFamily: "var(--font-display)",
                fontWeight: 700, fontSize: 10,
                color: "rgba(134,239,172,0.5)",
                letterSpacing: "1.5px", textTransform: "uppercase",
                marginBottom: 7,
              }}>
                Senha de acesso
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${focused ? "rgba(242,183,5,0.5)" : "rgba(255,255,255,0.09)"}`,
                  boxShadow: focused ? "0 0 0 3px rgba(242,183,5,0.1)" : "none",
                  borderRadius: 10, color: "#f0faf0",
                  fontSize: 16, outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  fontFamily: "var(--font-body)",
                  letterSpacing: "3px",
                }}
              />
            </div>

            {error && (
              <div style={{
                fontSize: 13, color: "#fca5a5",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
                borderRadius: 8, padding: "8px 12px",
                textAlign: "center",
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="stad-gold-btn"
              style={{ padding: "13px", borderRadius: 10, fontSize: 13, width: "100%" }}
            >
              {loading ? "Verificando..." : "Acessar →"}
            </button>
          </form>
        </div>

        <p style={{
          marginTop: 20,
          fontFamily: "var(--font-display)",
          fontWeight: 700, fontSize: 10,
          color: "rgba(134,239,172,0.25)",
          letterSpacing: "2px", textTransform: "uppercase",
        }}>
          Hospital do Círculo · 2026
        </p>
      </div>
    </div>
  );
}
