"use client";

import { cn } from "@/lib/utils";
import type { ConnectionStatus, PeerConnectionStatus, RoomInfo, PeerInfo } from "@/stores/connection-store";
import { LogOut } from "lucide-react";

interface ConnectionBarProps {
  status: ConnectionStatus;
  peerConnectionStatus: PeerConnectionStatus;
  room: RoomInfo | null;
  peer: PeerInfo | null;
  onDisconnect: () => void;
}

export function ConnectionBar({
  peerConnectionStatus,
  peer,
  onDisconnect,
}: ConnectionBarProps) {
  const isConnected = peerConnectionStatus === "connected";

  return (
    <header className="border-b border-border bg-white dark:bg-[#0f0f0f]">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left: Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex h-2 w-2 flex-shrink-0">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full",
                isConnected && "bg-green-500",
                !isConnected && "bg-yellow-400"
              )}
            />
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isConnected && "bg-green-500 animate-pulse",
                !isConnected && "bg-yellow-400"
              )}
            />
          </div>

          <span className="text-sm font-medium text-foreground truncate">
            {isConnected
              ? `Conectado a ${peer?.device?.name || "otro dispositivo"}`
              : "Conectando..."}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Desconectar"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
