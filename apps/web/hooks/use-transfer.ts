"use client";

import { useRef, useCallback } from "react";
import { TransferManager, type FileProgress } from "@/lib/transfer/manager";
import { useTransferStore } from "@/stores/transfer-store";
import type { DataChannelMessage } from "@/lib/webrtc/manager";

export function useTransfer() {
  const transferRef = useRef<TransferManager | null>(null);
  const sendFnRef = useRef<((msg: DataChannelMessage | ArrayBuffer) => void) | null>(null);
  const getBufferedRef = useRef<(() => number) | null>(null);
  const sendTextRef = useRef<((text: string) => void) | null>(null);
  const { addFile, updateFileProgress, setFileStatus, addMessage } =
    useTransferStore();

  const handleProgress = useCallback(
    (progress: FileProgress) => {
      updateFileProgress(
        progress.fileId,
        (progress.bytesSent / progress.fileSize) * 100,
        progress.speed,
        progress.eta,
        progress.chunksSent
      );

      if (progress.status === "completed") {
        setFileStatus(progress.fileId, "completed");
        addMessage({
          id: crypto.randomUUID(),
          type: "file",
          content: `Archivo enviado: ${progress.fileName}`,
          timestamp: Date.now(),
          metadata: {
            fileName: progress.fileName,
            fileSize: progress.fileSize,
            transferId: progress.fileId,
          },
        });
      }
    },
    [updateFileProgress, setFileStatus, addMessage]
  );

  const handleFileReceived = useCallback(
    (file: File) => {
      addMessage({
        id: crypto.randomUUID(),
        type: "file",
        content: `Archivo recibido: ${file.name}`,
        timestamp: Date.now(),
        metadata: {
          fileName: file.name,
          fileSize: file.size,
        },
      });

      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    },
    [addMessage]
  );

  const init = useCallback(
    (
      sendFn: (msg: DataChannelMessage | ArrayBuffer) => void,
      getBuffered: () => number,
      sendTextFn: (text: string) => void
    ) => {
      sendFnRef.current = sendFn;
      getBufferedRef.current = getBuffered;
      sendTextRef.current = sendTextFn;

      if (transferRef.current) return;

      transferRef.current = new TransferManager(
        (msg) => sendFnRef.current!(msg),
        () => getBufferedRef.current!(),
        handleProgress,
        handleFileReceived
      );

      const handleWebRTCMessage = (event: Event) => {
        const customEvent = event as CustomEvent;
        const msg = customEvent.detail;

        if (msg.type === "file-meta" || msg.type === "file-complete") {
          transferRef.current?.handleMessage(msg);
        } else if (msg.type === "text") {
          const { text } = msg.payload as { text: string };
          addMessage({
            id: crypto.randomUUID(),
            type: "text",
            content: text,
            timestamp: Date.now(),
          });
        }
      };

      const handleRawChunk = (event: Event) => {
        const customEvent = event as CustomEvent;
        const data = customEvent.detail as ArrayBuffer;
        transferRef.current?.handleRawChunk(data);
      };

      window.addEventListener("webrtc-message", handleWebRTCMessage);
      window.addEventListener("webrtc-raw", handleRawChunk);
    },
    [handleProgress, handleFileReceived, addMessage]
  );

  const sendFile = useCallback(
    async (file: File) => {
      if (!transferRef.current) return;

      const fileId = crypto.randomUUID();
      const totalChunks = Math.ceil(file.size / (16 * 1024));

      addFile({
        id: fileId,
        file,
        progress: 0,
        status: "pending",
        speed: 0,
        eta: 0,
        bytesSent: 0,
        totalChunks,
        chunksSent: 0,
      });

      addMessage({
        id: crypto.randomUUID(),
        type: "file",
        content: `Enviando: ${file.name}`,
        timestamp: Date.now(),
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          transferId: fileId,
        },
      });

      setFileStatus(fileId, "transferring");
      await transferRef.current.sendFile(file);
    },
    [addFile, addMessage, setFileStatus]
  );

  const sendText = useCallback((text: string) => {
    sendTextRef.current?.(text);
  }, []);

  return { init, sendFile, sendText };
}
