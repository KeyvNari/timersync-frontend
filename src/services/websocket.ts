// src/services/websocket-simple.ts
import { app } from '@/config';

export interface TimerData {
  id: number;
  display_id: number;
  uuid: string;
  title: string;
  speaker?: string | null;
  notes?: string | null;
  timer_type: 'countdown' | 'countup';
  duration_seconds?: number | null;
  current_time_seconds: number;
  accumulated_seconds: number;
  is_active: boolean;
  is_paused: boolean;
  is_finished: boolean;
  is_stopped: boolean;
  is_overtime: boolean;
  overtime_seconds: number;
  room_sequence_order: number;
  room_id: number;
  created_by_user_id: number;
  linked_timer_id?: number | null;
  started_at?: string | null;
  paused_at?: string | null;
  completed_at?: string | null;
  actual_start_time?: string | null;
  last_calculated_at?: string | null;
  warning_time?: number | null;
  critical_time?: number | null;
  scheduled_start_time?: string | null;
  scheduled_start_date?: string | null;
  is_manual_start?: boolean;
  accumulated_pause_time: number;
  server_time: string;
  show_title: boolean;
  show_speaker: boolean;
  show_notes: boolean;
  show_clock: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  is_deleted: boolean;
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
  timer_position: 'center' | 'top' | 'bottom' | null;
  theme_name: string;
  [key: string]: any; // allow extra display props
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface RoomInfo {
  id: number;
  name: string;
  description?: string;
  selected_timer_id?: number;
  [key: string]: any;
}

export interface TimerUpdateMessage extends WebSocketMessage {
  timer_data: TimerData;
}

export interface TimerSelectedMessage extends WebSocketMessage {
  timer_id: number;
  timer_data?: Partial<TimerData>;
}

export interface ConnectionUpdateMessage extends WebSocketMessage {
  count: number;
  current_connections?: ConnectionInfo[];
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

      // Track if we've received initial acknowledgment
      let connectionAcknowledged = false;

      this.ws.onopen = () => {
        console.log('WebSocket connection opened, waiting for server acknowledgment...');
        // Don't set isConnected or resolve yet - wait for server to accept
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        // First message should be SUCCESS or connection acknowledgment
        if (!connectionAcknowledged) {
          if (message.type === 'SUCCESS' || message.type === 'success') {
            console.log('Server acknowledged connection');
            connectionAcknowledged = true;
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.handleMessage(event.data); // Process the success message
            resolve();
          } else if (message.type === 'ERROR' || message.type === 'error') {
            console.error('Connection rejected:', message);
            reject(new Error(message.message || 'Connection rejected'));
            this.ws?.close();
          }
          return;
        }

        // Process subsequent messages normally
        this.handleMessage(event.data);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.isConnected = false;

        // Reject promise if closed before acknowledgment
        if (!connectionAcknowledged) {
          reject(new Error(`Connection closed before acknowledgment: ${event.reason}`));
        }

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

      // Timeout after 10 seconds if no acknowledgment
      setTimeout(() => {
        if (!connectionAcknowledged) {
          reject(new Error('Connection timeout - no server acknowledgment'));
          this.ws?.close();
        }
      }, 10000);

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

    console.log('mydebug OUTGOING WS:', message);

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
    this.send({ type: 'timer_update', timer_id: timerId, ...updates });
  }

  deleteTimer(timerId: number): void {
    this.send({ type: 'timer_delete', timer_id: timerId });
  }

  createTimer(timerData: Partial<TimerData>): void {
  this.send({
    type: 'timer_create',
    timer_data: timerData,
  });
}

selectTimer(timerId: number, timerData?: Partial<TimerData>): void {
  this.send({
    type: 'timer_selected',
    timer_id: timerId,
    timer_data: timerData || {},
  });
}

  // Display management
  createDisplay(displayData: any): void {
    this.send({
      type: 'display_create',
      display_data: displayData,
    });
  }

  updateDisplay(displayId: number, updateData: any): void {
    this.send({
      type: 'display_update',
      display_id: displayId,
      update_data: updateData,
    });
  }

  setDefaultDisplay(displayId: number): void {
    this.send({
      type: 'set_default_display',
      display_id: displayId,
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

  sendIdentifyResponse(clientInfo: Record<string, any>): void {
    this.identify(clientInfo);
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

  console.log('🔧 Building WebSocket URL with options:', {
    hasToken: !!this.options.token,
    hasRoomToken: !!this.options.roomToken,
    hasTokenPassword: !!this.options.tokenPassword,
  });

  // Priority: roomToken > token (for viewer vs dashboard modes)
  if (this.options.roomToken) {
    url.searchParams.set('rt', this.options.roomToken);
    if (this.options.tokenPassword) {
      url.searchParams.set('tp', this.options.tokenPassword);
    }
  } else if (this.options.token) {
    url.searchParams.set('token', this.options.token);
  } else {
    console.warn('⚠️ No token provided to WebSocket connection!');
  }

  console.log('🔗 Final WebSocket URL:', url.toString());
  return url.toString();
}

private handleMessage(data: string): void {
  try {
    const message: WebSocketMessage = JSON.parse(data);

    console.log('mydebug INCOMING WS:', message);

    // Process handlers immediately without console.log in production
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }

    const wildcardHandlers = this.eventHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => handler(message));
    }
  } catch (error) {
    // Only log errors, not every message
    console.error('Error parsing WebSocket message:', error);
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
