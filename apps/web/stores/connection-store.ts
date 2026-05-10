"use client";

import { create } from "zustand";

export type PeerId = string;
export type RoomId = string;
export type PairingCode = string;

export type ConnectionStatus =
  | "idle"
  | "creating-room"
  | "waiting-for-peer"
  | "joining-room"
  | "connected"
  | "disconnected"
  | "failed";

export type PeerConnectionStatus =
  | "new"
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "closed";

export interface DeviceInfo {
  id: PeerId;
  name: string;
  platform: string;
  userAgent: string;
}

export interface RoomInfo {
  roomId: RoomId;
  pairingCode: PairingCode;
  role: "host" | "joiner";
}

export interface PeerInfo {
  id: PeerId;
  device?: DeviceInfo;
}

interface ConnectionState {
  status: ConnectionStatus;
  peerConnectionStatus: PeerConnectionStatus;
  room: RoomInfo | null;
  peer: PeerInfo | null;
  error: string | null;

  setStatus: (status: ConnectionStatus) => void;
  setPeerConnectionStatus: (status: PeerConnectionStatus) => void;
  setRoom: (room: RoomInfo | null) => void;
  setPeer: (peer: PeerInfo | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  status: "idle" as ConnectionStatus,
  peerConnectionStatus: "new" as PeerConnectionStatus,
  room: null as RoomInfo | null,
  peer: null as PeerInfo | null,
  error: null as string | null,
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setPeerConnectionStatus: (peerConnectionStatus) => set({ peerConnectionStatus }),
  setRoom: (room) => set({ room }),
  setPeer: (peer) => set({ peer }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
