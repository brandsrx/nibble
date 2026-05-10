export type PeerConnectionStatus =
  | "new"
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "closed";

export interface DataChannelMessage {
  type: "file-meta" | "file-chunk" | "file-ack" | "file-complete" | "text";
  payload: unknown;
}

export type IceCandidateCallback = (candidate: RTCIceCandidateInit) => void;
export type SdpCallback = (sdp: RTCSessionDescriptionInit) => void;
export type ConnectionStateCallback = (state: PeerConnectionStatus) => void;
export type DataChannelCallback = (channel: RTCDataChannel) => void;
export type MessageCallback = (message: DataChannelMessage) => void;

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private localDescriptionSet = false;

  private onIceCandidate: IceCandidateCallback;
  private onSdp: SdpCallback;
  private onConnectionState: ConnectionStateCallback;
  private onMessage: MessageCallback;

  private config: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  constructor(
    onIceCandidate: IceCandidateCallback,
    onSdp: SdpCallback,
    onConnectionState: ConnectionStateCallback,
    onMessage: MessageCallback
  ) {
    this.onIceCandidate = onIceCandidate;
    this.onSdp = onSdp;
    this.onConnectionState = onConnectionState;
    this.onMessage = onMessage;
  }

  async createOffer(): Promise<void> {
    this.createPeerConnection();

    this.dataChannel = this.pc!.createDataChannel("file-transfer", {
      ordered: true,
    });
    this.setupDataChannel();

    const offer = await this.pc!.createOffer();
    await this.pc!.setLocalDescription(offer);
    this.localDescriptionSet = true;

    this.onSdp(offer);

    this.flushCandidates();
  }

  async createAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    this.createPeerConnection();

    await this.pc!.setRemoteDescription(new RTCSessionDescription(sdp));

    const answer = await this.pc!.createAnswer();
    await this.pc!.setLocalDescription(answer);
    this.localDescriptionSet = true;

    this.onSdp(answer);

    this.flushCandidates();
  }

  async setRemoteSdp(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) return;
    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    this.flushCandidates();
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.pc) {
      this.pendingCandidates.push(candidate);
      return;
    }
    if (!this.pc.remoteDescription) {
      this.pendingCandidates.push(candidate);
      return;
    }
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {
      // Ignore invalid candidates
    }
  }

  sendMessage(msg: DataChannelMessage): void {
    if (this.dataChannel?.readyState === "open") {
      this.dataChannel.send(JSON.stringify(msg));
    }
  }

  sendRaw(data: ArrayBuffer): void {
    if (this.dataChannel?.readyState === "open") {
      this.dataChannel.send(data);
    }
  }

  getBufferedAmount(): number {
    return this.dataChannel?.bufferedAmount ?? 0;
  }

  getDataChannel(): RTCDataChannel | null {
    return this.dataChannel;
  }

  close(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.pendingCandidates = [];
    this.localDescriptionSet = false;
  }

  private createPeerConnection(): void {
    if (this.pc) {
      this.pc.close();
    }

    this.pc = new RTCPeerConnection(this.config);

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (this.localDescriptionSet) {
          this.onIceCandidate(event.candidate.toJSON());
        } else {
          this.pendingCandidates.push(event.candidate.toJSON());
        }
      }
    };

    this.pc.onconnectionstatechange = () => {
      this.onConnectionState(this.pc!.connectionState as PeerConnectionStatus);
    };

    this.pc.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.binaryType = "arraybuffer";

    this.dataChannel.onopen = () => {
      this.onConnectionState("connected");
    };

    this.dataChannel.onclose = () => {
      this.onConnectionState("disconnected");
    };

    this.dataChannel.onerror = () => {
      this.onConnectionState("failed");
    };

    this.dataChannel.onmessage = (event) => {
      try {
        if (typeof event.data === "string") {
          const msg = JSON.parse(event.data) as DataChannelMessage;
          this.onMessage(msg);
        } else if (event.data instanceof ArrayBuffer) {
          window.dispatchEvent(
            new CustomEvent("webrtc-raw", { detail: event.data })
          );
        }
      } catch {
        // Ignore malformed messages
      }
    };
  }

  private flushCandidates(): void {
    while (this.pendingCandidates.length > 0) {
      const candidate = this.pendingCandidates.shift()!;
      this.addIceCandidate(candidate);
    }
  }
}
