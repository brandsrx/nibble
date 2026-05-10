"use client";

import { useTransferStore } from "@/stores/transfer-store";
import { File, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function TransferProgress() {
  const { files, removeFile } = useTransferStore();

  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-3 p-3 rounded-xl border border-border bg-black/[0.02] dark:bg-white/[0.02]"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/[0.06] flex items-center justify-center">
            {file.status === "completed" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : file.status === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <File className="h-4 w-4 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground/90 truncate">
              {file.file.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    file.status === "completed"
                      ? "bg-green-500"
                      : file.status === "error"
                      ? "bg-red-500"
                      : "bg-primary"
                  )}
                  style={{ width: `${file.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {file.status === "completed"
                  ? "Completado"
                  : file.status === "error"
                  ? "Error"
                  : file.status === "transferring"
                  ? `${Math.round(file.progress)}%`
                  : file.status}
              </span>
            </div>
            {file.status === "transferring" && file.speed > 0 && (
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {formatSpeed(file.speed)} · {formatEta(file.eta)}
              </p>
            )}
          </div>

          {file.status !== "completed" && (
            <button
              onClick={() => removeFile(file.id)}
              className="flex-shrink-0 p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return "0 B/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return `${parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatEta(seconds: number): string {
  if (seconds <= 0) return "completando...";
  if (seconds < 60) return `${Math.round(seconds)}s restantes`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m restantes`;
  return `${Math.round(seconds / 3600)}h restantes`;
}
