import { useState, useEffect } from 'react';
import { 
  Paper, 
  Title, 
  Text, 
  Group, 
  Badge, 
  Stack, 
  Avatar, 
  Tooltip,
  ActionIcon,
  ScrollArea,
  Divider,
  Box,
  Indicator
} from '@mantine/core';
import {
  PiDevices as DeviceIcon,
  PiUser as UserIcon,
  PiEye as ViewerIcon,
  PiCrown as AdminIcon,
  PiCircle as OnlineIcon,
  PiSignOut as DisconnectIcon,
  PiDotsThreeOutline as DetailsIcon
} from 'react-icons/pi';

// Types based on the backend structure
interface ConnectionInfo {
  connection_id: string;
  room_id: string;
  user_id: number;
  ip_address: string;
  connected_at: string;
  last_ping?: string | null;
  user_agent?: string | null;
  access_level: 'viewer' | 'full';
  connection_name: string;
  identity_info?: string | null;
  access_token_id?: number | null;
  is_self?: boolean;
}

interface ConnectedDevicesProps {
  /** Array of connection information */
  connections?: ConnectionInfo[];
  /** Current user's access level - only 'full' access shows detailed info */
  currentUserAccess?: 'viewer' | 'full';
  /** Callback when user wants to disconnect a device */
  onDisconnectDevice?: (connectionId: string) => void;
  /** Show only basic connection count */
  compactMode?: boolean;
  /** Custom styles */
  className?: string;
}

// Mock data for demonstration
const mockConnections: ConnectionInfo[] = [
  {
    connection_id: 'conn_1',
    room_id: 'room_123',
    user_id: 1,
    ip_address: '192.168.1.100',
    connected_at: '2025-09-27T08:30:00Z',
    last_ping: '2025-09-27T09:15:00Z',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    access_level: 'full',
    connection_name: 'John Doe',
    is_self: true,
    access_token_id: 456
  },
  {
    connection_id: 'conn_2',
    room_id: 'room_123',
    user_id: 2,
    ip_address: '192.168.1.101',
    connected_at: '2025-09-27T08:45:00Z',
    last_ping: '2025-09-27T09:14:30Z',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    access_level: 'viewer',
    connection_name: 'Jane Smith',
    is_self: false
  },
  {
    connection_id: 'conn_3',
    room_id: 'room_123',
    user_id: 0,
    ip_address: '192.168.1.102',
    connected_at: '2025-09-27T09:00:00Z',
    last_ping: '2025-09-27T09:13:45Z',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    access_level: 'viewer',
    connection_name: 'Guest_001',
    is_self: false
  },
  {
    connection_id: 'conn_4',
    room_id: 'room_123',
    user_id: 3,
    ip_address: '10.0.1.50',
    connected_at: '2025-09-27T09:10:00Z',
    last_ping: '2025-09-27T09:15:15Z',
    user_agent: 'TimerApp/1.0 (Token: premium_display)',
    access_level: 'full',
    connection_name: 'Display Controller',
    is_self: false,
    access_token_id: 789
  }
];

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  return time.toLocaleDateString();
}

function getDeviceType(userAgent?: string | null): string {
  if (!userAgent) return 'Unknown';
  
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Macintosh')) return 'Mac';
  if (userAgent.includes('TimerApp') || userAgent.includes('Token:')) return 'Display';
  
  return 'Browser';
}

function ConnectionItem({
  connection,
  currentUserAccess,
  onDisconnect
}: {
  connection: ConnectionInfo;
  currentUserAccess: 'viewer' | 'full';
  onDisconnect?: (connectionId: string) => void;
}) {
  console.log('Rendering connection:', connection.connection_name, 'Full connection object:', connection);
  const [expanded, setExpanded] = useState(false);
  const deviceType = getDeviceType(connection.user_agent);
  const isOnline = connection.last_ping ?
    (new Date().getTime() - new Date(connection.last_ping).getTime()) < 300000  : true;

  // Check if this is the current user's connection
  // Backend might send 'self' instead of 'is_self'
  const isSelf = connection.is_self === true || (connection as any).self === true;
  console.log('isSelf check:', {
    is_self: connection.is_self,
    self: (connection as any).self,
    isSelf: isSelf,
    connectionName: connection.connection_name
  });

  return (
    <Box p="sm">
      <Group justify="space-between" wrap="nowrap">
        <Group wrap="nowrap" gap="sm" style={{ flex: 1, minWidth: 0 }}>
          <Indicator
            color={isOnline ? 'teal' : 'gray'}
            size={6}
            offset={2}
            processing={isOnline}
          >
            <Avatar size="sm" color="blue">
              <UserIcon size="1rem" />
            </Avatar>
          </Indicator>

          <div style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" wrap="nowrap" align="center">
              <Text size="sm" fw={500} truncate>
                {connection.connection_name}
              </Text>

              <Tooltip label={connection.access_level === 'full' ? 'Admin access' : 'Viewer access'} withinPortal>
                {connection.access_level === 'full' ? (
                  <AdminIcon size="0.7rem" color="var(--mantine-color-blue-6)" />
                ) : (
                  <ViewerIcon size="0.7rem" color="var(--mantine-color-gray-6)" />
                )}
              </Tooltip>

              {isSelf && (
                <Badge size="xs" color="green" variant="dot">
                  You
                </Badge>
              )}
            </Group>
          </div>
        </Group>

        <Group gap="xs">
          {currentUserAccess === 'full' && (
            <Tooltip label={expanded ? "Hide details" : "Show details"} withinPortal>
              <ActionIcon
                variant="subtle"
                size="xs"
                onClick={() => setExpanded(!expanded)}
              >
                <DetailsIcon size="0.8rem" />
              </ActionIcon>
            </Tooltip>
          )}
          {currentUserAccess === 'full' && !isSelf && onDisconnect && (
            <Tooltip label="Disconnect device" withinPortal>
              <ActionIcon
                variant="subtle"
                color="red"
                size="xs"
                onClick={() => onDisconnect(connection.connection_id)}
              >
                <DisconnectIcon size="0.8rem" />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      {expanded && currentUserAccess === 'full' && (
        <Box mt="xs" pl="calc(var(--mantine-spacing-sm) * 2.5)">
          <Text size="xs" c="dimmed">
            {deviceType} • Connected {formatTimeAgo(connection.connected_at)}
          </Text>
          <Text size="xs" c="dimmed">
            {connection.ip_address}
            {connection.last_ping && ` • Last seen ${formatTimeAgo(connection.last_ping)}`}
          </Text>
        </Box>
      )}
    </Box>
  );
}

export function ConnectedDevices({
  connections = mockConnections,
  currentUserAccess = 'full',
  onDisconnectDevice,
  compactMode = false,
  className
}: ConnectedDevicesProps) {
  const [connectionList, setConnectionList] = useState<ConnectionInfo[]>(connections);
  
  useEffect(() => {
    console.log('ConnectedDevices received connections:', connections);
    setConnectionList(connections);
  }, [connections]);
  
  const handleDisconnect = (connectionId: string) => {
    if (onDisconnectDevice) {
      onDisconnectDevice(connectionId);
      // Optimistically remove from local state
      setConnectionList(prev => prev.filter(conn => conn.connection_id !== connectionId));
    }
  };
  
  const totalConnections = connectionList.length;
  const fullAccessCount = connectionList.filter(c => c.access_level === 'full').length;
  const viewerCount = connectionList.filter(c => c.access_level === 'viewer').length;
  const onlineCount = connectionList.filter(c => {
    if (!c.last_ping) return true;
    return (new Date().getTime() - new Date(c.last_ping).getTime()) < 60000;
  }).length;
  
  if (compactMode) {
    return (
      <Paper withBorder p="md" className={className}>
        <Group justify="space-between">
          <Group gap="xs">
            <DeviceIcon size="1.2rem" />
            <Text size="sm" fw={500}>Connected Devices</Text>
          </Group>
          <Badge color="teal" variant="light">
            {totalConnections} online
          </Badge>
        </Group>
      </Paper>
    );
  }
  
  // Only show detailed view for full access users
  if (currentUserAccess !== 'full') {
    return (
      <Paper withBorder p="md" className={className}>
        <Group gap="sm" mb="md">
          <DeviceIcon size="1.5rem" />
          <div>
            <Title order={4}>Connected Devices</Title>
            <Text size="sm" c="dimmed">
              {totalConnections} device{totalConnections !== 1 ? 's' : ''} connected
            </Text>
          </div>
        </Group>
        
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Device details are only available to administrators
        </Text>
      </Paper>
    );
  }
  
  return (
    <Paper withBorder className={className}>
      <Box p="md">
        <Group gap="sm" mb="md">
          <DeviceIcon size="1.5rem" />
          <div style={{ flex: 1 }}>
            <Title order={4}>Connected Devices</Title>
            <Group gap="md" mt="xs">
              <Text size="sm" c="dimmed">
                {onlineCount} online
              </Text>
              <Text size="sm" c="dimmed">
                {fullAccessCount} admin{fullAccessCount !== 1 ? 's' : ''}
              </Text>
              <Text size="sm" c="dimmed">
                {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
              </Text>
            </Group>
          </div>
        </Group>
      </Box>
      
      <Divider />
      
      <ScrollArea mah={400}>
        <Stack gap={0}>
          {connectionList.map((connection, index) => (
            <Box key={connection.connection_id}>
              <ConnectionItem 
                connection={connection}
                currentUserAccess={currentUserAccess}
                onDisconnect={handleDisconnect}
              />
              {index < connectionList.length - 1 && <Divider />}
            </Box>
          ))}
        </Stack>
      </ScrollArea>
      
      {totalConnections === 0 && (
        <Box p="xl" ta="center">
          <Text size="sm" c="dimmed">
            No devices currently connected
          </Text>
        </Box>
      )}
    </Paper>
  );
}
