export type PeerId = string;
export type RoomId = string;
export type PairingCode = string;

export type PeerRole = "host" | "joiner";

export type ConnectionStatus =
  | "idle"
  | "connecting"
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

export type TransferStatus =
  | "pending"
  | "transferring"
  | "paused"
  | "completed"
  | "cancelled"
  | "error";

export interface Room {
  roomId: RoomId;
  pairingCode: PairingCode;
  hostId: PeerId;
  joinerId?: PeerId;
  createdAt: number;
  status: "waiting" | "paired" | "closed";
}

export interface DeviceInfo {
  id: PeerId;
  name: string;
  platform: string;
  userAgent: string;
}

export interface FileMeta {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  totalChunks: number;
}

export interface TransferProgress {
  fileId: string;
  fileName: string;
  fileSize: number;
  chunksReceived: number;
  totalChunks: number;
  bytesReceived: number;
  speed: number;
  eta: number;
  status: TransferStatus;
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

export type ClientSignalEvent =
  | { type: "CREATE_ROOM" }
  | { type: "JOIN_ROOM"; pairingCode: PairingCode; device: DeviceInfo }
  | { type: "OFFER"; sdp: RTCSessionDescriptionInit }
  | { type: "ANSWER"; sdp: RTCSessionDescriptionInit }
  | { type: "ICE_CANDIDATE"; candidate: RTCIceCandidateInit }
  | { type: "DEVICE_INFO"; device: DeviceInfo }
  | { type: "PONG" };

export type ServerSignalEvent =
  | { type: "ROOM_CREATED"; roomId: RoomId; pairingCode: PairingCode }
  | { type: "ROOM_JOINED"; roomId: RoomId; peerId: PeerId }
  | { type: "PEER_CONNECTED"; peerId: PeerId; device: DeviceInfo }
  | { type: "PEER_DISCONNECTED"; peerId: PeerId }
  | { type: "OFFER"; from: PeerId; sdp: RTCSessionDescriptionInit }
  | { type: "ANSWER"; from: PeerId; sdp: RTCSessionDescriptionInit }
  | { type: "ICE_CANDIDATE"; from: PeerId; candidate: RTCIceCandidateInit }
  | { type: "ROOM_CLOSED"; reason: string }
  | { type: "ERROR"; message: string; code?: string }
  | { type: "PING" };

export type SignalEvent = ClientSignalEvent | ServerSignalEvent;

export const PAIRING_CODE_LENGTH = 5;
export const ROOM_ID_LENGTH = 8;
export const ROOM_EXPIRY_MS = 5 * 60 * 1000;
export const CONNECTION_TIMEOUT_MS = 30 * 1000;
export const HEARTBEAT_INTERVAL_MS = 10 * 1000;
export const HEARTBEAT_TIMEOUT_MS = 30 * 1000;
export const CHUNK_SIZE = 16 * 1024;
export const MAX_RETRIES = 3;
export const BUFFER_THRESHOLD_LOW = 1 * 1024 * 1024;
export const BUFFER_THRESHOLD_HIGH = 4 * 1024 * 1024;
