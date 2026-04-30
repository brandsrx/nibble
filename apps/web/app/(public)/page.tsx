// apps/web/src/app/landingPage.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, ShieldCheck, FileUp, Globe, MousePointer2, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Usamos la utilidad stripe-gradient que definimos en globals.css */}
        <div className="absolute inset-0 -z-10 stripe-gradient opacity-60" />

        <div className=" relative text-center">
          <Badge variant="outline" className="mb-6 rounded-full border-primary/20 bg-primary/5 px-4 py-1 text-sm text-primary animate-in fade-in slide-in-from-bottom-3 duration-1000">
            <Zap className="mr-2 h-3.5 w-3.5 fill-current" />
            Transferencia P2P en tiempo real
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            Tus archivos, de par en par.
            <br />
            <span className="text-primary">Byte por byte.</span>
          </h1>

          <p className="mt-8 text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            Nibble elimina los servidores intermedios. Envía archivos de cualquier tamaño
            directamente desde tu navegador usando WebRTC. Rápido, privado y Open Source.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 items-center">
            <Link href="/swap" className="rounded-full px-8 h-12 text-base bg-primary text-white font-semibold shadow-lg shadow-primary/20 flex items-center gap-2">
              Enviar un archivo <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

          </div>
        </div>
      </section>

      {/* ================= FEATURES (Minimalistas) ================= */}
      <section className="px-20 py-24 border-t border-border/40">
        <div className="grid md:grid-cols-3 gap-12">

          <div className="group space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl tracking-tight">Privacidad Total</h3>
            <p className="text-muted-foreground leading-relaxed">
              Cifrado de extremo a extremo. Los archivos viajan directamente de IP a IP, nunca tocan la nube.
            </p>
          </div>

          <div className="group space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl tracking-tight">Sin Límites</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sin restricciones de tamaño. Si tu disco y tu conexión lo permiten, Nibble puede enviarlo.
            </p>
          </div>

          <div className="group space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl tracking-tight">P2P Puro</h3>
            <p className="text-muted-foreground leading-relaxed">
              Basado en WebRTC y optimizado en Rust para garantizar una latencia mínima en cada transferencia.
            </p>
          </div>
        </div>
      </section>

      {/* ================= INTERFAZ (Placeholder de la Zona Drop) ================= */}
      <section className=" py-20">
        <div className="relative mx-auto max-w-4xl p-2 rounded-3xl border border-border/50 bg-muted/30 backdrop-blur-sm">
          <div className="rounded-[1.4rem] border-2 border-dashed border-border/60 bg-background p-12 md:p-20 text-center">
            <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-primary/5 flex items-center justify-center">
              <FileUp className="h-8 w-8 text-primary/60" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Suelta archivos para conectar</h2>
            <p className="text-muted-foreground mb-8">O haz clic para seleccionar archivos de tu sistema</p>
            <Button variant="secondary" className="rounded-full px-8">
              Seleccionar archivos
            </Button>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className=" py-32 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold tracking-tight">Empieza a compartir ahora</h2>
          <p className="text-muted-foreground text-lg">
            Gratis, sin cuentas y sin fricción. La forma más rápida de mover bytes por la red.
          </p>
          <div className="pt-4">
            <Button size="lg" className="rounded-full px-10 h-12 shadow-xl shadow-primary/25">
              Crear sala de transferencia
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}