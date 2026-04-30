"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldCheck } from "lucide-react";

export default function Page() {
  // Código mock de 6 dígitos (luego lo puedes conectar a backend)
  const code = useMemo(() => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      
      {/* Fondo sutil tipo Stripe */}
      <div className="absolute inset-0 stripe-gradient pointer-events-none" />

      <div className="relative w-full max-w-md">
        
        {/* CARD */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-8 text-center">
          
          {/* Icon / Status */}
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>

          <h1 className="mt-6 text-xl font-semibold tracking-tight">
            Conectar dispositivo
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Escanea el código QR o introduce el código en tu otro dispositivo para continuar.
          </p>

          {/* QR placeholder */}
          <div className="mt-6 flex items-center justify-center">
            <div className="h-40 w-40 rounded-xl border border-border bg-muted flex items-center justify-center relative overflow-hidden">
              
              {/* Simulación QR */}
              <div className="grid grid-cols-6 gap-[2px] opacity-40">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 ${
                      Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"
                    }`}
                  />
                ))}
              </div>

              <span className="absolute bottom-2 text-[10px] text-muted-foreground">
                QR CODE
              </span>
            </div>
          </div>

          {/* CODE */}
          <div className="mt-6">
            <p className="text-xs text-muted-foreground">
              O ingresa este código
            </p>

            <div className="mt-2 flex items-center justify-center">
              <div className="tracking-[0.3em] text-2xl font-semibold bg-muted px-6 py-3 rounded-xl border border-border">
                {code}
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Esperando conexión…
          </div>

          {/* ACTION */}
          <div className="mt-6 flex justify-center">
            <Button variant="outline" size="sm" className="rounded-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Regenerar código
            </Button>
          </div>
        </div>

        {/* SECURITY NOTE */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Esta conexión está cifrada y expira automáticamente.
        </p>
      </div>
    </div>
  );
}