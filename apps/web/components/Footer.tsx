// apps/web/src/components/layout/footer.tsx
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="px-20 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-bold mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <span>Nibble</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Transferencia de archivos P2P de alta velocidad. 
              Privado, descentralizado y de código abierto. 
              Byte por byte, directamente entre tus dispositivos.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm">Proyecto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Seguridad</a></li>
              <li><a href="#" className="hover:text-primary">Protocolo Nyrax</a></li>
              <li><a href="#" className="hover:text-primary">Open Source</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm">Desarrollador</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://github.com/brandsrx" className="hover:text-primary">GitHub</a></li>
              <li><a href="#" className="hover:text-primary">LinkedIn</a></li>
              <li className="pt-2 text-xs text-muted-foreground/60 italic">Hecho en Bolivia 🇧🇴</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Nibble P2P. Bajo licencia MIT.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Privacidad</a>
            <a href="#" className="hover:underline">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}