"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

type Props = {
  token: string;
  appUrl: string;
};

export function QrCodeDisplay({ token, appUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const url = `${appUrl}/scan?token=${token}`;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, [token, appUrl]);

  return (
    <div className="flex justify-center bg-white rounded-xl p-3">
      <canvas ref={canvasRef} />
    </div>
  );
}
