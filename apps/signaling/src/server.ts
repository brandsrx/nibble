import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import crypto from "crypto";
import {
  registerPeer,
  setPeerDevice,
  getPeer,
  updateHeartbeat,
  cleanupPeer,
  sendToPeer,
} from "./peer-connection";
import {
  createRoom,
  joinRoom,
  getRoomByPeer,
  getPeerInRoom,
  removePeer,
  cleanupExpiredRooms,
} from "./room-manager";
import type { ClientSignalEvent } from "@nibble/shared";

const PORT = parseInt(process.env.PORT || "8080", 10);
const HOST = process.env.HOST || "0.0.0.0";

export const server = Fastify({ logger: true });

server.register(fastifyWebsocket);

server.register(async (fastify) => {
  fastify.get("/health", async () => ({
    status: "ok",
    uptime: process.uptime(),
  }));

  fastify.get("/ws", { websocket: true }, (socket, req) => {
    const peerId = crypto.randomUUID();

    registerPeer(peerId, socket);

    fastify.log.info(`Peer connected: ${peerId}`);

    socket.on("message", (raw: Buffer) => {
      let data: ClientSignalEvent;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        socket.send(
          JSON.stringify({ type: "ERROR", message: "Invalid JSON payload" })
        );
        return;
      }

      try {
        handleMessage(peerId, data, socket);
      } catch (err) {
        fastify.log.error(`Error handling message from ${peerId}: ${err}`);
        socket.send(
          JSON.stringify({ type: "ERROR", message: "Internal server error" })
        );
      }
    });

    socket.on("close", () => {
      fastify.log.info(`Peer disconnected: ${peerId}`);
      const room = getRoomByPeer(peerId);
      if (room) {
        const otherPeerId = getPeerInRoom(room.roomId, peerId);
        if (otherPeerId) {
          sendToPeer(otherPeerId, {
            type: "PEER_DISCONNECTED",
            peerId,
          });
        }
        removePeer(peerId);
      }
      cleanupPeer(peerId);
    });

    socket.on("error", (err) => {
      fastify.log.error(`Socket error for ${peerId}: ${err.message}`);
    });
  });
});

function handleMessage(
  peerId: string,
  data: ClientSignalEvent,
  socket: import("ws").WebSocket
): void {
  switch (data.type) {
    case "PONG": {
      updateHeartbeat(peerId);
      break;
    }

    case "DEVICE_INFO": {
      setPeerDevice(peerId, data.device);
      socket.send(JSON.stringify({ type: "PING" }));
      break;
    }

    case "CREATE_ROOM": {
      const room = createRoom(peerId);
      socket.send(
        JSON.stringify({
          type: "ROOM_CREATED",
          roomId: room.roomId,
          pairingCode: room.pairingCode,
        })
      );
      break;
    }

    case "JOIN_ROOM": {
      const room = joinRoom(data.pairingCode, peerId);
      if (!room) {
        socket.send(
          JSON.stringify({
            type: "ERROR",
            message: "Room not found or already full",
            code: "ROOM_INVALID",
          })
        );
        return;
      }

      setPeerDevice(peerId, data.device);

      socket.send(
        JSON.stringify({
          type: "ROOM_JOINED",
          roomId: room.roomId,
          peerId: room.hostId,
        })
      );

      const hostDevice = getPeer(room.hostId)?.device;
      if (hostDevice) {
        socket.send(
          JSON.stringify({
            type: "PEER_CONNECTED",
            peerId: room.hostId,
            device: hostDevice,
          })
        );
      }

      const joinerDevice = data.device;
      sendToPeer(room.hostId, {
        type: "PEER_CONNECTED",
        peerId,
        device: joinerDevice,
      });
      break;
    }

    case "OFFER": {
      const room = getRoomByPeer(peerId);
      if (!room) {
        socket.send(
          JSON.stringify({ type: "ERROR", message: "Not in a room", code: "NOT_IN_ROOM" })
        );
        return;
      }
      const target = getPeerInRoom(room.roomId, peerId);
      if (!target) {
        socket.send(
          JSON.stringify({ type: "ERROR", message: "No peer in room", code: "NO_PEER" })
        );
        return;
      }
      sendToPeer(target, { type: "OFFER", from: peerId, sdp: data.sdp });
      break;
    }

    case "ANSWER": {
      const room = getRoomByPeer(peerId);
      if (!room) {
        socket.send(
          JSON.stringify({ type: "ERROR", message: "Not in a room", code: "NOT_IN_ROOM" })
        );
        return;
      }
      const target = getPeerInRoom(room.roomId, peerId);
      if (!target) {
        socket.send(
          JSON.stringify({ type: "ERROR", message: "No peer in room", code: "NO_PEER" })
        );
        return;
      }
      sendToPeer(target, { type: "ANSWER", from: peerId, sdp: data.sdp });
      break;
    }

    case "ICE_CANDIDATE": {
      const room = getRoomByPeer(peerId);
      if (!room) {
        socket.send(
          JSON.stringify({ type: "ERROR", message: "Not in a room", code: "NOT_IN_ROOM" })
        );
        return;
      }
      const target = getPeerInRoom(room.roomId, peerId);
      if (!target) {
        socket.send(
          JSON.stringify({ type: "ERROR", message: "No peer in room", code: "NO_PEER" })
        );
        return;
      }
      sendToPeer(target, {
        type: "ICE_CANDIDATE",
        from: peerId,
        candidate: data.candidate,
      });
      break;
    }

    default: {
      socket.send(
        JSON.stringify({
          type: "ERROR",
          message: `Unknown event type: ${(data as any).type}`,
          code: "UNKNOWN_EVENT",
        })
      );
    }
  }
}

setInterval(() => {
  const expired = cleanupExpiredRooms();
  if (expired.length > 0) {
    server.log.info(`Cleaned up ${expired.length} expired rooms`);
  }
}, 60_000);

export default server;
