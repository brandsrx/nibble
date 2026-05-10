"use client";

import { create } from "zustand";

export type TransferStatus =
  | "pending"
  | "transferring"
  | "paused"
  | "completed"
  | "cancelled"
  | "error";

export interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: TransferStatus;
  speed: number;
  eta: number;
  bytesSent: number;
  totalChunks: number;
  chunksSent: number;
}

export interface ChatMessage {
  id: string;
  type: "system" | "file" | "text";
  content: string;
  timestamp: number;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    transferId?: string;
  };
}

interface TransferState {
  files: FileItem[];
  messages: ChatMessage[];
  isTransferring: boolean;

  addFile: (file: FileItem) => void;
  removeFile: (id: string) => void;
  updateFileProgress: (id: string, progress: number, speed: number, eta: number, chunksSent: number) => void;
  setFileStatus: (id: string, status: TransferStatus) => void;
  clearFiles: () => void;

  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;

  setIsTransferring: (isTransferring: boolean) => void;
  reset: () => void;
}

const initialState = {
  files: [] as FileItem[],
  messages: [] as ChatMessage[],
  isTransferring: false,
};

export const useTransferStore = create<TransferState>((set) => ({
  ...initialState,

  addFile: (file) =>
    set((state) => ({ files: [...state.files, file] })),

  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    })),

  updateFileProgress: (id, progress, speed, eta, chunksSent) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, progress, speed, eta, chunksSent } : f
      ),
    })),

  setFileStatus: (id, status) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status } : f
      ),
    })),

  clearFiles: () => set({ files: [] }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  clearMessages: () => set({ messages: [] }),

  setIsTransferring: (isTransferring) => set({ isTransferring }),

  reset: () => set(initialState),
}));
