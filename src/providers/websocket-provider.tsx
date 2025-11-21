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
  MessageData,
  createSimpleWebSocketService,
} from '@/services/websocket';
import { useAuth } from '@/hooks/use-auth';

interface PlanFeatures {
  max_rooms: number;
  max_timers_in_room: number;
  max_connected_devices: number;
  can_customize_display: boolean;
  can_save_display: boolean;
  can_use_room_messages: boolean;
  max_messages_per_room: number;
  agent_monthly_token_limit: number;
}

interface WebSocketContextValue {
  connected: boolean;

  // Connection health state
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  connectionMessage: string | null;

  // Disconnection by host
  disconnectedByHost: {
    message: string;
    disconnected_by: {
      connection_id: string;
      connection_name: string;
    };
  } | null;

  // Token revocation
  revokedToken: {
    message: string;
    token_id: number;
    token_name?: string | null;
    reason?: string;
  } | null;

  // Token expiration/revocation events
  tokenEvent: {
    type: 'token_expired' | 'token_revoked';
    message: string;
    reason?: string;
  } | null;

  // User plan and features
  userPlan: string | null;
  planFeatures: PlanFeatures | null;

  // Timer state
  timers: TimerData[];
  selectedTimerId: number | null;

  // Room state
  roomInfo: Record<string, any> | null;
  displays: DisplayConfig[];
  connections: ConnectionInfo[];
  connectionCount: number;
  defaultDisplayId: number | null;
  messages: MessageData[];

  // Error/success messages
  lastError: string | null;
  lastSuccess: string | null;

  // Loading/Pending operations state
  pendingOperations: Set<string>;
  isOperationPending: (operationKey: string) => boolean;

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
  adjustTimer: (timerId: number, newTimeSeconds: number) => void;
  updateTimer: (timerId: number, updates: Partial<TimerData>) => void;
  bulkUpdateTimers: (updates: Array<{ timer_id: number; room_sequence_order: number; linked_timer_id?: number | null }>) => void;
  deleteTimer: (timerId: number) => void;
  selectTimer: (timerId: number, timerData?: Partial<TimerData>) => void;
  createTimer: (timerData: Partial<TimerData>) => void;

  // Display management
  createDisplay: (displayData: any) => void;
  updateDisplay: (displayId: number, updateData: any) => void;
  setDefaultDisplay: (displayId: number) => void;
  deleteDisplay: (displayId: number) => void;

  // Room actions
  refreshTimers: () => void;
  joinRoom: () => void;
  leaveRoom: () => void;
  updateRoom: (settings: Record<string, any>) => void;

  // Connections
  requestConnections: () => void;
  disconnectClient: (targetConnectionId: string) => void;
  revokeAccessToken: (tokenId: number) => void;

  // Message management
  addMessage: (messageData: Omit<MessageData, 'id'>) => void;
  updateMessage: (messageId: string, updateData: Partial<MessageData>) => void;
  deleteMessage: (messageId: string) => void;
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
  const { setIsAuthenticated } = useAuth();
  const wsServiceRef = useRef<SimpleWebSocketService | null>(null);

  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);

  // Disconnection by host state
  const [disconnectedByHost, setDisconnectedByHost] = useState<{
    message: string;
    disconnected_by: {
      connection_id: string;
      connection_name: string;
    };
  } | null>(null);

  // Token revocation state
  const [revokedToken, setRevokedToken] = useState<{
    message: string;
    token_id: number;
    token_name?: string | null;
    reason?: string;
  } | null>(null);

  // Token expiration/revocation event state (for connection-time events)
  const [tokenEvent, setTokenEvent] = useState<{
    type: 'token_expired' | 'token_revoked';
    message: string;
    reason?: string;
  } | null>(null);

  // User plan and features state
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [planFeatures, setPlanFeatures] = useState<PlanFeatures | null>(null);

  const [timers, setTimers] = useState<TimerData[]>([]);
  const [selectedTimerId, setSelectedTimerId] = useState<number | null>(null);

  // Optimistic update tracking
  const optimisticUpdatesRef = useRef<Map<number, { previous: TimerData; timeout: NodeJS.Timeout }>>(new Map());

  // Pending operations tracking (use ref for synchronous access in callbacks)
  const pendingOperationsRef = useRef<Set<string>>(new Set());
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());

  const [roomInfo, setRoomInfo] = useState<Record<string, any> | null>(null);
  const [displays, setDisplays] = useState<DisplayConfig[]>([]);
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const [defaultDisplayId, setDefaultDisplayId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);

  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  // Helper functions for operation tracking
  const addPendingOperation = useCallback((key: string) => {
    pendingOperationsRef.current.add(key);
    setPendingOperations(new Set(pendingOperationsRef.current));
  }, []);

  const removePendingOperation = useCallback((key: string) => {
    pendingOperationsRef.current.delete(key);
    setPendingOperations(new Set(pendingOperationsRef.current));
  }, []);

  const isOperationPending = useCallback((key: string) => {
    return pendingOperationsRef.current.has(key);
  }, []);

  // Setup event handlers
const setupEventHandlers = (wsService: SimpleWebSocketService) => {
  // Use lowercase to match what backend actually sends
  wsService.on('success', (message: any) => {
    // Clear any disconnection state on successful connection
    setDisconnectedByHost(null);

    // Check if this is a token revocation success
    if (message.token_id && message.message && message.message.toLowerCase().includes('revoked')) {
      removePendingOperation(`token_revoke_${message.token_id}`);

      // Remove the revoked token from connections list (for admin's view)
      setConnections((prev) => {
        const tokenIdStr = String(message.token_id);
        const updated = prev.filter(conn => String(conn.access_token_id) !== tokenIdStr);
        return updated;
      });

      setLastSuccess(message.message);
      return; // Don't process as connection success
    }

    // Check if this is a timer operation success
    if (message.timer_id && message.message) {
      // Clear pending operation for this timer
      removePendingOperation(`timer_${message.timer_id}`);
      removePendingOperation(`timer_delete_${message.timer_id}`);
      removePendingOperation(`timer_create`);

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

      // Load initial messages if provided in room_info
      if (message.room_info?.messages && Array.isArray(message.room_info.messages)) {
        // Deduplicate initial messages
        const messageMap = new Map<string, MessageData>();
        message.room_info.messages.forEach((msg: MessageData) => messageMap.set(msg.id, msg));
        setMessages(Array.from(messageMap.values()));
      }

      setLastSuccess(message.message || 'Connected successfully');

      // Request initial data after successful connection
      setTimeout(() => {
        wsService.requestRoomTimers();
        wsService.requestConnections();

        // Always request messages to ensure they're loaded
        // (Backend should include them in room_info, but this is a fallback)
        wsService.requestMessages();
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
  setTimers((prev) => {
    const timerData = message.timer_data;
    if (!timerData?.id) {
      // console.log('❌ No timer data or ID in update');
      return prev;
    }

    const existingTimerIndex = prev.findIndex(timer => timer.id === timerData.id);
    if (existingTimerIndex === -1) {
      // New timer - just add it
      return [...prev, timerData];
    }

    const existingTimer = prev[existingTimerIndex];

    // Check if we have a pending update for this timer (use ref for current value)
    const hasPendingUpdate = pendingOperationsRef.current.has(`timer_update_${timerData.id}`);

    // Check if this timer is part of a bulk update (linking operation)
    const isPartOfBulkUpdate = pendingOperationsRef.current.has(`timer_bulk_update_${timerData.id}`);

    // If there's a pending update, preserve the optimistic values for non-time fields
    // Only update time-related and state fields from the server
    let finalTimerData;
    if (hasPendingUpdate) {
      // Preserve all fields from the existing timer EXCEPT time/state fields that the server manages
      finalTimerData = {
        ...existingTimer,  // Keep optimistic updates
        // Only override with server values for fields that change during runtime
        current_time_seconds: timerData.current_time_seconds,
        is_active: timerData.is_active,
        is_paused: timerData.is_paused,
        is_finished: timerData.is_finished,
        is_stopped: timerData.is_stopped,
        is_overtime: timerData.is_overtime,
        overtime_seconds: timerData.overtime_seconds,
        accumulated_seconds: timerData.accumulated_seconds,
        started_at: timerData.started_at,
        paused_at: timerData.paused_at,
        completed_at: timerData.completed_at,
        actual_start_time: timerData.actual_start_time,
        last_calculated_at: timerData.last_calculated_at,
      };
    } else if (isPartOfBulkUpdate) {
      // During bulk update (linking operation), preserve local state completely
      // Only update runtime state fields that don't affect linking
      finalTimerData = {
        ...existingTimer,  // Keep all optimistic updates including linked_timer_id
        // Only override with server values for fields that change during runtime
        current_time_seconds: timerData.current_time_seconds,
        is_active: timerData.is_active,
        is_paused: timerData.is_paused,
        is_finished: timerData.is_finished,
        is_stopped: timerData.is_stopped,
        is_overtime: timerData.is_overtime,
        overtime_seconds: timerData.overtime_seconds,
        accumulated_seconds: timerData.accumulated_seconds,
        started_at: timerData.started_at,
        paused_at: timerData.paused_at,
        completed_at: timerData.completed_at,
        actual_start_time: timerData.actual_start_time,
        last_calculated_at: timerData.last_calculated_at,
      };
    } else {
      // No pending update - accept all server data
      finalTimerData = { ...timerData };

      // Preserve linked_timer_id from the existing timer since timer_update events
      // typically only update runtime state (time, is_active, etc.), not linking relationships
      // The linked_timer_id is managed via timer_bulk_update events instead
      if (existingTimer && typeof existingTimer.linked_timer_id !== 'undefined') {
        finalTimerData.linked_timer_id = existingTimer.linked_timer_id;
      }

      // Clear pending operations for this timer (only if no update is pending)
      removePendingOperation(`timer_${timerData.id}`);
      removePendingOperation(`timer_start_${timerData.id}`);
      removePendingOperation(`timer_pause_${timerData.id}`);
      removePendingOperation(`timer_stop_${timerData.id}`);

      // Clear optimistic update if server confirms the change
      const optimisticUpdate = optimisticUpdatesRef.current.get(timerData.id);
      if (optimisticUpdate) {
        clearTimeout(optimisticUpdate.timeout);
        optimisticUpdatesRef.current.delete(timerData.id);
      }
    }

    const newTimers = [...prev];
    newTimers[existingTimerIndex] = finalTimerData;
    return newTimers;
  });
});

wsService.on('timer_bulk_update', (message: any) => {
  setTimers((prev) => {
    const updatedTimers = message.timers;
    if (!updatedTimers || !Array.isArray(updatedTimers)) {
      return prev;
    }

    // Create a map for quick lookup of updated timers
    const updatedMap = new Map(updatedTimers.map((t: TimerData) => [t.id, t]));

    // Update all timers that were in the bulk update
    // For fields like linked_timer_id and room_sequence_order, preserve them from the update
    // For runtime fields, use what's in the update (or keep local if not provided)
    const newTimers = prev.map(timer => {
      const updated = updatedMap.get(timer.id);
      if (updated) {
        // Merge the updated data with existing data, ensuring linked_timer_id is from the server
        return { ...timer, ...updated };
      }
      return timer;
    });

    return newTimers;
  });

  // Note: bulk update pending operations are cleared by the bulkUpdateTimers timeout
  // This ensures we block all interfering timer_update messages during the bulk operation
});

wsService.on('timer_adjust_success', (message: any) => {
  // Clear the pending adjustment operation for this specific timer
  if (message.timer_id) {
    removePendingOperation(`timer_adjust_${message.timer_id}`);

    // Also clear the optimistic update if one exists
    const optimisticUpdate = optimisticUpdatesRef.current.get(message.timer_id);
    if (optimisticUpdate) {
      clearTimeout(optimisticUpdate.timeout);
      optimisticUpdatesRef.current.delete(message.timer_id);
    }
  }
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
    wsService.on('connection_count', (message: any) => {
      setConnectionCount(message.count || 0);
      if (message.current_connections) {
        setConnections(message.current_connections);
      } else if (message.disconnected_connection) {
        setConnections((prev) =>
          prev.filter((conn) => conn.connection_id !== message.disconnected_connection.connection_id)
        );
      }
    });

    wsService.on('CONNECTION_UPDATE', (message: any) => {
      setConnections(message.connections || []);
    });

    wsService.on('CONNECTIONS_LIST', (message: any) => {
      setConnections(message.connections || []);
    });

    // Display events
    wsService.on('display_info', (message: any) => {
      // Handle display deletion
      if (message.deleted_display_id) {
        setDisplays(prevDisplays =>
          prevDisplays.filter(d => d.id !== message.deleted_display_id)
        );

        // If deleted display was the default, clear default display ID
        if (message.deleted_display_id === defaultDisplayId) {
          setDefaultDisplayId(null);
        }
      }

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
      setDefaultDisplayId(message.default_display_id);
    });

    // Disconnection by host event
    wsService.on('disconnected_by_host', (message: any) => {
      // Stop any ongoing connection health monitoring
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }

      // Set disconnection state
      setConnected(false);
      setConnectionStatus('disconnected');
      setConnectionMessage('Disconnected by host');

      // Store disconnection details
      setDisconnectedByHost({
        message: message.message || 'You have been disconnected from the room',
        disconnected_by: message.disconnected_by || {
          connection_id: 'unknown',
          connection_name: 'Host'
        }
      });

      // Clear other state
      setTimers([]);
      setSelectedTimerId(null);
      setRoomInfo(null);
      setDisplays([]);
      setConnections([]);
      setConnectionCount(0);
      setDefaultDisplayId(null);
      setMessages([]);
      setLastError(null);
      setLastSuccess(null);
    });

    // Token revocation event - central handler for all token revocations
    wsService.on('room_access_token_revoked', (message: any) => {
      const tokenIdStr = String(message.token_id);

      // Check if the revoked token belongs to the current user
      let isCurrentUserRevoked = false;
      setConnections((prev) => {
        const revokedConn = prev.find(conn => String(conn.access_token_id) === tokenIdStr && conn.is_self);
        isCurrentUserRevoked = !!revokedConn;

        // Remove all connections that used the revoked token
        const updated = prev.filter(conn => String(conn.access_token_id) !== tokenIdStr);
        return updated;
      });

      // Only show revocation modal if the revoked token belongs to the current user
      if (isCurrentUserRevoked) {
        setRevokedToken({
          message: message.message || 'Your access token has been revoked',
          token_id: message.token_id,
          token_name: message.token_name,
          reason: message.reason || 'Token revoked by room administrator'
        });

        // The connection will be closed by the server shortly,
        // but we prepare for disconnection
        setConnectionStatus('disconnected');
        setConnectionMessage('Access token revoked');

        // Sign out the user if their token is revoked
        setIsAuthenticated(false);

        // Clear room state
        setTimers([]);
        setSelectedTimerId(null);
        setRoomInfo(null);
        setDisplays([]);
        setMessages([]);
      }
    });

    // Token verification result - when tokens are verified as invalid, they're handled elsewhere
    // (The share modal will remove them from display when they're marked as invalid)
    wsService.on('room_access_token_verify_result', (message: any) => {
      // Token verification results are consumed by the share modal
      // If invalid, the modal will remove it from the UI
    });

    // Message events
    wsService.on('messages_list', (message: any) => {
      if (message.messages && Array.isArray(message.messages)) {
        // Deduplicate messages by ID before setting
        setMessages(prevMessages => {
          const newMessages = message.messages as MessageData[];
          const messageMap = new Map<string, MessageData>();

          // Add existing messages first
          prevMessages.forEach(msg => messageMap.set(msg.id, msg));

          // Add/update with new messages (newer data wins)
          newMessages.forEach(msg => messageMap.set(msg.id, msg));

          return Array.from(messageMap.values());
        });
      }
    });

    // User plan features event
    wsService.on('user_plan_features', (message: any) => {
      if (message.plan) {
        setUserPlan(message.plan);
      }

      if (message.features) {
        setPlanFeatures(message.features as PlanFeatures);
      }
    });

    // Token expiration event
    wsService.on('token_expired', (message: any) => {
      setTokenEvent({
        type: 'token_expired',
        message: message.message || 'Your access token has expired. Please refresh your credentials.',
        reason: message.reason
      });

      // Immediately disconnect and clear auth state
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }

      setConnected(false);
      setConnectionStatus('disconnected');
      setConnectionMessage('Token expired');

      // Clear auth state in provider - this triggers AuthGuard redirect
      setIsAuthenticated(false);

      // Clear all room-related state
      setTimers([]);
      setSelectedTimerId(null);
      setRoomInfo(null);
      setDisplays([]);
      setConnections([]);
      setMessages([]);
    });

    // Token revocation event
    wsService.on('token_revoked', (message: any) => {
      setTokenEvent({
        type: 'token_revoked',
        message: message.message || 'Your access token has been revoked. You will be disconnected.',
        reason: message.reason
      });

      // Immediately disconnect and clear auth state
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }

      setConnected(false);
      setConnectionStatus('disconnected');
      setConnectionMessage('Token revoked');

      // Clear auth state - this will trigger redirect
      setIsAuthenticated(false);

      // Clear room state
      setTimers([]);
      setSelectedTimerId(null);
      setRoomInfo(null);
      setDisplays([]);
      setMessages([]);
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

  // Set connection health callback to update UI state
  wsService.setConnectionHealthCallback((status, message) => {
    setConnectionStatus(status);
    setConnectionMessage(message || null);
  });

  // Initial state for reconnection
  setConnectionStatus('reconnecting');
  setConnectionMessage('Connecting to room...');

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
  setConnectionStatus('disconnected');
  setConnectionMessage('Disconnected by user');
  setDisconnectedByHost(null);
  setTokenEvent(null);
  setTimers([]);
  setSelectedTimerId(null);
  setRoomInfo(null);
  setDisplays([]);
  setConnections([]);
  setConnectionCount(0);
  setDefaultDisplayId(null);
  setMessages([]);
  setLastError(null);
  setLastSuccess(null);
  setUserPlan(null);
  setPlanFeatures(null);
}, []);

  // Timer controls
const startTimer = useCallback((timerId: number) => {
  if (!wsServiceRef.current) return;

  addPendingOperation(`timer_start_${timerId}`);

  // Pause all other active timers before starting the new one
  const activeTimers = timers.filter(
    timer => timer.is_active && !timer.is_paused && timer.id !== timerId
  );
  activeTimers.forEach(timer => {
    wsServiceRef.current?.pauseTimer(timer.id);
  });

  // Then start the requested timer
  wsServiceRef.current.startTimer(timerId);

  // Failsafe: clear pending state after 10 seconds
  setTimeout(() => removePendingOperation(`timer_start_${timerId}`), 10000);
}, [timers, addPendingOperation, removePendingOperation]);

const pauseTimer = useCallback((timerId: number) => {
  addPendingOperation(`timer_pause_${timerId}`);
  wsServiceRef.current?.pauseTimer(timerId);

  // Failsafe: clear pending state after 10 seconds
  setTimeout(() => removePendingOperation(`timer_pause_${timerId}`), 10000);
}, [addPendingOperation, removePendingOperation]);

const stopTimer = useCallback((timerId: number) => {
  addPendingOperation(`timer_stop_${timerId}`);
  wsServiceRef.current?.stopTimer(timerId);

  // Failsafe: clear pending state after 10 seconds
  setTimeout(() => removePendingOperation(`timer_stop_${timerId}`), 10000);
}, [addPendingOperation, removePendingOperation]);

const resetTimer = useCallback((timerId: number) => {
  addPendingOperation(`timer_${timerId}`);
  wsServiceRef.current?.resetTimer(timerId);

  // Failsafe: clear pending state after 10 seconds
  setTimeout(() => removePendingOperation(`timer_${timerId}`), 10000);
}, [addPendingOperation, removePendingOperation]);

const adjustTimer = useCallback((timerId: number, newTimeSeconds: number) => {
  addPendingOperation(`timer_adjust_${timerId}`);

  // Apply optimistic update immediately
  setTimers(prev => {
    const index = prev.findIndex(t => t.id === timerId);
    if (index === -1) return prev;

    const currentTimer = prev[index];

    // Store previous state for rollback
    const rollbackTimeout = setTimeout(() => {
      // Rollback if no confirmation after 5 seconds
      console.warn(`No confirmation for timer ${timerId} adjustment, rolling back...`);
      setTimers(rollbackPrev => {
        const rollbackIndex = rollbackPrev.findIndex(t => t.id === timerId);
        if (rollbackIndex === -1) return rollbackPrev;
        const newTimers = [...rollbackPrev];
        newTimers[rollbackIndex] = currentTimer;
        return newTimers;
      });
      optimisticUpdatesRef.current.delete(timerId);
      removePendingOperation(`timer_adjust_${timerId}`);
    }, 5000);

    optimisticUpdatesRef.current.set(timerId, {
      previous: currentTimer,
      timeout: rollbackTimeout
    });

    // Apply optimistic update
    const newTimers = [...prev];
    newTimers[index] = { ...currentTimer, current_time_seconds: newTimeSeconds };
    return newTimers;
  });

  // Send to server
  wsServiceRef.current?.adjustTimer(timerId, newTimeSeconds);

  // Failsafe: clear pending state after 10 seconds
  setTimeout(() => removePendingOperation(`timer_adjust_${timerId}`), 10000);
}, [addPendingOperation, removePendingOperation]);

const updateTimer = useCallback((timerId: number, updates: Partial<TimerData>) => {
  addPendingOperation(`timer_update_${timerId}`);

  // Apply optimistic update immediately
  setTimers(prev => {
    const index = prev.findIndex(t => t.id === timerId);
    if (index === -1) return prev;

    const currentTimer = prev[index];

    // Store previous state for rollback
    const rollbackTimeout = setTimeout(() => {
      // Rollback if no confirmation after 5 seconds
      setTimers(rollbackPrev => {
        const rollbackIndex = rollbackPrev.findIndex(t => t.id === timerId);
        if (rollbackIndex === -1) return rollbackPrev;
        const newTimers = [...rollbackPrev];
        newTimers[rollbackIndex] = currentTimer;
        return newTimers;
      });
      optimisticUpdatesRef.current.delete(timerId);
      removePendingOperation(`timer_update_${timerId}`);
    }, 5000);

    optimisticUpdatesRef.current.set(timerId, {
      previous: currentTimer,
      timeout: rollbackTimeout
    });

    // Apply optimistic update
    const newTimers = [...prev];
    newTimers[index] = { ...currentTimer, ...updates };
    return newTimers;
  });

  // Send to server
  wsServiceRef.current?.updateTimer(timerId, updates);

  // Extended failsafe: clear pending state after 15 seconds (increased from 10s)
  setTimeout(() => {
    removePendingOperation(`timer_update_${timerId}`);
  }, 15000);
}, [addPendingOperation, removePendingOperation]);

const bulkUpdateTimers = useCallback((updates: Array<{ timer_id: number; room_sequence_order: number }>) => {
  addPendingOperation('timer_bulk_update');

  // Add pending operations for each timer to prevent individual updates from interfering
  updates.forEach(update => {
    addPendingOperation(`timer_bulk_update_${update.timer_id}`);
  });

  wsServiceRef.current?.bulkUpdateTimers(updates);

  // Keep bulk update operations pending longer to block interfering timer_update messages
  // Bulk updates can take longer to propagate and receive confirmation
  setTimeout(() => {
    removePendingOperation('timer_bulk_update');
    updates.forEach(update => {
      removePendingOperation(`timer_bulk_update_${update.timer_id}`);
    });
  }, 3000); // Extended timeout to handle slower networks and delayed updates
}, [addPendingOperation, removePendingOperation]);

const deleteTimer = useCallback((timerId: number) => {
  addPendingOperation(`timer_delete_${timerId}`);
  wsServiceRef.current?.deleteTimer(timerId);

  // Failsafe: clear pending state after 10 seconds
  setTimeout(() => removePendingOperation(`timer_delete_${timerId}`), 10000);
}, [addPendingOperation, removePendingOperation]);

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
  addPendingOperation('timer_create');
  wsServiceRef.current?.createTimer(timerData);

  // Failsafe: clear pending state after 10 seconds
  setTimeout(() => removePendingOperation('timer_create'), 10000);
}, [addPendingOperation, removePendingOperation]);

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

const deleteDisplay = useCallback((displayId: number) => {
  wsServiceRef.current?.deleteDisplay(displayId);
}, []);

// Connections
const requestConnections = useCallback(() => {
  wsServiceRef.current?.requestConnections();
}, []);

const disconnectClient = useCallback((targetConnectionId: string) => {
  wsServiceRef.current?.disconnectClient(targetConnectionId);
}, []);

const revokeAccessToken = useCallback((tokenId: number) => {
  wsServiceRef.current?.revokeAccessToken(tokenId);
  // Optimistically remove all connections with this token
  setConnections(prev => prev.filter(conn => conn.access_token_id !== tokenId));
}, []);

// Message management
const addMessage = useCallback((messageData: Omit<MessageData, 'id'>) => {
  wsServiceRef.current?.addMessage(messageData);
}, []);

const updateMessage = useCallback((messageId: string, updateData: Partial<MessageData>) => {
  wsServiceRef.current?.updateMessage(messageId, updateData);
}, []);

const deleteMessage = useCallback((messageId: string) => {
  // Immediately remove from local state (trust the delete request)
  setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));

  // Send delete request to backend - backend will confirm with messages_list
  wsServiceRef.current?.deleteMessage(messageId);
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
    connectionStatus,
    connectionMessage,
    disconnectedByHost,
    revokedToken,
    tokenEvent,
    userPlan,
    planFeatures,
    timers,
    selectedTimerId,
    roomInfo,
    displays,
    connections,
    connectionCount,
    defaultDisplayId,
    messages,
    lastError,
    lastSuccess,
    pendingOperations,
    isOperationPending,
    wsService: wsServiceRef.current,
    connect,
    disconnect,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    adjustTimer,
    updateTimer,
    bulkUpdateTimers,
    deleteTimer,
    selectTimer,
    createTimer,
    createDisplay,
    updateDisplay,
    setDefaultDisplay,
    deleteDisplay,
    refreshTimers,
    joinRoom,
    leaveRoom,
    updateRoom,
    requestConnections,
    disconnectClient,
    revokeAccessToken,
    addMessage,
    updateMessage,
    deleteMessage,
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
