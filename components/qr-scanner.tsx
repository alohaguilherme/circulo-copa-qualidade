"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type ScanResult = {
  ok?: boolean;
  alreadyCollected?: boolean;
  protocolId?: string;
  protocolName?: string;
  totalCollected?: number;
  error?: string;
};

type Props = {
  protocolId: string;
  onResult: (result: ScanResult) => void;
};

export function QrScanner({ protocolId, onResult }: Props) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  // Tracks whether this scanner instance has already been stopped — prevents
  // the useEffect cleanup from calling stop() on a scanner the success callback
  // already stopped, which would throw "Cannot stop, scanner is not running".
  const stoppedRef = useRef(true);

  // Keep a stable ref to onResult so the effect doesn't re-run when it changes.
  const onResultRef = useRef(onResult);
  useEffect(() => { onResultRef.current = onResult; });

  useEffect(() => {
    if (!scanning) return;

    stoppedRef.current = false;
    const scanner = new Html5Qrcode("qr-reader");

    async function safeStop() {
      if (stoppedRef.current) return;
      stoppedRef.current = true;
      try { await scanner.stop(); } catch {}
    }

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await safeStop();
          setScanning(false);

          const token = decodedText.startsWith("http")
            ? (new URL(decodedText).searchParams.get("token") ?? decodedText)
            : decodedText;

          try {
            const res = await fetch("/api/sticker/scan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
            onResultRef.current(await res.json());
          } catch {
            onResultRef.current({ error: "Erro ao processar QR code" });
          }
        },
        () => {},
      )
      .catch((err) => {
        setScanning(false);
        setError("Não foi possível acessar a câmera. Verifique as permissões.");
        console.error(err);
      });

    return () => { safeStop(); };
  }, [scanning]); // only re-run on scanning toggle — not on protocolId/onResult

  return (
    <div style={{ width: "100%" }}>
      {!scanning ? (
        <button
          onClick={() => { setError(""); setScanning(true); }}
          className="stad-gold-btn"
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 14,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Escanear QR Code
        </button>
      ) : (
        <div style={{ position: "relative" }}>
          <div
            id="qr-reader"
            style={{ width: "100%", borderRadius: 14, overflow: "hidden" }}
          />
          <button
            onClick={() => setScanning(false)}
            style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(0,0,0,0.65)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
              width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", cursor: "pointer", fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <p style={{
          marginTop: 10,
          fontSize: 13,
          color: "#fca5a5",
          textAlign: "center",
          fontFamily: "var(--font-body)",
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
