"use client";

import { cn } from "@/lib/utils";
import type { ConnectionStatus, PeerConnectionStatus } from "@/stores/connection-store";

interface StatusBadgeProps {
  status: ConnectionStatus;
  peerStatus: PeerConnectionStatus;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  idle: { label: "Inactivo", color: "text-muted-foreground", dot: "bg-muted-foreground" },
  "creating-room": { label: "Creando sala...", color: "text-yellow-500", dot: "bg-yellow-500" },
  "waiting-for-peer": { label: "Esperando dispositivo...", color: "text-yellow-500", dot: "bg-yellow-500" },
  "joining-room": { label: "Conectando...", color: "text-yellow-500", dot: "bg-yellow-500" },
  connected: { label: "Conectado", color: "text-green-500", dot: "bg-green-500" },
  disconnected: { label: "Desconectado", color: "text-red-500", dot: "bg-red-500" },
  failed: { label: "Error", color: "text-red-500", dot: "bg-red-500" },
};

export function StatusBadge({ status, peerStatus }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.idle;
  const isConnecting = peerStatus === "connecting" || peerStatus === "new";

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-2 w-2">
        {isConnecting && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: "currentColor" }}
          />
        )}
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          config.dot,
          isConnecting && "animate-pulse"
        )} />
      </div>
      <span className={cn("text-xs font-medium", config.color)}>
        {config.label}
      </span>
    </div>
  );
}
