"use client";

import { useEffect, useRef } from "react";
import { useTransferStore, type ChatMessage } from "@/stores/transfer-store";
import { Upload, Download, Zap, Wifi, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  className?: string;
  isConnected?: boolean;
}

const messageConfig: Record<string, { icon: React.ReactNode; bgClass: string }> = {
  system: { icon: <Zap className="h-3.5 w-3.5" />, bgClass: "bg-primary/[0.06] dark:bg-primary/[0.1]" },
  file_sent: { icon: <Upload className="h-3.5 w-3.5" />, bgClass: "bg-blue-500/10" },
  file_received: { icon: <Download className="h-3.5 w-3.5" />, bgClass: "bg-green-500/10" },
  text: { icon: <MessageSquare className="h-3.5 w-3.5" />, bgClass: "bg-primary/[0.06] dark:bg-primary/[0.1]" },
};

function MessageItem({ message }: { message: ChatMessage }) {
  const isFile = message.type === "file";
  const isText = message.type === "text";

  const iconKey = isText
    ? "text"
    : isFile
    ? message.content.includes("enviado") || message.content.includes("Enviando")
      ? "file_sent"
      : "file_received"
    : "system";

  const config = messageConfig[iconKey] || messageConfig.system;

  return (
    <div className={cn(
      "flex items-start gap-3 px-4 py-2.5",
      "hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
    )}>
      <div className={cn(
        "mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-primary",
        config.bgClass
      )}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        {isText ? (
          <p className="text-sm text-foreground/90 leading-relaxed">{message.content}</p>
        ) : (
          <p className="text-sm text-foreground/90">{message.content}</p>
        )}
        {message.metadata?.fileSize && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatSize(message.metadata.fileSize)}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground/50 mt-1">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

export function ChatInterface({ className, isConnected }: ChatInterfaceProps) {
  const { messages } = useTransferStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-y-auto">
        {!isConnected && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/[0.03] border border-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-5 w-5 text-primary/60" />
            </div>
            <p className="text-sm text-muted-foreground">
              Conecta un dispositivo para comenzar
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1">
              Usa la barra superior para crear o unirte a una sala
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/[0.03] border border-primary/10 flex items-center justify-center mb-4">
              <Wifi className="h-5 w-5 text-primary/60" />
            </div>
            <p className="text-sm text-muted-foreground">
              Conectado. Envía un mensaje o un archivo
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
