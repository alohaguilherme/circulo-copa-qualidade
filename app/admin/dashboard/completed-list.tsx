"use client";

import { useState } from "react";
import { PROTOCOLS } from "@/lib/protocols";

const TOTAL_PROTOCOLS = PROTOCOLS.length;

type Completer = {
  id: string;
  name: string;
  sector: string;
  completed_at: string;
  album_validated_at: string | null;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  } catch {
    return iso;
  }
}

function ValidateButton({ user }: { user: Completer }) {
  const [validated, setValidated] = useState(!!user.album_validated_at);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch("/api/admin/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, undo: validated }),
    });
    setValidated(!validated);
    setLoading(false);
  }

  if (validated) {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        title="Clique para desfazer"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 20,
          background: "rgba(251,75,0,0.14)",
          border: "1px solid rgba(251,75,0,0.4)",
          color: "#FB4B00", cursor: "pointer",
          fontFamily: "var(--font-display)",
          fontWeight: 700, fontSize: 11,
          letterSpacing: "0.5px",
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        ✓ Validado
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 12px", borderRadius: 20,
        background: "rgba(251,75,0,0.12)",
        border: "1px solid rgba(251,75,0,0.4)",
        color: "#FB4B00", cursor: "pointer",
        fontFamily: "var(--font-display)",
        fontWeight: 700, fontSize: 11,
        letterSpacing: "0.5px",
        opacity: loading ? 0.5 : 1,
        transition: "opacity 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {loading ? "..." : "Validar →"}
    </button>
  );
}

export function CompletedList({ completers }: { completers: Completer[] }) {
  if (completers.length === 0) {
    return (
      <p style={{
        padding: "20px",
        fontSize: 13,
        color: "rgba(122,47,0,0.4)",
        fontFamily: "var(--font-body)",
        fontWeight: 300,
      }}>
        Nenhum álbum completo ainda.
      </p>
    );
  }

  return (
    <>
      {completers.map((u) => (
        <div
          key={u.id}
          className="admin-row"
          style={{
            padding: "13px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800, fontSize: 14,
                color: "#1F1209", textTransform: "uppercase",
                letterSpacing: "0.3px",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {u.name}
              </p>
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700, fontSize: 9,
                color: "#FB4B00", letterSpacing: "1px",
                background: "rgba(251,75,0,0.12)",
                padding: "2px 6px", borderRadius: 4,
                flexShrink: 0,
              }}>
                {TOTAL_PROTOCOLS}/{TOTAL_PROTOCOLS}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(122,47,0,0.5)" }}>
              {u.sector} · completo em {formatDate(u.completed_at)}
            </p>
          </div>
          <ValidateButton user={u} />
        </div>
      ))}
    </>
  );
}
