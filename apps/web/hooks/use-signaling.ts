"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { SignalingClient, type ServerSignalEvent } from "@/lib/signaling/client";
import { useConnectionStore } from "@/stores/connection-store";

const SIGNALING_PORT = process.env.NEXT_PUBLIC_SIGNALING_PORT || "8080";

function getSignalingUrl(): string {
  if (typeof window === "undefined") return "ws://localhost:8080/ws";
  const hostname = window.location.hostname;
  return `ws://${hostname}:${SIGNALING_PORT}/ws`;
}

type EventHandler = (event: ServerSignalEvent) => void;

export function useSignaling(onWebRTCEvent?: EventHandler) {
  const clientRef = useRef<SignalingClient | null>(null);
  const [peerId] = useState(() => crypto.randomUUID());
  const onWebRTCEventRef = useRef(onWebRTCEvent);

  useEffect(() => {
    onWebRTCEventRef.current = onWebRTCEvent;
  });

  const {
    setStatus,
    setRoom,
    setPeer,
    setError,
    setPeerConnectionStatus,
  } = useConnectionStore();

  const handleEvent = useCallback((event: ServerSignalEvent) => {
    switch (event.type) {
      case "ROOM_CREATED":
        setRoom({
          roomId: event.roomId,
          pairingCode: event.pairingCode,
          role: "host",
        });
        setStatus("waiting-for-peer");
        break;

      case "ROOM_JOINED":
        setRoom({
          roomId: event.roomId,
          pairingCode: "",
          role: "joiner",
        });
        setPeer({ id: event.peerId });
        setPeerConnectionStatus("connecting");
        break;

      case "PEER_CONNECTED":
        setPeer({ id: event.peerId, device: event.device });
        setPeerConnectionStatus("connecting");
        setStatus("connected");
        onWebRTCEventRef.current?.(event);
        break;

      case "PEER_DISCONNECTED":
        setPeerConnectionStatus("disconnected");
        setStatus("disconnected");
        setPeer(null);
        break;

      case "ERROR":
        setError(event.message);
        break;

      case "ROOM_CLOSED":
        setStatus("disconnected");
        setRoom(null);
        setPeer(null);
        break;

      default:
        onWebRTCEventRef.current?.(event);
        break;
    }
  }, [setStatus, setRoom, setPeer, setError, setPeerConnectionStatus]);

  const connect = useCallback(() => {
    if (clientRef.current) return;

    const url = getSignalingUrl();
    clientRef.current = new SignalingClient(url, peerId, handleEvent);
    clientRef.current.connect();
  }, [handleEvent, peerId]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
  }, []);

  const createRoom = useCallback(() => {
    if (clientRef.current) {
      setStatus("creating-room");
      clientRef.current.send({ type: "CREATE_ROOM" });
    }
  }, [setStatus]);

  const sendJoinRoom = useCallback(
    (pairingCode: string) => {
      if (clientRef.current) {
        clientRef.current.send({
          type: "JOIN_ROOM",
          pairingCode,
          device: {
            id: peerId,
            name: "",
            platform: "",
            userAgent: navigator.userAgent,
          },
        });
      }
    },
    [peerId]
  );

  const sendOffer = useCallback((sdp: RTCSessionDescriptionInit) => {
    clientRef.current?.send({ type: "OFFER", sdp });
  }, []);

  const sendAnswer = useCallback((sdp: RTCSessionDescriptionInit) => {
    clientRef.current?.send({ type: "ANSWER", sdp });
  }, []);

  const sendIceCandidate = useCallback((candidate: RTCIceCandidateInit) => {
    clientRef.current?.send({ type: "ICE_CANDIDATE", candidate });
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    createRoom,
    sendJoinRoom,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    peerId,
  };
}
