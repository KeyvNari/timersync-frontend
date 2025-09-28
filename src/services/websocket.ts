// src/services/websocket.ts - Improved version
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
  user_id: number;
  connection_name: string;
  access_level: 'viewer' | 'full';
  ip_address: string;
  connected_at: string;
  is_self: boolean;
  access_token_id?: string;
}

export interface RoomInfo {
  id: number;
  name: string;
  description?: string;
  time_zone: string;
  selected_timer_id?: number | null;
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface TimerUpdateMessage extends WebSocketMessage {
  type: 'timer_update';
  timer_id: number;
  room_id: number;
  current_time_seconds: number;
  is_finished: boolean;
  is_overtime: boolean;
  overtime_seconds: number;
  is_active: boolean;
  is_paused: boolean;
  timestamp: string;
}

export interface TimerSelectedMessage extends WebSocketMessage {
  type: 'timer_selected';
  timer_id: number;
  selected_by_name: string;
  auto_selected?: boolean;
  reason?: string;
}

export interface ConnectionUpdateMessage extends WebSocketMessage {
  type: 'connection_count';
  count: number;
  current_connections?: ConnectionInfo[];
  your_connection?: ConnectionInfo;
  disconnected_connection?: {
    connection_id: string;
    connection_name: string;
  };
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;

export interface WebSocketServiceOptions {
  roomId: number;
  token?: string;
  roomToken?: string;
  tokenPassword?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private options: WebSocketServiceOptions;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private connectionId: string | null = null;
  private roomInfo: RoomInfo | null = null;
  private isConnected = false;
  private isFullyInitialized = false;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private lastPingTime: number = 0;
  private pendingMessages: WebSocketMessage[] = [];
  private connectionReadyPromise: Promise<void> | null = null;
  private connectionReadyResolve: (() => void) | null = null;

  // Connection state
  private permissions = {
    can_view: false,
    can_control: false,
    can_modify: false,
    can_view_connections: false,
  };

constructor(options: WebSocketServiceOptions) {
    this.options = {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      ...options,
    };
  }

  /**
   * Connect to the WebSocket
   */
 async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN && this.isFullyInitialized) {
      console.log('WebSocket already connected and initialized');
      return;
    }

      this.connectionReadyPromise = new Promise((resolve) => {
      this.connectionReadyResolve = resolve;
    });

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.buildWebSocketUrl();
        console.log('Connecting to WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);
        this.isConnected = false;
        this.isFullyInitialized = false;
        this.pendingMessages = [];

        this.ws.onopen = () => {
          console.log('WebSocket connection opened, waiting for server acceptance...');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          // Don't resolve yet - wait for the success message
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
          
          // Resolve the connect promise after we get the first success message
          if (!this.isFullyInitialized && this.connectionId) {
            resolve();
          }
        };


      this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.isConnected = false;
          this.isFullyInitialized = false;
          this.connectionReadyPromise = null;
          this.connectionReadyResolve = null;
          this.stopPingInterval();
          
          if (this.options.autoReconnect && this.reconnectAttempts < (this.options.maxReconnectAttempts || 10)) {
            this.scheduleReconnect();
          }
        };
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          if (!this.isFullyInitialized) {
            reject(error);
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }


   /**
   * Wait for the connection to be fully ready
   */
  private async waitForConnection(): Promise<void> {
    if (this.isFullyInitialized) {
      return;
    }
    
    if (this.connectionReadyPromise) {
      await this.connectionReadyPromise;
    }
  }
  /**
   * Disconnect from the WebSocket
   */
  disconnect(): void {
    this.options.autoReconnect = false;
    this.stopPingInterval();
    this.clearReconnectTimer();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.isConnected = false;
    this.isFullyInitialized = false;
    this.connectionId = null;
    this.roomInfo = null;
    this.pendingMessages = [];
  }

  /**
   * Send a message to the server
   */
 async send(message: WebSocketMessage): Promise<void> {
    // Special handling for identify_response - can be sent immediately
    if (message.type === 'identify_response') {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('Error sending identify response:', error);
        }
      }
      return;
    }

    // For all other messages, ensure we're fully initialized
    if (!this.isFullyInitialized) {
      console.log('Queueing message until fully initialized:', message.type);
      this.pendingMessages.push(message);
      
      // Wait for initialization to complete
      await this.waitForConnection();
      
      // If we're now initialized, send the queued message
      if (this.isFullyInitialized && this.pendingMessages.includes(message)) {
        this.pendingMessages = this.pendingMessages.filter(m => m !== message);
        this.sendNow(message);
      }
      return;
    }

    this.sendNow(message);
  }


    private sendNow(message: WebSocketMessage): void {
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
  /**
   * Send queued messages after full initialization
   */
  private sendPendingMessages(): void {
    if (this.pendingMessages.length > 0) {
      console.log(`Sending ${this.pendingMessages.length} queued messages`);
      const messages = [...this.pendingMessages];
      this.pendingMessages = [];
      
      messages.forEach(message => {
        this.sendNow(message);
      });
    }
  }
  /**
   * Add event listener for specific message types
   */
  on(messageType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(messageType)) {
      this.eventHandlers.set(messageType, new Set());
    }
    this.eventHandlers.get(messageType)!.add(handler);
  }

  /**
   * Remove event listener
   */
  off(messageType: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(messageType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(messageType);
      }
    }
  }

  /**
   * Add one-time event listener
   */
  once(messageType: string, handler: WebSocketEventHandler): void {
    const onceWrapper = (message: WebSocketMessage) => {
      handler(message);
      this.off(messageType, onceWrapper);
    };
    this.on(messageType, onceWrapper);
  }

  // Timer Control Methods
  
  /**
   * Start a timer
   */
  startTimer(timerId: number): void {
    this.send({
      type: 'timer_start',
      timer_id: timerId,
    });
  }

  /**
   * Pause a timer
   */
  pauseTimer(timerId: number): void {
    this.send({
      type: 'timer_pause',
      timer_id: timerId,
    });
  }

  /**
   * Stop/reset a timer
   */
  stopTimer(timerId: number): void {
    this.send({
      type: 'timer_stop',
      timer_id: timerId,
    });
  }

  /**
   * Select a timer for the room
   */
  selectTimer(timerId: number, timerData?: Partial<TimerData>): void {
    this.send({
      type: 'timer_selected',
      timer_id: timerId,
      timer_data: timerData || {},
    });
  }

  /**
   * Request room timers status
   */
  requestRoomTimers(): void {
    this.send({
      type: 'get_room_timers',
    });
  }

  /**
   * Request room connections list
   */
  requestConnections(): void {
    this.send({
      type: 'GET_CONNECTIONS',
    });
  }

  /**
   * Send ping to server
   */
  ping(): void {
    if (!this.isFullyInitialized) {
      return; // Don't ping until fully initialized
    }
    
    this.lastPingTime = Date.now();
    this.send({
      type: 'ping',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send identify response
   */
  sendIdentifyResponse(data: any): void {
    // This can be sent even before full initialization
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send identify response');
      return;
    }

    try {
      this.ws.send(JSON.stringify({
        type: 'identify_response',
        data,
      }));
    } catch (error) {
      console.error('Error sending identify response:', error);
    }
  }

  // Getters for connection state

  get connected(): boolean {
    return this.isConnected && this.isFullyInitialized;
  }

  get currentConnectionId(): string | null {
    return this.connectionId;
  }

  get currentRoomInfo(): RoomInfo | null {
    return this.roomInfo;
  }

  get currentPermissions() {
    return { ...this.permissions };
  }

  // Private methods

  private buildWebSocketUrl(): string {
    // Convert HTTP URL to WebSocket URL
    const baseUrl = app.apiBaseUrl.replace(/^http/, 'ws');
    const url = new URL(`${baseUrl}/api/v1/ws/room/${this.options.roomId}`);

    // Add authentication parameters
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
      
      // Handle special system messages
      if (message.type === 'success' && message.connection_id) {
        console.log('Received success message, connection fully initialized');
        this.connectionId = message.connection_id;
        this.roomInfo = message.room_info;
        this.permissions = message.permissions || this.permissions;
        this.isFullyInitialized = true;
        
        // Now that we're fully initialized, start ping interval and send queued messages
        this.startPingInterval();
        this.sendPendingMessages();
      }

      // Handle pong responses
      if (message.type === 'pong') {
        const latency = Date.now() - this.lastPingTime;
        console.log(`WebSocket latency: ${latency}ms`);
      }

      // Handle identify requests - respond immediately
      if (message.type === 'identify_request') {
        this.sendIdentifyResponse({
          timestamp: Date.now(),
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          connection_id: this.connectionId,
          client_info: {
            app_version: '1.0.0',
            platform: 'web',
          },
        });
      }

      // Emit to registered handlers
      const handlers = this.eventHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
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
        wildcardHandlers.forEach(handler => {
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
      30000 // Max 30 seconds
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

  private startPingInterval(): void {
    this.stopPingInterval();
    
    // Start with a longer initial delay to ensure server is ready
    setTimeout(() => {
      this.pingInterval = setInterval(() => {
        if (this.isFullyInitialized) {
          this.ping();
        }
      }, 30000); // Ping every 30 seconds
    }, 1000); // Wait 1 second before starting ping interval
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Create a factory function for easier instantiation
export function createWebSocketService(options: WebSocketServiceOptions): WebSocketService {
  return new WebSocketService(options);
}