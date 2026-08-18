import { getToken } from './auth';
import { API_URL } from './api';

export type WSEventName =
  | 'new_message'
  | 'conversation_created'
  | 'conversation_updated'
  | 'agent_presence'
  | 'campaign_updated';

export interface WSEvent {
  event: WSEventName | string;
  tenant_id: string;
  conversation_id?: string;
  message_id?: string;
  payload?: unknown;
}

export type WSConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

type WSHandler = (event: WSEvent) => void;
type StateHandler = (state: WSConnectionState) => void;

function deriveWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL.replace(/\/$/, '');
  }
  return `${API_URL.replace(/^http/, 'ws')}/ws`;
}

const WS_URL = deriveWsUrl();

class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<WSHandler>>();
  private stateHandlers = new Set<StateHandler>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 12;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;
  private state: WSConnectionState = 'idle';

  get connectionState(): WSConnectionState {
    return this.state;
  }

  private setState(next: WSConnectionState) {
    this.state = next;
    this.stateHandlers.forEach((handler) => handler(next));
  }

  onState(handler: StateHandler): () => void {
    this.stateHandlers.add(handler);
    handler(this.state);
    return () => {
      this.stateHandlers.delete(handler);
    };
  }

  connect(token?: string): void {
    if (typeof window === 'undefined') return;
    const access = token || getToken();
    if (!access) return;

    this.shouldReconnect = true;

    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.setState(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    try {
      this.ws = new WebSocket(`${WS_URL}?access_token=${encodeURIComponent(access)}`);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.setState('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSEvent;
        if (!data || typeof data.event !== 'string') return;
        this.dispatch(data);
      } catch {
        // ignore non-JSON frames
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (this.shouldReconnect) {
        this.setState('reconnecting');
        this.scheduleReconnect();
      } else {
        this.setState('disconnected');
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
    this.ws?.close();
    this.ws = null;
    this.setState('disconnected');
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setState('disconnected');
      return;
    }
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private dispatch(event: WSEvent): void {
    this.handlers.get(event.event)?.forEach((handler) => handler(event));
    this.handlers.get('*')?.forEach((handler) => handler(event));
  }

  on(eventType: string, handler: WSHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }
}

export const wsClient = new WebSocketClient();
export type { WSHandler };
