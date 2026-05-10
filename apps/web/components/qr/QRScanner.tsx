"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const cleanupRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    cleanupRef.current = false;

    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!mounted || cleanupRef.current) return;

        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            if (cleanupRef.current) return;
            cleanupRef.current = true;

            scanner.stop().catch(() => {});

            const match =
              decodedText.match(/[?&]code=([A-Z0-9]+)/i) ||
              decodedText.match(/^([A-Z0-9]{5})$/);
            const code = match ? match[1] : decodedText.trim();

            if (code) {
              onScan(code);
            }
          },
          () => {}
        );
      } catch {
        // Camera not available
      }
    };

    initScanner();

    return () => {
      mounted = false;
      cleanupRef.current = true;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full w-full flex flex-col items-center justify-center">
        <div
          id="qr-reader"
          ref={containerRef}
          className="w-full max-w-[400px] [&_video]:object-cover [&_video]:h-full"
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-white/30 rounded-2xl">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-2xl" />
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-12 right-6 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="absolute bottom-16 left-0 right-0 text-center z-10">
          <p className="text-white/70 text-sm">
            Escanea el código QR del otro dispositivo
          </p>
        </div>
      </div>
    </div>
  );
}
