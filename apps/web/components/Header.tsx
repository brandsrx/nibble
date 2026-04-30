// apps/web/src/components/layout/header.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="px-20 flex h-16 items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
              <Zap className="h-5 w-5" />
            </div>

            <span className="text-lg font-semibold tracking-tight text-foreground">
              Nibble
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/swap"
              className="transition-colors hover:text-foreground"
            >
              Enviar
            </Link>

            <Link
              href="/about"
              className="transition-colors hover:text-foreground"
            >
              Cómo funciona
            </Link>

            <Link
              href="/docs"
              className="transition-colors hover:text-foreground"
            >
              Docs
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          
          {/* GitHub */}
          <Link
            href="https://github.com/brandsrx/nibble"
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
          >
            <FaGithub className="h-5 w-5" />
          </Link>

          {/* CTA */}
          <Link href="/swap"
            className="rounded-full px-5 shadow-sm transition-all hover:shadow-md bg-primary text-white"
          >
            Conectar
          </Link>
        </div>
      </div>
    </header>
  );
}