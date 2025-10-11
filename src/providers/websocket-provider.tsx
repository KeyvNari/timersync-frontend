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
  defaultDisplayId: number | null;

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
  updateTimer: (timerId: number, updates: Partial<TimerData>) => void;
  deleteTimer: (timerId: number) => void;
  selectTimer: (timerId: number, timerData?: Partial<TimerData>) => void;
  createTimer: (timerData: Partial<TimerData>) => void;

  // Display management
  createDisplay: (displayData: any) => void;
  updateDisplay: (displayId: number, updateData: any) => void;
  setDefaultDisplay: (displayId: number) => void;

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
  const [defaultDisplayId, setDefaultDisplayId] = useState<number | null>(null);

  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  // Setup event handlers
const setupEventHandlers = (wsService: SimpleWebSocketService) => {
  // Use lowercase to match what backend actually sends
  wsService.on('success', (message: any) => {
    console.log('Received success message:', message);

    // Check if this is a timer operation success
    if (message.timer_id && message.message) {
      // Handle timer-specific success messages
      if (message.message.includes('Timer deleted successfully')) {
        setTimers((prev) => {
          const remainingTimers = prev.filter(timer => timer.id !== message.timer_id);
          // If the deleted timer was selected, select the previous timer
          setSelectedTimerId(currentSelected => {
            if (currentSelected === message.timer_id) {
              // Sort timers by room_sequence_order to match UI display order
              const sortedPrev = [...prev].sort((a: TimerData, b: TimerData) => a.room_sequence_order - b.room_sequence_order);
              const deletedIndex = sortedPrev.findIndex(timer => timer.id === message.timer_id);
              let newSelectedId: number | null = null;

              // Select the previous timer (one before the deleted one in display order)
              if (deletedIndex > 0) {
                newSelectedId = sortedPrev[deletedIndex - 1].id;
              } else if (remainingTimers.length > 0) {
                // If deleted timer was first, select the new first timer
                const sortedRemaining = remainingTimers.sort((a: TimerData, b: TimerData) => a.room_sequence_order - b.room_sequence_order);
                newSelectedId = sortedRemaining[0].id;
              } else {
                // No timers left
                newSelectedId = null;
              }

              // Send WebSocket message to notify backend and other clients about the new selection
              if (newSelectedId !== null && wsServiceRef.current) {
                setTimeout(() => {
                  wsServiceRef.current?.selectTimer(newSelectedId!);
                }, 100);
              }

              return newSelectedId;
            }
            return currentSelected;
          });
          return remainingTimers;
        });
      } else if (message.message.includes('Timer created successfully')) {
        // Timer was created successfully, request updated timer list
        console.log('Timer created successfully, refreshing timers...');
        setTimeout(() => {
          wsService.requestRoomTimers();
        }, 100);
      }
      
      setLastSuccess(message.message);
      return; // Don't process as connection success
    }

    // Handle connection success messages (only if it contains authentication/room info)
    if (message.room_info) {
      setConnected(true);
      setRoomInfo(message.room_info);
      setSelectedTimerId(message.room_info?.selected_timer_id || null);
      setLastSuccess(message.message || 'Connected successfully');

      // Request initial timers after successful connection
      setTimeout(() => {
        wsService.requestRoomTimers();
      }, 100);
    } else {
      // This is likely a successful operation response
      setLastSuccess(message.message);
      
      // If it's a generic success message that might be from timer creation,
      // request timer refresh just in case
      if (message.message && (
        message.message.toLowerCase().includes('timer') ||
        message.message.toLowerCase().includes('created')
      )) {
        setTimeout(() => {
          wsService.requestRoomTimers();
        }, 200);
      }
    }
  });


   wsService.on('timer_created', (message: any) => {
    console.log('Timer created event received:', message);
    if (message.timer_data) {
      setTimers((prev) => {
        const newTimers = [...prev, message.timer_data];
        // If this is the only timer or no timer is selected, select it
        setSelectedTimerId(currentSelected => {
          if (currentSelected === null && newTimers.length === 1) {
            // First timer created, auto-select it
            setTimeout(() => {
              wsServiceRef.current?.selectTimer(message.timer_data.id);
            }, 100);
            return message.timer_data.id;
          }
          return currentSelected;
        });
        return newTimers;
      });
    }
    // Also refresh the full timer list to ensure consistency
    setTimeout(() => {
      wsService.requestRoomTimers();
    }, 100);
  });
    // Timer events
 wsService.on('timer_update', (message: any) => {
  // console.log('📍 TIMER_UPDATE received:', {
  //   timer_id: message.timer_data?.id,
  //   current_time: message.timer_data?.current_time_seconds,
  //   is_active: message.timer_data?.is_active,
  //   full_data: message.timer_data
  // });
  
  setTimers((prev) => {
    const timerData = message.timer_data;
    if (!timerData?.id) {
      // console.log('❌ No timer data or ID in update');
      return prev;
    }

    const existingTimerIndex = prev.findIndex(timer => timer.id === timerData.id);
    let newTimers;
    
    if (existingTimerIndex !== -1) {
      // Create a completely new array with the updated timer
      newTimers = [...prev];
      newTimers[existingTimerIndex] = { ...timerData };
      // console.log('✅ Timer updated at index', existingTimerIndex, 'New value:', timerData.current_time_seconds);
    } else {
      newTimers = [...prev, timerData];
      // console.log('➕ New timer added');
    }
    
    return newTimers;
  });
});


wsService.on('error', (message: any) => {
  const errorMessage = message.message || 'Unknown error';
  
  // Check if it's a permission error
  if (errorMessage.includes('permission') || 
      errorMessage.includes('unauthorized') || 
      errorMessage.includes('forbidden')) {
    // console.debug('Permission denied:', errorMessage);
    // Don't set as a critical error - just log it
    return;
  }
  
  // Only set error state for non-permission errors
  setLastError(errorMessage);
});


    wsService.on('timer_selected', (message: any) => {
      // console.log('📍 TIMER_SELECTED received:', {
      //   timer_id: message.timer_id,
      //   connection_id: message.connection_id,
      //   timestamp: message.timestamp
      // });

      if (message.timer_id !== undefined) {
        // Only update if it's not from our own auto-selection
        // Auto-selections are sent with a 100ms delay, so if we just set it locally, we can skip the WebSocket confirm
        setSelectedTimerId(current => {
          if (current === message.timer_id) {
            // Already set, no need to update
            return current;
          }
          return message.timer_id;
        });
      }
    });

   wsService.on('ROOM_TIMERS_STATUS', (message: any) => {
    // console.log('Timers from ROOM_TIMERS_STATUS:', message.timers);
    const newTimers = message.timers || [];
    setTimers(newTimers);
    if (message.selected_timer_id !== undefined) {
      setSelectedTimerId(message.selected_timer_id);
    } else if (newTimers.length > 0) {
      // Auto-select the first timer (in display order) if none is selected
      const sortedTimers = newTimers.sort((a: TimerData, b: TimerData) => a.room_sequence_order - b.room_sequence_order);
      setSelectedTimerId(sortedTimers[0].id);
      setTimeout(() => {
        wsServiceRef.current?.selectTimer(sortedTimers[0].id);
      }, 100);
    }
  });

    wsService.on('INITIAL_ROOM_TIMERS', (message: any) => {
      // console.log('Timers from INITIAL_ROOM_TIMERS:', message.timers);
      const newTimers = message.timers || [];
      setTimers(newTimers);
      if (message.selected_timer_id !== undefined) {
        setSelectedTimerId(message.selected_timer_id);
      } else if (newTimers.length > 0) {
        // Auto-select the first timer (in display order) if none is selected
        const sortedTimers = newTimers.sort((a: TimerData, b: TimerData) => a.room_sequence_order - b.room_sequence_order);
        setSelectedTimerId(sortedTimers[0].id);
        setTimeout(() => {
          wsServiceRef.current?.selectTimer(sortedTimers[0].id);
        }, 100);
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
      // Accumulate displays instead of replacing - merge with existing displays
      setDisplays(prevDisplays => {
        const newDisplays = message.displays || [];
        // Create a map of existing displays for quick lookup
        const existingMap = new Map(prevDisplays.map(d => [d.id, d]));
        // Add or update displays
        newDisplays.forEach((display: any) => {
          existingMap.set(display.id, display);
        });
        // Return array of all displays
        return Array.from(existingMap.values());
      });
    });

    wsService.on('default_display_id', (message: any) => {
      console.log('Received default display ID:', message.default_display_id);
      setDefaultDisplayId(message.default_display_id);
    });
  };

  // Connection management
// In src/providers/websocket-provider.tsx

// Update the connect function (around line 208-240):




const connect = useCallback(async (
  roomId: number,
  options: Partial<WebSocketServiceOptions> = {}
) => {
  if (wsServiceRef.current) {
    wsServiceRef.current.disconnect();
  }

  // Get the access token from localStorage for authenticated users
  const accessToken = localStorage.getItem('access_token');
  
  // console.log('🔌 WebSocketProvider.connect called with:', {
  //   roomId,
  //   hasAccessToken: !!accessToken,
  //   hasRoomToken: !!options.roomToken,
  //   hasTokenPassword: !!options.tokenPassword,
  // });

  // Determine which authentication to use:
  // - If roomToken is provided, we're in viewer mode (use room token)
  // - Otherwise, we're in dashboard mode (use access token)
  const finalOptions = {
    roomId,
    autoReconnect: true,
    ...defaultOptions,
    ...options,
  };

  // Add the appropriate token
  if (options.roomToken) {
    // Viewer mode - use room token from URL
    finalOptions.roomToken = options.roomToken;
    if (options.tokenPassword) {
      finalOptions.tokenPassword = options.tokenPassword;
    }
  } else if (accessToken) {
    // Dashboard mode - use user's access token
    finalOptions.token = accessToken;
  }

  // console.log('🎯 Final options being passed to WebSocketService:', {
  //   roomId: finalOptions.roomId,
  //   hasToken: !!finalOptions.token,
  //   hasRoomToken: !!finalOptions.roomToken,
  //   hasTokenPassword: !!finalOptions.tokenPassword,
  // });

  const wsService = createSimpleWebSocketService(finalOptions);

  wsServiceRef.current = wsService;
  setupEventHandlers(wsService);

  try {
    await wsService.connect();
  } catch (error) {
    // console.error('Failed to connect WebSocket:', error);
    throw error;
  }
}, [defaultOptions]);



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
  setDefaultDisplayId(null);
  setLastError(null);
  setLastSuccess(null);
}, []);

  // Timer controls
const startTimer = useCallback((timerId: number) => {
  if (!wsServiceRef.current) return;

  // Pause all other active timers before starting the new one
  const activeTimers = timers.filter(
    timer => timer.is_active && !timer.is_paused && timer.id !== timerId
  );
  activeTimers.forEach(timer => {
    wsServiceRef.current?.pauseTimer(timer.id);
  });

  // Then start the requested timer
  wsServiceRef.current.startTimer(timerId);
}, [timers]);

const pauseTimer = useCallback((timerId: number) => {
  wsServiceRef.current?.pauseTimer(timerId);
}, []);

const stopTimer = useCallback((timerId: number) => {
  wsServiceRef.current?.stopTimer(timerId);
}, []);

const resetTimer = useCallback((timerId: number) => {
  wsServiceRef.current?.resetTimer(timerId);
}, []);

const updateTimer = useCallback((timerId: number, updates: Partial<TimerData>) => {
  wsServiceRef.current?.updateTimer(timerId, updates);
}, []);

const deleteTimer = useCallback((timerId: number) => {
  wsServiceRef.current?.deleteTimer(timerId);
}, []);

const selectTimer = useCallback((timerId: number, timerData?: Partial<TimerData>) => {
  if (!wsServiceRef.current) return;

  // Pause all other active timers before selecting the new one
  const activeTimers = timers.filter(
    timer => timer.is_active && !timer.is_paused && timer.id !== timerId
  );
  activeTimers.forEach(timer => {
    wsServiceRef.current?.pauseTimer(timer.id);
  });

  // Then select the requested timer
  wsServiceRef.current.selectTimer(timerId, timerData);
  // Ensure timers are updated after selection to include the selected timer data
  // setTimeout(() => wsServiceRef.current?.requestRoomTimers(), 50);
}, [timers]);

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


const createTimer = useCallback((timerData: Partial<TimerData>) => {
  wsServiceRef.current?.createTimer(timerData);
}, []);

// Display management
const createDisplay = useCallback((displayData: any) => {
  wsServiceRef.current?.createDisplay(displayData);
}, []);

const updateDisplay = useCallback((displayId: number, updateData: any) => {
  wsServiceRef.current?.updateDisplay(displayId, updateData);
}, []);

const setDefaultDisplay = useCallback((displayId: number) => {
  wsServiceRef.current?.setDefaultDisplay(displayId);
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
    defaultDisplayId,
    lastError,
    lastSuccess,
    wsService: wsServiceRef.current,
    connect,
    disconnect,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    updateTimer,
    deleteTimer,
    selectTimer,
    createTimer,
    createDisplay,
    updateDisplay,
    setDefaultDisplay,
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
