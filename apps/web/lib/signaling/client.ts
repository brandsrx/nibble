export type ClientSignalEvent =
  | { type: "CREATE_ROOM" }
  | { type: "JOIN_ROOM"; pairingCode: string; device: { id: string; name: string; platform: string; userAgent: string } }
  | { type: "OFFER"; sdp: RTCSessionDescriptionInit }
  | { type: "ANSWER"; sdp: RTCSessionDescriptionInit }
  | { type: "ICE_CANDIDATE"; candidate: RTCIceCandidateInit }
  | { type: "DEVICE_INFO"; device: { id: string; name: string; platform: string; userAgent: string } }
  | { type: "PONG" };

export type ServerSignalEvent =
  | { type: "ROOM_CREATED"; roomId: string; pairingCode: string }
  | { type: "ROOM_JOINED"; roomId: string; peerId: string }
  | { type: "PEER_CONNECTED"; peerId: string; device?: { id: string; name: string; platform: string; userAgent: string } }
  | { type: "PEER_DISCONNECTED"; peerId: string }
  | { type: "OFFER"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "ANSWER"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "ICE_CANDIDATE"; from: string; candidate: RTCIceCandidateInit }
  | { type: "ROOM_CLOSED"; reason: string }
  | { type: "ERROR"; message: string; code?: string }
  | { type: "PING" };

export type SignalEventHandler = (event: ServerSignalEvent) => void;

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];
const MAX_RECONNECT_DELAY = 30000;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private url: string;
  private peerId: string;
  private eventHandler: SignalEventHandler;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;
  private isClosed = false;
  private messageQueue: ClientSignalEvent[] = [];

  constructor(url: string, peerId: string, eventHandler: SignalEventHandler) {
    this.url = url;
    this.peerId = peerId;
    this.eventHandler = eventHandler;
  }

  private flushQueue(): void {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      this.send(msg);
    }
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.isClosed = false;
    this.shouldReconnect = true;

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.send({ type: "DEVICE_INFO", device: this.getDeviceInfo() });
      this.flushQueue();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as ServerSignalEvent;
        if (data.type === "PING") {
          this.send({ type: "PONG" });
          return;
        }
        this.eventHandler(data);
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      if (this.shouldReconnect && !this.isClosed) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will handle reconnection
    };
  }

  disconnect(): void {
    this.isClosed = true;
    this.shouldReconnect = false;
    this.messageQueue = [];
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(event: ClientSignalEvent): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      this.messageQueue.push(event);
    }
  }

  private scheduleReconnect(): void {
    if (this.isClosed) return;

    const delay = Math.min(
      RECONNECT_DELAYS[this.reconnectAttempts] || MAX_RECONNECT_DELAY,
      MAX_RECONNECT_DELAY
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private getDeviceInfo() {
    return {
      id: this.peerId,
      name: this.getDeviceName(),
      platform: this.getPlatform(),
      userAgent: navigator.userAgent,
    };
  }

  private getDeviceName(): string {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) {
      const match = ua.match(/Android\s([\d.]+)/);
      return `Android ${match?.[1] ?? ""}`;
    }
    if (/iphone|ipad|ipod/i.test(ua)) {
      const match = ua.match(/OS\s([\d_]+)/);
      return `iOS ${match?.[1].replace(/_/g, ".") ?? ""}`;
    }
    if (/mac/i.test(ua)) return "Mac";
    if (/windows/i.test(ua)) return "Windows";
    if (/linux/i.test(ua)) return "Linux";
    return "Unknown Device";
  }

  private getPlatform(): string {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return "android";
    if (/iphone|ipad|ipod/i.test(ua)) return "ios";
    if (/mac/i.test(ua)) return "macos";
    if (/windows/i.test(ua)) return "windows";
    if (/linux/i.test(ua)) return "linux";
    return "unknown";
  }
}
