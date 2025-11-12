import { useWebSocketContext } from '@/providers/websocket-provider';

interface FeatureAccessInfo {
  isAvailable: boolean;
  reason?: string;
  remaining?: number;
  limit?: number;
}

/**
 * Hook to check feature availability based on user plan
 * Usage: const features = useFeatureAccess()
 */
export function useFeatureAccess() {
  const context = useWebSocketContext();
  const { timers, messages, connections, planFeatures } = context;

  /**
   * Check if user can create a new timer
   */
  const canCreateTimer = (): FeatureAccessInfo => {
    if (!planFeatures) {
      return { isAvailable: true }; // No plan data yet, allow by default
    }

    const limit = planFeatures.max_timers_in_room;
    const current = timers.length;

    if (current >= limit) {
      return {
        isAvailable: false,
        reason: `Timer limit reached (${current}/${limit})`,
        remaining: 0,
        limit,
      };
    }

    return {
      isAvailable: true,
      remaining: limit - current,
      limit,
    };
  };

  /**
   * Check if user can create a new message
   */
  const canCreateMessage = (): FeatureAccessInfo => {
    if (!planFeatures) {
      return { isAvailable: true }; // No plan data yet, allow by default
    }

    // Check if messages are enabled as a feature
    if (!planFeatures.can_use_room_messages) {
      return {
        isAvailable: false,
        reason: 'Messages are not available in your plan',
      };
    }

    const limit = planFeatures.max_messages_per_room;
    const current = messages.length;

    if (current >= limit) {
      return {
        isAvailable: false,
        reason: `Message limit reached (${current}/${limit})`,
        remaining: 0,
        limit,
      };
    }

    return {
      isAvailable: true,
      remaining: limit - current,
      limit,
    };
  };

  /**
   * Check if user can create a new room
   */
  const canCreateRoom = (): FeatureAccessInfo => {
    if (!planFeatures) {
      return { isAvailable: true }; // No plan data yet, allow by default
    }

    // Note: We don't track room count in the hook since rooms are not loaded in WebSocket context
    // This is a placeholder for now - actual room count should be passed from parent component
    const limit = planFeatures.max_rooms;
    // For now, we return true - the room count validation should happen at the page level
    return {
      isAvailable: true,
      limit,
    };
  };

  /**
   * Check if user can connect a new device
   */
  const canConnectDevice = (): FeatureAccessInfo => {
    if (!planFeatures) {
      return { isAvailable: true }; // No plan data yet, allow by default
    }

    const limit = planFeatures.max_connected_devices;
    const current = connections.length;

    if (current >= limit) {
      return {
        isAvailable: false,
        reason: `Device connection limit reached (${current}/${limit})`,
        remaining: 0,
        limit,
      };
    }

    return {
      isAvailable: true,
      remaining: limit - current,
      limit,
    };
  };

  /**
   * Check if user can customize display
   */
  const canCustomizeDisplay = (): FeatureAccessInfo => {
    if (!planFeatures) {
      return { isAvailable: true }; // No plan data yet, allow by default
    }

    if (!planFeatures.can_customize_display) {
      return {
        isAvailable: false,
        reason: 'Display customization is not available in your plan',
      };
    }

    return { isAvailable: true };
  };

  /**
   * Check if user can save display
   */
  const canSaveDisplay = (): FeatureAccessInfo => {
    if (!planFeatures) {
      return { isAvailable: true }; // No plan data yet, allow by default
    }

    if (!planFeatures.can_save_display) {
      return {
        isAvailable: false,
        reason: 'Saving displays is not available in your plan',
      };
    }

    return { isAvailable: true };
  };

  /**
   * Check if a specific feature is enabled
   */
  const isFeatureEnabled = (featureName: keyof typeof planFeatures): boolean => {
    if (!planFeatures) {
      return true; // No plan data yet, enable by default
    }

    const feature = planFeatures[featureName];
    // Handle both boolean flags and numeric limits
    if (typeof feature === 'boolean') {
      return feature;
    }
    return feature > 0;
  };

  /**
   * Get current usage and limits
   */
  const getTimerQuota = () => ({
    current: timers.length,
    limit: planFeatures?.max_timers_in_room ?? 0,
  });

  const getMessageQuota = () => ({
    current: messages.length,
    limit: planFeatures?.max_messages_per_room ?? 0,
  });

  const getDeviceQuota = () => ({
    current: connections.length,
    limit: planFeatures?.max_connected_devices ?? 0,
  });

  return {
    canCreateTimer,
    canCreateMessage,
    canCreateRoom,
    canConnectDevice,
    canCustomizeDisplay,
    canSaveDisplay,
    isFeatureEnabled,
    getTimerQuota,
    getMessageQuota,
    getDeviceQuota,
    userPlan: context.userPlan,
    planFeatures,
  };
}
