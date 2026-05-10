import type { WebSocket } from "ws";
import type { PeerId, DeviceInfo } from "@nibble/shared";
import { HEARTBEAT_INTERVAL_MS, HEARTBEAT_TIMEOUT_MS, CONNECTION_TIMEOUT_MS } from "@nibble/shared";

interface PeerState {
  ws: WebSocket;
  id: PeerId;
  device?: DeviceInfo;
  connectedAt: number;
  lastPong: number;
  heartbeatTimer?: ReturnType<typeof setInterval>;
  timeoutTimer?: ReturnType<typeof setTimeout>;
}

const peers = new Map<PeerId, PeerState>();

export function registerPeer(id: PeerId, ws: WebSocket): PeerState {
  const state: PeerState = {
    ws,
    id,
    connectedAt: Date.now(),
    lastPong: Date.now(),
  };

  peers.set(id, state);

  state.timeoutTimer = setTimeout(() => {
    if (!state.device) {
      ws.close(4001, "Connection timeout: device info not received");
      peers.delete(id);
    }
  }, CONNECTION_TIMEOUT_MS);

  state.heartbeatTimer = setInterval(() => {
    if (Date.now() - state.lastPong > HEARTBEAT_TIMEOUT_MS) {
      ws.close(4002, "Heartbeat timeout");
      cleanupPeer(id);
      return;
    }
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "PING" }));
    }
  }, HEARTBEAT_INTERVAL_MS);

  return state;
}

export function setPeerDevice(id: PeerId, device: DeviceInfo): void {
  const peer = peers.get(id);
  if (!peer) return;
  peer.device = device;
  if (peer.timeoutTimer) {
    clearTimeout(peer.timeoutTimer);
    peer.timeoutTimer = undefined;
  }
}

export function getPeer(id: PeerId): PeerState | undefined {
  return peers.get(id);
}

export function getPeerWs(id: PeerId): WebSocket | undefined {
  return peers.get(id)?.ws;
}

export function updateHeartbeat(id: PeerId): void {
  const peer = peers.get(id);
  if (peer) peer.lastPong = Date.now();
}

export function cleanupPeer(id: PeerId): void {
  const peer = peers.get(id);
  if (!peer) return;

  if (peer.heartbeatTimer) clearInterval(peer.heartbeatTimer);
  if (peer.timeoutTimer) clearTimeout(peer.timeoutTimer);

  if (peer.ws.readyState === peer.ws.OPEN || peer.ws.readyState === peer.ws.CONNECTING) {
    try {
      peer.ws.close();
    } catch {}
  }

  peers.delete(id);
}

export function getConnectedCount(): number {
  return peers.size;
}

export function sendToPeer(id: PeerId, data: unknown): boolean {
  const peer = peers.get(id);
  if (!peer || peer.ws.readyState !== peer.ws.OPEN) return false;
  try {
    peer.ws.send(JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
