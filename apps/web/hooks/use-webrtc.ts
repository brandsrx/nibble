"use client";

import { useRef, useCallback } from "react";
import {
  WebRTCManager,
  type DataChannelMessage,
  type PeerConnectionStatus,
  type IceCandidateCallback,
  type SdpCallback,
} from "@/lib/webrtc/manager";
import { useConnectionStore } from "@/stores/connection-store";

export interface SignalingCallbacks {
  sendIceCandidate: IceCandidateCallback;
  sendOffer: SdpCallback;
  sendAnswer: SdpCallback;
}

export function useWebRTC() {
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const { setPeerConnectionStatus } = useConnectionStore();

  const init = useCallback(
    (role: "host" | "joiner", callbacks: SignalingCallbacks) => {
      if (webrtcRef.current) {
        webrtcRef.current.close();
      }

      webrtcRef.current = new WebRTCManager(
        (c) => callbacks.sendIceCandidate(c),
        (sdp) => {
          if (role === "host") callbacks.sendOffer(sdp);
          else callbacks.sendAnswer(sdp);
        },
        (state) => setPeerConnectionStatus(state as PeerConnectionStatus),
        (msg) => {
          window.dispatchEvent(
            new CustomEvent("webrtc-message", { detail: msg })
          );
        }
      );

      if (role === "host") {
        webrtcRef.current.createOffer();
      }
    },
    [setPeerConnectionStatus]
  );

  const handleRemoteSdp = useCallback(
    async (sdp: RTCSessionDescriptionInit, role: "host" | "joiner", callbacks: SignalingCallbacks) => {
      if (!webrtcRef.current) {
        webrtcRef.current = new WebRTCManager(
          (c) => callbacks.sendIceCandidate(c),
          (sdp) => {
            if (role === "host") callbacks.sendOffer(sdp);
            else callbacks.sendAnswer(sdp);
          },
          (state) => setPeerConnectionStatus(state as PeerConnectionStatus),
          (msg) => {
            window.dispatchEvent(
              new CustomEvent("webrtc-message", { detail: msg })
            );
          }
        );
      }

      if (role === "joiner") {
        await webrtcRef.current.createAnswer(sdp);
      } else {
        await webrtcRef.current.setRemoteSdp(sdp);
      }
    },
    [setPeerConnectionStatus]
  );

  const addIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      await webrtcRef.current?.addIceCandidate(candidate);
    },
    []
  );

  const sendMessage = useCallback((msg: DataChannelMessage) => {
    webrtcRef.current?.sendMessage(msg);
  }, []);

  const sendRaw = useCallback((data: ArrayBuffer) => {
    webrtcRef.current?.sendRaw(data);
  }, []);

  const sendText = useCallback((text: string) => {
    webrtcRef.current?.sendMessage({
      type: "text",
      payload: { text },
    });
  }, []);

  const getBufferedAmount = useCallback(() => {
    return webrtcRef.current?.getBufferedAmount() ?? 0;
  }, []);

  const close = useCallback(() => {
    webrtcRef.current?.close();
    webrtcRef.current = null;
  }, []);

  return {
    init,
    handleRemoteSdp,
    addIceCandidate,
    sendMessage,
    sendRaw,
    sendText,
    getBufferedAmount,
    close,
  };
}
