"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Copy, Check, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PairingCodeProps {
  pairingCode: string;
  onRegenerate?: () => void;
}

export function PairingCode({ pairingCode, onRegenerate }: PairingCodeProps) {
  const [copied, setCopied] = useState(false);

  const connectionUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${pairingCode}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    toast.success("Código copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#0f0f0f] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary/[0.03] border border-primary/10 flex items-center justify-center mb-6">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-medium tracking-tight">
            Vincular dispositivo
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Escanea para establecer una conexión directa P2P cifrada.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="relative p-4 rounded-2xl border border-black/[0.05] dark:border-white/[0.05] bg-white dark:bg-white/[0.02]">
            <div className="p-2 bg-white rounded-lg">
              <QRCode
                value={connectionUrl}
                size={160}
                level="H"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/[0.05] dark:border-white/[0.05]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="bg-white dark:bg-[#0f0f0f] px-2">
                O usa el código
              </span>
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full group relative flex items-center justify-between px-4 py-3 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all active:scale-[0.98]"
          >
            <span className="font-mono text-lg font-medium tracking-[0.2em]">
              {pairingCode || "......"}
            </span>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2.5">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Esperando al par...
          </span>
        </div>

        {onRegenerate && (
          <div className="mt-6">
            <Button
              variant="ghost"
              onClick={onRegenerate}
              className="w-full text-xs text-muted-foreground hover:text-foreground rounded-xl gap-2 h-9"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerar sesión
            </Button>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground/60 px-4">
        La conexión utiliza el cifrado WebRTC. Los datos no pasan por nuestros servidores.
      </p>
    </div>
  );
}
