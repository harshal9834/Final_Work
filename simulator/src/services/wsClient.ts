import { useTelemetryStore } from '../stores/telemetryStore';
import { ENDPOINTS } from '../lib/config';

class WSClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxDelay = 10000;
  private intentionallyClosed = false;

  connect() {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    // Use exact endpoint from config to avoid /stream/stream duplicate paths
    let url = ENDPOINTS.ws;

    try {
      this.ws = new WebSocket(url);
    } catch (e: any) {
      console.error('[WS] Failed to create WebSocket:', e.message || e);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('[WS] websocket connected');
      this.reconnectDelay = 1000; // reset backoff
      useTelemetryStore.getState().setTelemetry({ connected: true });
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'telemetry:update' || msg.type === 'TELEMETRY') {
          console.log('[WS] telemetry received');
          const ts = useTelemetryStore.getState();
          ts.setTelemetry({
            packet: msg.payload,
            packetCount: ts.packetCount + 1,
            connected: true,
            lastUpdate: Date.now(),
          });
        }
      } catch (e) {
        console.warn('[WS] Failed to parse message:', e);
      }
    };

    this.ws.onerror = (e: Event) => {
      useTelemetryStore.getState().setTelemetry({ connected: false });
    };

    this.ws.onclose = (e) => {
      console.log('[WS] websocket disconnected');
      useTelemetryStore.getState().setTelemetry({ connected: false });
      
      if (!this.intentionallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      console.log('[WS] reconnecting');
      this.connect();
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxDelay);
    }, this.reconnectDelay);
  }

  disconnect() {
    this.intentionallyClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close(1000, "Intentional disconnect");
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WSClient();
