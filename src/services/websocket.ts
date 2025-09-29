// src/services/websocket-simple.ts
import { app } from '@/config';

export interface TimerData {
  id: number;
  title: string;
  speaker?: string | null;
  notes?: string | null;
  timer_type: 'countdown' | 'countup';
  duration_seconds?: number | null;
  current_time_seconds: number;
  is_active: boolean;
  is_paused: boolean;
  is_finished: boolean;
  is_overtime: boolean;
  overtime_seconds: number;
  room_sequence_order: number;
  started_at?: string | null;
  completed_at?: string | null;
  warning_time?: number | null;
  critical_time?: number | null;
  linked_timer_id?: number | null;
}

export interface ConnectionInfo {
  connection_id: string;
  connection_name: string;
  access_level: 'viewer' | 'full';
}

export interface DisplayConfig {
  id: number;
  name: string;
  timer_format: string;
  timer_font_family: string;
  timer_size_percent: number;
  timer_position: string;
  theme_name: string;
  [key: string]: any; // allow extra display props
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface WebSocketServiceOptions {
  roomId: number;
  token?: string;
  roomToken?: string;
  tokenPassword?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;

export class SimpleWebSocketService {
  private ws: WebSocket | null = null;
  private options: WebSocketServiceOptions;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(options: WebSocketServiceOptions) {
    this.options = {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      ...options,
    };
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.buildWebSocketUrl();
        console.log('Connecting to WebSocket:', wsUrl);

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connection opened');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.isConnected = false;

          if (
            this.options.autoReconnect &&
            this.reconnectAttempts < (this.options.maxReconnectAttempts || 10)
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.options.autoReconnect = false;
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnected = false;
  }

  send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message:', message);
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }

  on(messageType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(messageType)) {
      this.eventHandlers.set(messageType, new Set());
    }
    this.eventHandlers.get(messageType)!.add(handler);
  }

  off(messageType: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(messageType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(messageType);
      }
    }
  }

  // ------------------------
  // Client → Server messages
  // ------------------------

  // Timer control
  startTimer(timerId: number): void {
    this.send({ type: 'timer_start', timer_id: timerId });
  }

  pauseTimer(timerId: number): void {
    this.send({ type: 'timer_pause', timer_id: timerId });
  }

  stopTimer(timerId: number): void {
    this.send({ type: 'timer_stop', timer_id: timerId });
  }

  resetTimer(timerId: number): void {
    this.send({ type: 'timer_reset', timer_id: timerId });
  }

  updateTimer(timerId: number, updates: Partial<TimerData>): void {
    this.send({ type: 'timer_update', timer_id: timerId, updates });
  }

  selectTimer(timerId: number, timerData?: Partial<TimerData>): void {
    this.send({
      type: 'timer_selected',
      timer_id: timerId,
      timer_data: timerData || {},
    });
  }

  // Room management
  joinRoom(): void {
    this.send({ type: 'room_join' });
  }

  leaveRoom(): void {
    this.send({ type: 'room_leave' });
  }

  updateRoom(settings: Record<string, any>): void {
    this.send({ type: 'room_update', settings });
  }

  requestRoomTimers(): void {
    this.send({ type: 'get_room_timers' });
  }

  // Connection management
  requestConnections(): void {
    this.send({ type: 'GET_CONNECTIONS' });
  }

  // System
  identify(clientInfo: Record<string, any>): void {
    this.send({ type: 'identify_response', ...clientInfo });
  }

  ping(): void {
    this.send({ type: 'ping' });
  }

  // ------------------------
  // Helpers
  // ------------------------

  private buildWebSocketUrl(): string {
    const baseUrl = app.apiBaseUrl.replace(/^http/, 'ws');
    const url = new URL(`${baseUrl}/api/v1/ws/room/${this.options.roomId}`);

    if (this.options.token) {
      url.searchParams.set('token', this.options.token);
    }
    if (this.options.roomToken) {
      url.searchParams.set('rt', this.options.roomToken);
    }
    if (this.options.tokenPassword) {
      url.searchParams.set('tp', this.options.tokenPassword);
    }

    return url.toString();
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);

      // Emit to registered handlers
      const handlers = this.eventHandlers.get(message.type);
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(message);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });
      }

      // Emit to wildcard handlers
      const wildcardHandlers = this.eventHandlers.get('*');
      if (wildcardHandlers) {
        wildcardHandlers.forEach((handler) => {
          try {
            handler(message);
          } catch (error) {
            console.error('Error in wildcard message handler:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error, data);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.options.reconnectInterval! * Math.pow(1.5, this.reconnectAttempts - 1),
      30000
    );

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnect attempt failed:', error);
      }
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

export function createSimpleWebSocketService(
  options: WebSocketServiceOptions
): SimpleWebSocketService {
  return new SimpleWebSocketService(options);
}
