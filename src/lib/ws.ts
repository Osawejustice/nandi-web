/**
 * WebSocket client shell for Nandi real-time updates.
 *
 * Connects with the agent's auth token, auto-reconnects with exponential
 * back-off, and dispatches events to registered handlers.
 */

type WSEventType =
  | 'new_message'
  | 'conversation_updated'
  | 'agent_status_changed'
  | 'call_started'
  | 'call_ended';

interface WSEvent {
  type: WSEventType;
  data: unknown;
  timestamp: string;
}

type WSHandler = (event: WSEvent) => void;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers = new Map<string, Set<WSHandler>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private subscriptions = new Set<string>();

  constructor(url: string) {
    this.url = url;
  }

  /** Open the WebSocket connection (call after login). */
  connect(token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${this.url}?token=${token}`);

    this.ws.onopen = () => {
      console.log('[WS] Connected');
      this.reconnectAttempts = 0;
      this.resubscribeAll();
    };

    this.ws.onmessage = (event) => {
      try {
        const data: WSEvent = JSON.parse(event.data);
        this.dispatch(data);
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('[WS] Disconnected');
      this.scheduleReconnect(token);
    };

    this.ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };
  }

  /** Gracefully close the connection (e.g. on logout). */
  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectAttempts = this.maxReconnectAttempts; // prevent reconnect
    this.ws?.close();
    this.ws = null;
  }

  private scheduleReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.reconnectTimer = setTimeout(() => this.connect(token), delay);
  }

  private dispatch(event: WSEvent): void {
    const typeHandlers = this.handlers.get(event.type);
    typeHandlers?.forEach((h) => h(event));

    const allHandlers = this.handlers.get('*');
    allHandlers?.forEach((h) => h(event));
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach((channel) => {
      this.ws?.send(JSON.stringify({ type: 'subscribe', channel }));
    });
  }

  // ── Public API ──────────────────────────────────────────────────────────

  on(eventType: string, handler: WSHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  subscribe(channel: string): void {
    this.subscriptions.add(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  }

  unsubscribe(channel: string): void {
    this.subscriptions.delete(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', channel }));
    }
  }
}

export const wsClient = new WebSocketClient(WS_URL);
export type { WSEvent, WSEventType, WSHandler };
