// apps/web/src/app/landingPage.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Shield, Sparkles, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 stripe-gradient" />

        <div className="container relative py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            Pagos instantáneos en la nueva economía digital
          </div>

          <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight">
            Envía dinero en segundos,
            <br />
            sin fricción ni fronteras.
          </h1>

          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg">
            Nibble es una red de pagos moderna que conecta wallets, bancos y cripto
            en un solo flujo. Rápido, seguro y diseñado para la nueva generación de internet.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button className="rounded-full px-6">
              Empezar ahora <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button variant="outline" className="rounded-full px-6">
              Ver documentación
            </Button>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="container py-20 grid md:grid-cols-3 gap-8">
        
        <div className="p-6 rounded-xl border border-border bg-card">
          <Shield className="h-6 w-6 text-primary" />
          <h3 className="mt-4 font-semibold text-lg">Seguro por diseño</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Arquitectura enfocada en seguridad, validación y trazabilidad en cada transacción.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <Zap className="h-6 w-6 text-primary" />
          <h3 className="mt-4 font-semibold text-lg">Pagos instantáneos</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Transferencias en segundos entre sistemas tradicionales y cripto.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <Globe className="h-6 w-6 text-primary" />
          <h3 className="mt-4 font-semibold text-lg">Global by default</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Diseñado para operar sin fronteras, integrando múltiples redes financieras.
          </p>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="container py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-center">
          Cómo funciona
        </h2>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="h-10 w-10 mx-auto flex items-center justify-center rounded-full bg-primary text-primary-foreground">
              1
            </div>
            <h3 className="mt-4 font-medium">Conecta tu wallet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Vincula tu cuenta bancaria o wallet cripto en segundos.
            </p>
          </div>

          <div className="text-center">
            <div className="h-10 w-10 mx-auto flex items-center justify-center rounded-full bg-primary text-primary-foreground">
              2
            </div>
            <h3 className="mt-4 font-medium">Envía o recibe</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Selecciona un destinatario y ejecuta la transferencia.
            </p>
          </div>

          <div className="text-center">
            <div className="h-10 w-10 mx-auto flex items-center justify-center rounded-full bg-primary text-primary-foreground">
              3
            </div>
            <h3 className="mt-4 font-medium">Confirmación instantánea</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Recibe confirmación en tiempo real sin intermediarios.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="container py-24">
        <div className="rounded-2xl border border-border bg-card p-12 text-center stripe-gradient">
          <h2 className="text-3xl font-semibold tracking-tight">
            Empieza a usar Nibble hoy
          </h2>

          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Construido para desarrolladores, emprendedores y la nueva economía digital.
          </p>

          <div className="mt-8">
            <Button className="rounded-full px-6">
              Crear cuenta <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}