import { randomBytes } from "crypto";
import type { Room, RoomId, PeerId, PairingCode, DeviceInfo } from "@nibble/shared";
import { ROOM_EXPIRY_MS, PAIRING_CODE_LENGTH } from "@nibble/shared";

const rooms = new Map<RoomId, Room>();
const codeToRoom = new Map<PairingCode, RoomId>();
const peerToRoom = new Map<PeerId, RoomId>();

function generatePairingCode(): PairingCode {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = randomBytes(PAIRING_CODE_LENGTH);
  for (let i = 0; i < PAIRING_CODE_LENGTH; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code as PairingCode;
}

function generateRoomId(): RoomId {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  const bytes = randomBytes(8);
  for (let i = 0; i < 8; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id as RoomId;
}

export function createRoom(hostId: PeerId): Room {
  const roomId = generateRoomId();
  let pairingCode = generatePairingCode();
  while (codeToRoom.has(pairingCode)) {
    pairingCode = generatePairingCode();
  }

  const room: Room = {
    roomId,
    pairingCode,
    hostId,
    createdAt: Date.now(),
    status: "waiting",
  };

  rooms.set(roomId, room);
  codeToRoom.set(pairingCode, roomId);
  peerToRoom.set(hostId, roomId);

  return room;
}

export function joinRoom(
  pairingCode: PairingCode,
  joinerId: PeerId
): Room | null {
  const roomId = codeToRoom.get(pairingCode);
  if (!roomId) return null;

  const room = rooms.get(roomId);
  if (!room || room.status !== "waiting") return null;
  if (room.hostId === joinerId) return null;

  room.joinerId = joinerId;
  room.status = "paired";
  peerToRoom.set(joinerId, roomId);

  return room;
}

export function getRoomByPeer(peerId: PeerId): Room | undefined {
  const roomId = peerToRoom.get(peerId);
  if (!roomId) return undefined;
  return rooms.get(roomId);
}

export function getRoom(roomId: RoomId): Room | undefined {
  return rooms.get(roomId);
}

export function getRoomByCode(code: PairingCode): Room | undefined {
  const roomId = codeToRoom.get(code);
  if (!roomId) return undefined;
  return rooms.get(roomId);
}

export function getPeerInRoom(roomId: RoomId, peerId: PeerId): PeerId | undefined {
  const room = rooms.get(roomId);
  if (!room) return undefined;
  if (room.hostId === peerId) return room.joinerId;
  if (room.joinerId === peerId) return room.hostId;
  return undefined;
}

export function removePeer(peerId: PeerId): void {
  const roomId = peerToRoom.get(peerId);
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (room) {
    if (room.hostId === peerId) {
      rooms.delete(roomId);
      codeToRoom.delete(room.pairingCode);
      if (room.joinerId) peerToRoom.delete(room.joinerId);
    } else if (room.joinerId === peerId) {
      room.joinerId = undefined;
      room.status = "waiting";
    }
  }

  peerToRoom.delete(peerId);
}

export function closeRoom(roomId: RoomId): void {
  const room = rooms.get(roomId);
  if (!room) return;

  room.status = "closed";
  rooms.delete(roomId);
  codeToRoom.delete(room.pairingCode);
  peerToRoom.delete(room.hostId);
  if (room.joinerId) peerToRoom.delete(room.joinerId);
}

export function cleanupExpiredRooms(): RoomId[] {
  const now = Date.now();
  const expired: RoomId[] = [];
  for (const [roomId, room] of rooms) {
    if (now - room.createdAt > ROOM_EXPIRY_MS) {
      expired.push(roomId);
      closeRoom(roomId);
    }
  }
  return expired;
}

export function getActiveRoomCount(): number {
  return rooms.size;
}
