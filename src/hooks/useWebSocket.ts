// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  WebSocketService, 
  WebSocketServiceOptions, 
  WebSocketMessage, 
  TimerData, 
  ConnectionInfo, 
  RoomInfo,
  TimerUpdateMessage,
  TimerSelectedMessage,
  ConnectionUpdateMessage,
  createWebSocketService 
} from '@/services/websocket';

export interface UseWebSocketOptions extends Omit<WebSocketServiceOptions, 'roomId'> {
  enabled?: boolean;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: any) => void;
}

export interface UseWebSocketReturn {
  // Connection state
  connected: boolean;
  connectionId: string | null;
  roomInfo: RoomInfo | null;
  permissions: {
    can_view: boolean;
    can_control: boolean;
    can_modify: boolean;
    can_view_connections: boolean;
  };
  
  // Timer state
  timers: TimerData[];
  selectedTimerId: number | null;
  
  // Connection state
  connections: ConnectionInfo[];
  connectionCount: number;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Timer controls
  startTimer: (timerId: number) => void;
  pauseTimer: (timerId: number) => void;
  stopTimer: (timerId: number) => void;
  selectTimer: (timerId: number, timerData?: Partial<TimerData>) => void;
  
  // Room actions
  refreshTimers: () => void;
  refreshConnections: () => void;
  sendIdentifyResponse: (data: any) => void;
  
  // Event handlers
  addEventListener: (type: string, handler: (message: WebSocketMessage) => void) => void;
  removeEventListener: (type: string, handler: (message: WebSocketMessage) => void) => void;
}

export function useWebSocket(roomId: number, options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { enabled = true, onConnectionChange, onError, ...wsOptions } = options;
  
  // WebSocket service instance
  const wsServiceRef = useRef<WebSocketService | null>(null);
  
  // Connection state
  const [connected, setConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [permissions, setPermissions] = useState({
    can_view: false,
    can_control: false,
    can_modify: false,
    can_view_connections: false,
  });
  
  // Timer state
  const [timers, setTimers] = useState<TimerData[]>([]);
  const [selectedTimerId, setSelectedTimerId] = useState<number | null>(null);
  
  // Connection state
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);

  // Initialize WebSocket service
  useEffect(() => {
    if (!enabled || !roomId) return;

    const wsService = createWebSocketService({
      roomId,
      ...wsOptions,
    });

    wsServiceRef.current = wsService;

    // Set up event handlers
    const handleConnectionOpen = (message: WebSocketMessage) => {
      if (message.type === 'success' && message.connection_id) {
        setConnected(true);
        setConnectionId(message.connection_id);
        setRoomInfo(message.room_info || null);
        setPermissions(message.permissions || permissions);
        setSelectedTimerId(message.room_info?.selected_timer_id || null);
        onConnectionChange?.(true);
      }
    };

    const handleTimerUpdate = (message: TimerUpdateMessage) => {
      setTimers(prev => prev.map(timer => 
        timer.id === message.timer_id 
          ? {
              ...timer,
              current_time_seconds: message.current_time_seconds,
              is_active: message.is_active,
              is_paused: message.is_paused,
              is_finished: message.is_finished,
              is_overtime: message.is_overtime,
              overtime_seconds: message.overtime_seconds,
            }
          : timer
      ));
    };

    const handleTimerSelected = (message: TimerSelectedMessage) => {
      setSelectedTimerId(message.timer_id);
    };

    const handleRoomTimers = (message: WebSocketMessage) => {
      if (message.type === 'ROOM_TIMERS_STATUS' || message.type === 'INITIAL_ROOM_TIMERS') {
        setTimers(message.timers || []);
        if (message.selected_timer_id !== undefined) {
          setSelectedTimerId(message.selected_timer_id);
        }
      }
    };

    const handleConnectionUpdate = (message: ConnectionUpdateMessage) => {
      setConnectionCount(message.count);
      if (message.current_connections) {
        setConnections(message.current_connections);
      }
    };

    const handleConnectionsList = (message: WebSocketMessage) => {
      if (message.type === 'CONNECTIONS_LIST') {
        setConnections(message.connections || []);
        setConnectionCount(message.total_count || 0);
      }
    };

    const handleError = (message: WebSocketMessage) => {
      if (message.type === 'error') {
        console.error('WebSocket error:', message.message);
        onError?.(new Error(message.message));
      }
    };

    const handlePong = (message: WebSocketMessage) => {
      if (message.type === 'pong') {
        // Connection is alive
        setConnected(true);
      }
    };

    const handleIdentifyRequest = (message: WebSocketMessage) => {
      if (message.type === 'identify_request') {
        // Auto-respond to identify requests
        wsService.sendIdentifyResponse({
          timestamp: Date.now(),
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          connection_id: connectionId,
        });
      }
    };

    // Register event handlers
    wsService.on('success', handleConnectionOpen);
    wsService.on('timer_update', handleTimerUpdate);
    wsService.on('timer_selected', handleTimerSelected);
    wsService.on('ROOM_TIMERS_STATUS', handleRoomTimers);
    wsService.on('INITIAL_ROOM_TIMERS', handleRoomTimers);
    wsService.on('connection_count', handleConnectionUpdate);
    wsService.on('CONNECTIONS_LIST', handleConnectionsList);
    wsService.on('error', handleError);
    wsService.on('pong', handlePong);
    wsService.on('identify_request', handleIdentifyRequest);

    // Handle connection close
    const originalDisconnect = wsService.disconnect.bind(wsService);
    wsService.disconnect = () => {
      setConnected(false);
      setConnectionId(null);
      setRoomInfo(null);
      setTimers([]);
      setConnections([]);
      setConnectionCount(0);
      onConnectionChange?.(false);
      originalDisconnect();
    };

    return () => {
      wsService.disconnect();
      wsServiceRef.current = null;
    };
  }, [roomId, enabled, JSON.stringify(wsOptions)]);

  // Auto-connect when enabled
  useEffect(() => {
    if (enabled && wsServiceRef.current && !connected) {
      wsServiceRef.current.connect().catch(error => {
        console.error('Failed to connect WebSocket:', error);
        onError?.(error);
      });
    }
  }, [enabled, connected]);

  // Connection management
  const connect = useCallback(async () => {
    if (!wsServiceRef.current) return;
    try {
      await wsServiceRef.current.connect();
    } catch (error) {
      onError?.(error);
      throw error;
    }
  }, [onError]);

  const disconnect = useCallback(() => {
    if (!wsServiceRef.current) return;
    wsServiceRef.current.disconnect();
  }, []);

  // Timer controls
  const startTimer = useCallback((timerId: number) => {
    if (!wsServiceRef.current || !permissions.can_control) {
      console.warn('Cannot start timer: insufficient permissions');
      return;
    }
    wsServiceRef.current.startTimer(timerId);
  }, [permissions.can_control]);

  const pauseTimer = useCallback((timerId: number) => {
    if (!wsServiceRef.current || !permissions.can_control) {
      console.warn('Cannot pause timer: insufficient permissions');
      return;
    }
    wsServiceRef.current.pauseTimer(timerId);
  }, [permissions.can_control]);

  const stopTimer = useCallback((timerId: number) => {
    if (!wsServiceRef.current || !permissions.can_control) {
      console.warn('Cannot stop timer: insufficient permissions');
      return;
    }
    wsServiceRef.current.stopTimer(timerId);
  }, [permissions.can_control]);

  const selectTimer = useCallback((timerId: number, timerData?: Partial<TimerData>) => {
    if (!wsServiceRef.current) return;
    wsServiceRef.current.selectTimer(timerId, timerData);
  }, []);

  // Room actions
  const refreshTimers = useCallback(() => {
    if (!wsServiceRef.current) return;
    wsServiceRef.current.requestRoomTimers();
  }, []);

const refreshConnections = useCallback(() => {
  if (!wsServiceRef.current) return;
  
  // Don't request connections if we don't have permission
  if (!permissions.can_view_connections) {
    console.debug('Skipping connection request - insufficient permissions');
    return;
  }
  
  wsServiceRef.current.requestConnections();
}, [permissions.can_view_connections]);

  const sendIdentifyResponse = useCallback((data: any) => {
    if (!wsServiceRef.current) return;
    wsServiceRef.current.sendIdentifyResponse(data);
  }, []);

  // Event listener management
  const addEventListener = useCallback((type: string, handler: (message: WebSocketMessage) => void) => {
    if (!wsServiceRef.current) return;
    wsServiceRef.current.on(type, handler);
  }, []);

  const removeEventListener = useCallback((type: string, handler: (message: WebSocketMessage) => void) => {
    if (!wsServiceRef.current) return;
    wsServiceRef.current.off(type, handler);
  }, []);

  return {
    // Connection state
    connected,
    connectionId,
    roomInfo,
    permissions,
    
    // Timer state
    timers,
    selectedTimerId,
    
    // Connection state
    connections,
    connectionCount,
    
    // Actions
    connect,
    disconnect,
    
    // Timer controls
    startTimer,
    pauseTimer,
    stopTimer,
    selectTimer,
    
    // Room actions
    refreshTimers,
    refreshConnections,
    sendIdentifyResponse,
    
    // Event handlers
    addEventListener,
    removeEventListener,
  };
}

// Additional hooks for specific use cases

/**
 * Hook for timer-specific WebSocket functionality
 */
export function useTimerWebSocket(roomId: number, options: UseWebSocketOptions = {}) {
  const ws = useWebSocket(roomId, options);
  
  const getTimerById = useCallback((timerId: number): TimerData | undefined => {
    return ws.timers.find(timer => timer.id === timerId);
  }, [ws.timers]);
  
  const getActiveTimer = useCallback((): TimerData | undefined => {
    return ws.timers.find(timer => timer.is_active);
  }, [ws.timers]);
  
  const getSelectedTimer = useCallback((): TimerData | undefined => {
    return ws.selectedTimerId ? ws.timers.find(timer => timer.id === ws.selectedTimerId) : undefined;
  }, [ws.timers, ws.selectedTimerId]);

  return {
    ...ws,
    getTimerById,
    getActiveTimer,
    getSelectedTimer,
  };
}

/**
 * Hook for connection management WebSocket functionality
 */
export function useConnectionWebSocket(roomId: number, options: UseWebSocketOptions = {}) {
  const ws = useWebSocket(roomId, options);
  
  const getCurrentConnection = useCallback((): ConnectionInfo | undefined => {
    return ws.connections.find(conn => conn.connection_id === ws.connectionId);
  }, [ws.connections, ws.connectionId]);
  
  const getConnectionById = useCallback((connectionId: string): ConnectionInfo | undefined => {
    return ws.connections.find(conn => conn.connection_id === connectionId);
  }, [ws.connections]);

  return {
    ...ws,
    getCurrentConnection,
    getConnectionById,
  };
}