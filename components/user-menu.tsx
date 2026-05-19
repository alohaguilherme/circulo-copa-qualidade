"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function UserMenu({ name, sector }: { name: string; sector: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu do usuário"
        aria-expanded={open}
        style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "#FB4B00",
          border: "1.5px solid rgba(251,75,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 800, fontSize: 17, color: "#FFFFFF",
          cursor: "pointer",
          boxShadow: open
            ? "0 0 0 3px rgba(251,75,0,0.18)"
            : "0 2px 8px rgba(251,75,0,0.25)",
          transition: "box-shadow 0.18s, transform 0.12s",
          flexShrink: 0,
        }}
      >
        {getInitial(name)}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 220,
            background: "#FFFFFF",
            border: "1px solid rgba(251,75,0,0.22)",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(31,18,9,0.12), 0 0 0 1px rgba(31,18,9,0.04)",
            padding: 6,
            zIndex: 30,
          }}
        >
          <div style={{ padding: "10px 12px 8px" }}>
            <p style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800, fontSize: 14,
              color: "#1F1209",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              lineHeight: 1.1,
              marginBottom: 3,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {name}
            </p>
            <p style={{
              fontSize: 11,
              color: "rgba(122,47,0,0.7)",
              letterSpacing: "0.3px",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {sector}
            </p>
          </div>

          <div style={{ height: 1, background: "rgba(31,18,9,0.06)", margin: "4px 4px 6px" }} />

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            role="menuitem"
            style={{
              width: "100%",
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              background: "transparent",
              border: "none",
              borderRadius: 8,
              cursor: loggingOut ? "default" : "pointer",
              color: "#1F1209",
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: 12,
              letterSpacing: "1px",
              textTransform: "uppercase",
              opacity: loggingOut ? 0.55 : 1,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (loggingOut) return;
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(251,75,0,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "#FB4B00";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#1F1209";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {loggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      )}
    </div>
  );
}
