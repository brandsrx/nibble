"use client";

import { useState, useCallback, useEffect } from "react";
import { useRoomConnection } from "@/hooks/use-room-connection";
import { useTransferStore } from "@/stores/transfer-store";
import { ConnectionBar } from "./ConnectionBar";
import { PairingCode } from "./PairingCode";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChatInput } from "@/components/chat/ChatInput";
import { QRScanner } from "@/components/qr/QRScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wifi, UserPlus, LogOut, Loader2, Copy, Check, QrCode, File as FileIcon } from "lucide-react";
import { toast } from "sonner";

interface ConnectionHubProps {
  initialCode?: string;
}

export function ConnectionHub({ initialCode }: ConnectionHubProps) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const {
    status,
    peerConnectionStatus,
    room,
    peer,
    createRoom,
    joinRoom,
    disconnect,
    sendFile,
    sendText,
  } = useRoomConnection();

  const { addMessage } = useTransferStore();

  const isPeerConnected = peerConnectionStatus === "connected";
  const isWaiting = status === "waiting-for-peer" && room?.pairingCode;
  const isCreating = status === "creating-room";
  const isJoining = status === "joining-room";
  const isConnecting = peerConnectionStatus === "connecting";

  useEffect(() => {
    if (initialCode) {
      joinRoom(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateRoom = useCallback(() => {
    createRoom();
  }, [createRoom]);

  const handleJoinRoom = useCallback(
    (code: string) => {
      if (code) joinRoom(code);
    },
    [joinRoom]
  );

  const handleDisconnect = useCallback(() => {
    disconnect();
    setShowJoinInput(false);
    setJoinCode("");
  }, [disconnect]);

  const handleSendText = useCallback(
    (text: string) => {
      sendText?.(text);
      addMessage({
        id: crypto.randomUUID(),
        type: "text",
        content: text,
        timestamp: Date.now(),
      });
    },
    [sendText, addMessage]
  );

  const handleSendFiles = useCallback(
    (files: File[]) => {
      for (const file of files) {
        sendFile(file);
      }
      if (files.length > 1) {
        addMessage({
          id: crypto.randomUUID(),
          type: "system",
          content: `${files.length} archivos agregados a la cola`,
          timestamp: Date.now(),
        });
      }
    },
    [sendFile, addMessage]
  );

  const handleQRScan = useCallback(
    (code: string) => {
      setScannerOpen(false);
      joinRoom(code);
    },
    [joinRoom]
  );

  const copyCode = () => {
    if (!room?.pairingCode) return;
    navigator.clipboard.writeText(room.pairingCode);
    setCopied(true);
    toast.success("Código copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      handleJoinRoom(joinCode.trim().toUpperCase());
      setJoinCode("");
      setShowJoinInput(false);
    }
  };

  // --- CONNECTED VIEW ---
  if (isPeerConnected) {
    return (
      <div className="h-screen flex flex-col bg-[#fafafa] dark:bg-[#080808]">
        <ConnectionBar
          status={status}
          peerConnectionStatus={peerConnectionStatus}
          room={room}
          peer={peer}
          onDisconnect={handleDisconnect}
        />

        <div className="flex-1 overflow-hidden">
          <ChatInterface isConnected={true} />
        </div>

        {isPeerConnected && (
          <TransferProgress />
        )}

        <ChatInput
          onSendText={handleSendText}
          onSendFiles={handleSendFiles}
          disabled={false}
        />

        {/* QR Code modal */}
        {qrModalOpen && room?.pairingCode && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative">
              <PairingCode
                pairingCode={room.pairingCode}
                onRegenerate={handleCreateRoom}
              />
              <button
                onClick={() => setQrModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground/60 hover:text-foreground text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- WAITING / CONNECTING VIEW ---
  if (isWaiting || isConnecting) {
    return (
      <div className="h-screen flex flex-col bg-[#fafafa] dark:bg-[#080808]">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm mx-auto text-center">
            {room?.pairingCode && (
              <>
                <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-6">
                  Código de acceso
                </p>
                <div className="flex items-center justify-center gap-3 mb-8">
                  {room.pairingCode.split("").map((char, i) => (
                    <span
                      key={i}
                      className="w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center rounded-xl bg-white dark:bg-[#0f0f0f] border border-border text-lg sm:text-xl font-bold font-mono tracking-wider text-foreground shadow-sm"
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 mb-8">
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
                  >
                    {copied ? (
                      <><Check className="h-3.5 w-3.5 text-green-500" /> Copiado</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Copiar código</>
                    )}
                  </button>
                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5" /> Mostrar QR
                  </button>
                </div>
              </>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {isConnecting
                  ? "Estableciendo conexión segura..."
                  : "Esperando a que otro dispositivo se conecte..."}
              </span>
            </div>

            <button
              onClick={handleDisconnect}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </div>
        </div>

        {/* QR Code modal */}
        {qrModalOpen && room?.pairingCode && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative">
              <PairingCode
                pairingCode={room.pairingCode}
                onRegenerate={handleCreateRoom}
              />
              <button
                onClick={() => setQrModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground/60 hover:text-foreground text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* QR Scanner overlay */}
        {scannerOpen && (
          <QRScanner onScan={handleQRScan} onClose={() => setScannerOpen(false)} />
        )}
      </div>
    );
  }

  // --- IDLE VIEW ---
  return (
    <div className="h-screen flex flex-col bg-[#fafafa] dark:bg-[#080808]">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo / Title */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-primary/[0.06] border border-primary/10 flex items-center justify-center mx-auto mb-4">
              <Wifi className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-1">
              Nibble
            </h1>
            <p className="text-sm text-muted-foreground">
              Comparte archivos al instante, sin servidores
            </p>
          </div>

          {/* Action cards */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full p-4 rounded-xl bg-white dark:bg-[#0f0f0f] border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/[0.06] border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/[0.1] transition-colors">
                  <Wifi className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Crear una sala
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recibe archivos o comparte al instante
                  </p>
                </div>
                {isCreating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </button>

            <button
              onClick={() => setShowJoinInput(!showJoinInput)}
              className="w-full p-4 rounded-xl bg-white dark:bg-[#0f0f0f] border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/[0.06] border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/[0.1] transition-colors">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Unirse a una sala
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ingresa el código de 5 caracteres
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Join input (expandable) */}
          {showJoinInput && (
            <form onSubmit={handleJoinSubmit} className="mb-6">
              <div className="p-4 rounded-xl bg-white dark:bg-[#0f0f0f] border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Ingresa el código de acceso
                </p>
                <div className="flex gap-2">
                  <Input
                    value={joinCode}
                    onChange={(e) =>
                      setJoinCode(e.target.value.toUpperCase().slice(0, 5))
                    }
                    placeholder="Ej: XK4M9"
                    className="h-10 text-sm font-mono tracking-widest text-center uppercase"
                    maxLength={5}
                    autoFocus
                  />
                  <Button
                    type="submit"
                    disabled={joinCode.length < 5 || isJoining}
                    className="h-10 px-4"
                  >
                    {isJoining ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Conectar"
                    )}
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    Escanear código QR
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Error state */}
          {status === "failed" && (
            <p className="text-xs text-center text-red-500">
              Error al conectar. Intenta de nuevo.
            </p>
          )}
        </div>
      </div>

      {/* QR Scanner overlay */}
      {scannerOpen && (
        <QRScanner onScan={handleQRScan} onClose={() => setScannerOpen(false)} />
      )}

      {/* QR Code modal */}
      {qrModalOpen && room?.pairingCode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative">
            <PairingCode
              pairingCode={room.pairingCode}
              onRegenerate={handleCreateRoom}
            />
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground/60 hover:text-foreground text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TransferProgress() {
  const { files } = useTransferStore();
  const activeFiles = files.filter(
    (f) => f.status === "transferring" || f.status === "pending"
  );

  if (activeFiles.length === 0) return null;

  return (
    <div className="px-3 py-1.5 border-t border-border bg-white dark:bg-[#0f0f0f]">
      <div className="space-y-1">
        {activeFiles.slice(0, 2).map((file) => (
          <div key={file.id} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-5 h-5 rounded bg-primary/[0.06] flex items-center justify-center flex-shrink-0">
              <FileIcon className="h-3 w-3 text-primary" />
            </div>
            <span className="truncate flex-1">{file.file.name}</span>
            <span>{Math.round(file.progress)}%</span>
            <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${file.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
