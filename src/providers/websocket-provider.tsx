// src/providers/websocket-provider.tsx
import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { 
  WebSocketService, 
  WebSocketServiceOptions, 
  TimerData, 
  ConnectionInfo, 
  RoomInfo,
  createWebSocketService 
} from '@/services/websocket';

interface WebSocketContextValue {
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
  
  // WebSocket service instance
  wsService: WebSocketService | null;
  
  // Connection management
  connect: (roomId: number, options?: Partial<WebSocketServiceOptions>) => Promise<void>;
  disconnect: () => void;
  
  // Timer controls
  startTimer: (timerId: number) => void;
  pauseTimer: (timerId: number) => void;
  stopTimer: (timerId: number) => void;
  selectTimer: (timerId: number, timerData?: Partial<TimerData>) => void;
  
  // Room actions
  refreshTimers: () => void;
  refreshConnections: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  defaultOptions?: Partial<WebSocketServiceOptions>;
}

export function WebSocketProvider({ children, defaultOptions = {} }: WebSocketProviderProps) {
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

  // Setup event handlers for WebSocket service
  const setupEventHandlers = (wsService: WebSocketService) => {
    // Connection events
    wsService.on('success', (message: any) => {
      if (message.connection_id) {
        setConnected(true);
        setConnectionId(message.connection_id);
        setRoomInfo(message.room_info || null);
        setPermissions(message.permissions || permissions);
        setSelectedTimerId(message.room_info?.selected_timer_id || null);
        
        notifications.show({
          title: 'Connected',
          message: `Connected to room: ${message.room_info?.name || 'Unknown'}`,
          color: 'green',
        });
      }
    });

    // Timer events
    wsService.on('timer_update', (message: any) => {
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
    });

    wsService.on('timer_selected', (message: any) => {
      setSelectedTimerId(message.timer_id);
      
      if (!message.auto_selected) {
        notifications.show({
          title: 'Timer Selected',
          message: `${message.selected_by_name} selected a timer`,
          color: 'blue',
        });
      }
    });

    wsService.on('timer_start', (message: any) => {
      notifications.show({
        title: 'Timer Started',
        message: message.timer_title || 'Timer started',
        color: 'green',
      });
    });

    wsService.on('timer_pause', (message: any) => {
      notifications.show({
        title: 'Timer Paused',
        message: 'Timer has been paused',
        color: 'orange',
      });
    });

    wsService.on('timer_stop', (message: any) => {
      notifications.show({
        title: 'Timer Stopped',
        message: 'Timer has been stopped',
        color: 'red',
      });
    });

    // Room timer data
    wsService.on('ROOM_TIMERS_STATUS', (message: any) => {
      setTimers(message.timers || []);
      if (message.selected_timer_id !== undefined) {
        setSelectedTimerId(message.selected_timer_id);
      }
    });

    wsService.on('INITIAL_ROOM_TIMERS', (message: any) => {
      setTimers(message.timers || []);
      if (message.selected_timer_id !== undefined) {
        setSelectedTimerId(message.selected_timer_id);
      }
    });

    // Connection events
    wsService.on('connection_count', (message: any) => {
      setConnectionCount(message.count);
      if (message.current_connections) {
        setConnections(message.current_connections);
      }
    });

    wsService.on('CONNECTIONS_LIST', (message: any) => {
      setConnections(message.connections || []);
      setConnectionCount(message.total_count || 0);
    });

    // Error handling
    wsService.on('error', (message: any) => {
      console.error('WebSocket error:', message.message);
      notifications.show({
        title: 'Error',
        message: message.message || 'An unknown error occurred',
        color: 'red',
      });
    });

    // Identify requests
    wsService.on('identify_request', () => {
      wsService.sendIdentifyResponse({
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        connection_id: connectionId,
        client_info: {
          app_version: '1.0.0',
          platform: 'web',
        },
      });
    });
  };

  // Connection management
  const connect = async (roomId: number, options: Partial<WebSocketServiceOptions> = {}) => {
    // Disconnect existing connection
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect();
    }

    // Create new WebSocket service
    const wsService = createWebSocketService({
      roomId,
      autoReconnect: true,
      ...defaultOptions,
      ...options,
    });

    wsServiceRef.current = wsService;
    setupEventHandlers(wsService);

    try {
      await wsService.connect();
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      notifications.show({
        title: 'Connection Failed',
        message: 'Failed to connect to room. Please try again.',
        color: 'red',
      });
      throw error;
    }
  };

  const disconnect = () => {
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect();
      wsServiceRef.current = null;
    }
    
    // Reset state
    setConnected(false);
    setConnectionId(null);
    setRoomInfo(null);
    setTimers([]);
    setConnections([]);
    setConnectionCount(0);
    setSelectedTimerId(null);
    setPermissions({
      can_view: false,
      can_control: false,
      can_modify: false,
      can_view_connections: false,
    });
  };

  // Timer controls with permission checks
  const startTimer = (timerId: number) => {
    if (!wsServiceRef.current) {
      notifications.show({
        title: 'Not Connected',
        message: 'Please connect to a room first',
        color: 'red',
      });
      return;
    }

    if (!permissions.can_control) {
      notifications.show({
        title: 'Permission Denied',
        message: 'You do not have permission to control timers',
        color: 'orange',
      });
      return;
    }

    wsServiceRef.current.startTimer(timerId);
  };

  const pauseTimer = (timerId: number) => {
    if (!wsServiceRef.current) {
      notifications.show({
        title: 'Not Connected',
        message: 'Please connect to a room first',
        color: 'red',
      });
      return;
    }

    if (!permissions.can_control) {
      notifications.show({
        title: 'Permission Denied',
        message: 'You do not have permission to control timers',
        color: 'orange',
      });
      return;
    }

    wsServiceRef.current.pauseTimer(timerId);
  };

  const stopTimer = (timerId: number) => {
    if (!wsServiceRef.current) {
      notifications.show({
        title: 'Not Connected',
        message: 'Please connect to a room first',
        color: 'red',
      });
      return;
    }

    if (!permissions.can_control) {
      notifications.show({
        title: 'Permission Denied',
        message: 'You do not have permission to control timers',
        color: 'orange',
      });
      return;
    }

    wsServiceRef.current.stopTimer(timerId);
  };

  const selectTimer = (timerId: number, timerData?: Partial<TimerData>) => {
    if (!wsServiceRef.current) {
      notifications.show({
        title: 'Not Connected',
        message: 'Please connect to a room first',
        color: 'red',
      });
      return;
    }

    wsServiceRef.current.selectTimer(timerId, timerData);
  };

  // Room actions
  const refreshTimers = () => {
    if (!wsServiceRef.current) return;
    wsServiceRef.current.requestRoomTimers();
  };

  const refreshConnections = () => {
    if (!wsServiceRef.current) return;
    
    if (!permissions.can_view_connections) {
      notifications.show({
        title: 'Permission Denied',
        message: 'You do not have permission to view connections',
        color: 'orange',
      });
      return;
    }
    
    wsServiceRef.current.requestConnections();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
    };
  }, []);

  const value: WebSocketContextValue = {
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
    
    // WebSocket service
    wsService: wsServiceRef.current,
    
    // Actions
    connect,
    disconnect,
    startTimer,
    pauseTimer,
    stopTimer,
    selectTimer,
    refreshTimers,
    refreshConnections,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook to use WebSocket context
export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

// Hook for timer-specific functionality
export function useTimerContext() {
  const context = useWebSocketContext();
  
  const getTimerById = (timerId: number): TimerData | undefined => {
    return context.timers.find(timer => timer.id === timerId);
  };
  
  const getActiveTimer = (): TimerData | undefined => {
    return context.timers.find(timer => timer.is_active);
  };
  
  const getSelectedTimer = (): TimerData | undefined => {
    return context.selectedTimerId 
      ? context.timers.find(timer => timer.id === context.selectedTimerId) 
      : undefined;
  };

  return {
    ...context,
    getTimerById,
    getActiveTimer,
    getSelectedTimer,
  };
}

// Hook for connection-specific functionality
export function useConnectionContext() {
  const context = useWebSocketContext();
  
  const getCurrentConnection = (): ConnectionInfo | undefined => {
    return context.connections.find(conn => conn.connection_id === context.connectionId);
  };
  
  const getConnectionById = (connectionId: string): ConnectionInfo | undefined => {
    return context.connections.find(conn => conn.connection_id === connectionId);
  };

  return {
    ...context,
    getCurrentConnection,
    getConnectionById,
  };
}