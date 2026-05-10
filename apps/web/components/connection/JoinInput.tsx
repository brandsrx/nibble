"use client";

import { useState } from "react";
import { ArrowRight, Scan, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JoinInputProps {
  onJoin: (code: string) => void;
  onOpenScanner?: () => void;
  isLoading?: boolean;
}

export function JoinInput({ onJoin, onOpenScanner, isLoading }: JoinInputProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onJoin(code.trim().toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#0f0f0f] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary/[0.03] border border-primary/10 flex items-center justify-center mb-6">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-medium tracking-tight">
            Unirse a conexión
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Ingresa el código de conexión o escanea el código QR.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Código de conexión
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 5))}
              placeholder="AB12C"
              className="text-center font-mono text-lg tracking-[0.3em] h-12"
              maxLength={5}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={code.length < 5 || isLoading}
            className="w-full rounded-xl h-11 gap-2"
          >
            {isLoading ? "Conectando..." : "Conectar"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {onOpenScanner && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/[0.05] dark:border-white/[0.05]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="bg-white dark:bg-[#0f0f0f] px-2">
                  o
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onOpenScanner}
              className="w-full rounded-xl h-11 gap-2"
            >
              <Scan className="h-4 w-4" />
              Escanear QR
            </Button>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground/60 px-4">
        El código tiene 5 caracteres. No distingue mayúsculas.
      </p>
    </div>
  );
}
