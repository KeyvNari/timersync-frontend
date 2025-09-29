// src/providers/websocket-provider.tsx
import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  SimpleWebSocketService,
  WebSocketServiceOptions,
  TimerData,
  ConnectionInfo,
  DisplayConfig,
  createSimpleWebSocketService,
} from '@/services/websocket';

interface WebSocketContextValue {
  connected: boolean;

  // Timer state
  timers: TimerData[];
  selectedTimerId: number | null;

  // Room state
  roomInfo: Record<string, any> | null;
  displays: DisplayConfig[];
  connections: ConnectionInfo[];
  connectionCount: number;

  // Error/success messages
  lastError: string | null;
  lastSuccess: string | null;

  // WebSocket service instance
  wsService: SimpleWebSocketService | null;

  // Connection management
  connect: (roomId: number, options?: Partial<WebSocketServiceOptions>) => Promise<void>;
  disconnect: () => void;

  // Timer controls
  startTimer: (timerId: number) => void;
  pauseTimer: (timerId: number) => void;
  stopTimer: (timerId: number) => void;
  resetTimer: (timerId: number) => void;
  selectTimer: (timerId: number, timerData?: Partial<TimerData>) => void;

  // Room actions
  refreshTimers: () => void;
  joinRoom: () => void;
  leaveRoom: () => void;
  updateRoom: (settings: Record<string, any>) => void;

  // Connections
  requestConnections: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  defaultOptions?: Partial<WebSocketServiceOptions>;
}

export function WebSocketProvider({
  children,
  defaultOptions = {},
}: WebSocketProviderProps) {
  const wsServiceRef = useRef<SimpleWebSocketService | null>(null);

  const [connected, setConnected] = useState(false);
  const [timers, setTimers] = useState<TimerData[]>([]);
  const [selectedTimerId, setSelectedTimerId] = useState<number | null>(null);

  const [roomInfo, setRoomInfo] = useState<Record<string, any> | null>(null);
  const [displays, setDisplays] = useState<DisplayConfig[]>([]);
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);

  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  // Setup event handlers
const setupEventHandlers = (wsService: SimpleWebSocketService) => {
  // Add wildcard handler for debugging
  wsService.on('*', (message: any) => {
    console.log('🔍 PROVIDER received message:', message.type, message);
  });

  // Use lowercase to match what backend actually sends
  wsService.on('success', (message: any) => {  // Changed from 'SUCCESS'
    setConnected(true);
    setRoomInfo(message.room_info || null);
    setSelectedTimerId(message.room_info?.selected_timer_id || null);
    setLastSuccess(message.message || 'Connected successfully');
  });

    // Timer events
    wsService.on('timer_update', (message: any) => {
      setTimers((prev) => {
        const timerData = message.timer_data;
        if (!timerData?.id) return prev;

        const timerExists = prev.some(timer => timer.id === timerData.id);
        if (timerExists) {
          // Update existing timer
          return prev.map((timer) =>
            timer.id === timerData.id
              ? { ...timer, ...timerData }
              : timer
          );
        } else {
          // Add new timer to array
          return [...prev, timerData];
        }
      });
    });

wsService.on('error', (message: any) => {
  const errorMessage = message.message || 'Unknown error';
  
  // Check if it's a permission error
  if (errorMessage.includes('permission') || 
      errorMessage.includes('unauthorized') || 
      errorMessage.includes('forbidden')) {
    console.debug('Permission denied:', errorMessage);
    // Don't set as a critical error - just log it
    return;
  }
  
  // Only set error state for non-permission errors
  setLastError(errorMessage);
});


    wsService.on('TIMER_SELECTED', (message: any) => {
      setSelectedTimerId(message.timer_id);
    });

   wsService.on('room_timers_status', (message: any) => {  
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

    // Room events
    wsService.on('ROOM_UPDATE', (message: any) => {
      setRoomInfo((prev) => ({ ...prev, ...message.room }));
    });

    // Connection events
    wsService.on('CONNECTION_COUNT', (message: any) => {
      setConnectionCount(message.count || 0);
    });

    wsService.on('CONNECTION_UPDATE', (message: any) => {
      setConnections(message.connections || []);
    });

    wsService.on('CONNECTIONS_LIST', (message: any) => {
      setConnections(message.connections || []);
    });

    // Display events
    wsService.on('display_info', (message: any) => {
      setDisplays(message.displays || []);
    });
  };

  // Connection management
const connect = useCallback(async (
  roomId: number,
  options: Partial<WebSocketServiceOptions> = {}
) => {
  if (wsServiceRef.current) {
    wsServiceRef.current.disconnect();
  }

  const wsService = createSimpleWebSocketService({
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
    throw error;
  }
}, [defaultOptions]); // Add dependencies here

const disconnect = useCallback(() => {
  if (wsServiceRef.current) {
    wsServiceRef.current.disconnect();
    wsServiceRef.current = null;
  }

  setConnected(false);
  setTimers([]);
  setSelectedTimerId(null);
  setRoomInfo(null);
  setDisplays([]);
  setConnections([]);
  setConnectionCount(0);
  setLastError(null);
  setLastSuccess(null);
}, []);

  // Timer controls
const startTimer = useCallback((timerId: number) => {
  wsServiceRef.current?.startTimer(timerId);
}, []);

const pauseTimer = useCallback((timerId: number) => {
  wsServiceRef.current?.pauseTimer(timerId);
}, []);

const stopTimer = useCallback((timerId: number) => {
  wsServiceRef.current?.stopTimer(timerId);
}, []);

const resetTimer = useCallback((timerId: number) => {
  wsServiceRef.current?.resetTimer(timerId);
}, []);

const selectTimer = useCallback((timerId: number, timerData?: Partial<TimerData>) => {
  wsServiceRef.current?.selectTimer(timerId, timerData);
}, []);

  // Room actions
const refreshTimers = useCallback(() => {
  wsServiceRef.current?.requestRoomTimers();
}, []);

const joinRoom = useCallback(() => {
  wsServiceRef.current?.joinRoom();
}, []);

const leaveRoom = useCallback(() => {
  wsServiceRef.current?.leaveRoom();
}, []);

const updateRoom = useCallback((settings: Record<string, any>) => {
  wsServiceRef.current?.updateRoom(settings);
}, []);

// Connections
const requestConnections = useCallback(() => {
  wsServiceRef.current?.requestConnections();
}, []);

  useEffect(() => {
    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
      }
    };
  }, []);

  const value: WebSocketContextValue = {
    connected,
    timers,
    selectedTimerId,
    roomInfo,
    displays,
    connections,
    connectionCount,
    lastError,
    lastSuccess,
    wsService: wsServiceRef.current,
    connect,
    disconnect,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    selectTimer,
    refreshTimers,
    joinRoom,
    leaveRoom,
    updateRoom,
    requestConnections,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

export function useTimerContext() {
  const context = useWebSocketContext();

  const getTimerById = (timerId: number): TimerData | undefined =>
    context.timers.find((timer) => timer.id === timerId);

  const getActiveTimer = (): TimerData | undefined =>
    context.timers.find((timer) => timer.is_active);

  const getSelectedTimer = (): TimerData | undefined =>
    context.selectedTimerId
      ? context.timers.find((timer) => timer.id === context.selectedTimerId)
      : undefined;

  return {
    ...context,
    getTimerById,
    getActiveTimer,
    getSelectedTimer,
  };
}
