"use client";

import { useCallback, useRef } from "react";
import { useSignaling } from "./use-signaling";
import { useWebRTC, type SignalingCallbacks } from "./use-webrtc";
import { useTransfer } from "./use-transfer";
import { useConnectionStore } from "@/stores/connection-store";
import type { ServerSignalEvent } from "@/lib/signaling/client";

export function useRoomConnection() {
  const roleRef = useRef<"host" | "joiner" | null>(null);
  const initDoneRef = useRef(false);
  const signalingRef = useRef<SignalingCallbacks | null>(null);
  const {
    handleRemoteSdp, addIceCandidate, sendMessage, sendRaw, getBufferedAmount, sendText: webrtcSendText,
    init: webrtcInit, close: webrtcClose,
  } = useWebRTC();
  const transfer = useTransfer();

  const handleWebRTCEvent = useCallback(
    (event: ServerSignalEvent) => {
      const s = signalingRef.current;
      if (!s) return;

      switch (event.type) {
        case "OFFER": {
          if (roleRef.current === "joiner") {
            handleRemoteSdp(event.sdp, "joiner", {
              sendIceCandidate: s.sendIceCandidate,
              sendOffer: s.sendOffer,
              sendAnswer: s.sendAnswer,
            });
          }
          break;
        }
        case "ANSWER": {
          if (roleRef.current === "host") {
            handleRemoteSdp(event.sdp, "host", {
              sendIceCandidate: s.sendIceCandidate,
              sendOffer: s.sendOffer,
              sendAnswer: s.sendAnswer,
            });
          }
          break;
        }
        case "ICE_CANDIDATE": {
          addIceCandidate(event.candidate);
          break;
        }
        case "PEER_CONNECTED": {
          if (!initDoneRef.current) {
            initDoneRef.current = true;
            if (roleRef.current === "host") {
              webrtcInit("host", {
                sendIceCandidate: s.sendIceCandidate,
                sendOffer: s.sendOffer,
                sendAnswer: s.sendAnswer,
              });
            }
            transfer.init(
              (msg) => {
                if (msg instanceof ArrayBuffer) sendRaw(msg);
                else sendMessage(msg);
              },
              () => getBufferedAmount(),
              (text) => webrtcSendText(text)
            );
          }
          break;
        }
      }
    },
    [handleRemoteSdp, addIceCandidate, webrtcInit, sendMessage, sendRaw, getBufferedAmount, webrtcSendText, transfer]
  );

  const signaling = useSignaling(handleWebRTCEvent);

  if (signalingRef.current === null) {
    signalingRef.current = {
      sendOffer: signaling.sendOffer,
      sendAnswer: signaling.sendAnswer,
      sendIceCandidate: signaling.sendIceCandidate,
    };
  }

  const createRoom = useCallback(() => {
    roleRef.current = "host";
    initDoneRef.current = false;
    signaling.connect();
    signaling.createRoom();
  }, [signaling]);

  const joinRoom = useCallback(
    (pairingCode: string) => {
      roleRef.current = "joiner";
      initDoneRef.current = false;
      signaling.connect();
      signaling.sendJoinRoom(pairingCode);
    },
    [signaling]
  );

  const disconnect = useCallback(() => {
    initDoneRef.current = false;
    webrtcClose();
    signaling.disconnect();
  }, [webrtcClose, signaling]);

  const { room, peer, status, peerConnectionStatus } = useConnectionStore();

  return {
    status,
    peerConnectionStatus,
    room,
    peer,
    createRoom,
    joinRoom,
    disconnect,
    sendFile: transfer.sendFile,
    sendText: transfer.sendText,
  };
}
