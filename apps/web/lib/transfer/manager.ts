import type { DataChannelMessage } from "../webrtc/manager";

export const CHUNK_SIZE = 16 * 1024;
export const BUFFER_THRESHOLD_HIGH = 4 * 1024 * 1024;
const RATE_WINDOW_MS = 2000;

export interface FileProgress {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  chunksSent: number;
  totalChunks: number;
  bytesSent: number;
  speed: number;
  eta: number;
  status: "pending" | "transferring" | "paused" | "completed" | "cancelled" | "error";
}

export type TransferProgressCallback = (progress: FileProgress) => void;
export type FileReceivedCallback = (file: File) => void;
export type ChunkReceivedCallback = (fileId: string, chunkIndex: number, totalChunks: number) => void;

export class TransferManager {
  private chunks: Map<string, ArrayBuffer[]> = new Map();
  private chunkCounts: Map<string, number> = new Map();
  private fileMetas: Map<string, { name: string; size: number; type: string; totalChunks: number }> = new Map();
  private activeTransfers: Map<string, FileProgress> = new Map();

  private send: (msg: DataChannelMessage | ArrayBuffer) => void;
  private getBufferedAmount: () => number;
  private onProgress: TransferProgressCallback;
  private onFileReceived: FileReceivedCallback;

  constructor(
    sendFn: (msg: DataChannelMessage | ArrayBuffer) => void,
    getBufferedAmount: () => number,
    onProgress: TransferProgressCallback,
    onFileReceived: FileReceivedCallback
  ) {
    this.send = sendFn;
    this.getBufferedAmount = getBufferedAmount;
    this.onProgress = onProgress;
    this.onFileReceived = onFileReceived;
  }

  async sendFile(file: File): Promise<void> {
    const fileId = crypto.randomUUID();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    const progress: FileProgress = {
      fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      chunksSent: 0,
      totalChunks,
      bytesSent: 0,
      speed: 0,
      eta: 0,
      status: "transferring",
    };

    this.activeTransfers.set(fileId, progress);

    this.send({
      type: "file-meta",
      payload: {
        fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        totalChunks,
      },
    });

    const reader = file.stream().getReader();
    let chunkIndex = 0;
    const startTime = Date.now();
    let lastTime = startTime;

    const header = new ArrayBuffer(12);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const view = new DataView(header);
        const encoder = new TextEncoder();
        const fileIdBytes = encoder.encode(fileId);
        for (let i = 0; i < 8 && i < fileIdBytes.length; i++) {
          view.setUint8(i, fileIdBytes[i] ?? 0);
        }
        view.setUint32(8, chunkIndex);

        const chunk = new Uint8Array(header.byteLength + value.byteLength);
        chunk.set(new Uint8Array(header), 0);
        chunk.set(value, 12);

        while (this.getBufferedAmount() > BUFFER_THRESHOLD_HIGH) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        this.send(chunk.buffer);

        chunkIndex++;
        progress.chunksSent = chunkIndex;
        progress.bytesSent += value.byteLength;

        const now = Date.now();
        const elapsed = now - startTime;
        if (elapsed > 0) {
          progress.speed = progress.bytesSent / (elapsed / 1000);
          if (progress.speed > 0) {
            progress.eta = (progress.fileSize - progress.bytesSent) / progress.speed;
          }
        }

        if (now - lastTime > RATE_WINDOW_MS) {
          this.onProgress({ ...progress });
          lastTime = now;
        }
      }

      progress.status = "completed";
      progress.chunksSent = totalChunks;
      progress.bytesSent = file.size;
      progress.speed = file.size / ((Date.now() - startTime) / 1000);
      progress.eta = 0;

      this.send({
        type: "file-complete",
        payload: { fileId },
      });

      this.onProgress({ ...progress });
      this.activeTransfers.delete(fileId);
    } catch {
      progress.status = "error";
      this.onProgress({ ...progress });
      this.activeTransfers.delete(fileId);
    }
  }

  handleMessage(msg: DataChannelMessage): void {
    switch (msg.type) {
      case "file-meta": {
        const meta = msg.payload as {
          fileId: string;
          name: string;
          size: number;
          type: string;
          totalChunks: number;
        };
        this.fileMetas.set(meta.fileId, meta);
        this.chunks.set(meta.fileId, []);
        this.chunkCounts.set(meta.fileId, 0);

        this.send({
          type: "file-ack",
          payload: { fileId: meta.fileId },
        });
        break;
      }

      case "file-complete": {
        const { fileId } = msg.payload as { fileId: string };
        const meta = this.fileMetas.get(fileId);
        const chunks = this.chunks.get(fileId);

        if (meta && chunks && chunks.length === meta.totalChunks) {
          const blob = new Blob(chunks, { type: meta.type });
          const file = new File([blob], meta.name, { type: meta.type });
          this.onFileReceived(file);
        }

        this.fileMetas.delete(fileId);
        this.chunks.delete(fileId);
        this.chunkCounts.delete(fileId);
        break;
      }
    }
  }

  handleRawChunk(data: ArrayBuffer): { fileId: string; chunkIndex: number } | null {
    const fileIdBytes = new Uint8Array(data.slice(0, 8));
    const fileId = new TextDecoder().decode(fileIdBytes).replace(/\0/g, "");
    const view = new DataView(data);
    const chunkIndex = view.getUint32(8);
    const chunkData = data.slice(12);

    const chunks = this.chunks.get(fileId);
    if (chunks) {
      chunks[chunkIndex] = chunkData;
      const count = this.chunkCounts.get(fileId) ?? 0;
      this.chunkCounts.set(fileId, count + 1);

      const meta = this.fileMetas.get(fileId);
      if (meta) {
        const totalChunks = meta.totalChunks;
        const received = count + 1;
        const bytesReceived = chunks.reduce((acc, c) => acc + (c?.byteLength ?? 0), 0);
        const progress: FileProgress = {
          fileId,
          fileName: meta.name,
          fileSize: meta.size,
          fileType: meta.type,
          chunksSent: received,
          totalChunks,
          bytesSent: bytesReceived,
          speed: 0,
          eta: 0,
          status: "transferring",
        };
        this.onProgress(progress);
      }
    }

    return { fileId, chunkIndex };
  }

  cancelTransfer(fileId: string): void {
    this.activeTransfers.delete(fileId);
    this.fileMetas.delete(fileId);
    this.chunks.delete(fileId);
    this.chunkCounts.delete(fileId);
  }

  getActiveTransfer(fileId: string): FileProgress | undefined {
    return this.activeTransfers.get(fileId);
  }
}
