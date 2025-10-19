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
  Indicator,
  Collapse,
  Button
} from '@mantine/core';
import {
  PiDevices as DeviceIcon,
  PiUser as UserIcon,
  PiEye as ViewerIcon,
  PiCrown as AdminIcon,
  PiCircle as OnlineIcon,
  PiSignOut as DisconnectIcon,
  PiDotsThreeOutline as DetailsIcon,
  PiCaretDown as CaretDownIcon,
  PiCaretRight as CaretRightIcon,
  PiKey as TokenIcon,
  PiTrash as RevokeIcon
} from 'react-icons/pi';

// Types based on the backend structure
interface ConnectionInfo {
  connection_id: string;
  room_id?: string; // Optional since it may not be provided in all contexts
  user_id: number;
  ip_address: string;
  connected_at: string;
  last_ping?: string | null;
  user_agent?: string | null;
  access_level: 'viewer' | 'full';
  connection_name: string;
  identity_info?: string | null;
  access_token_id?: number | string | null;
  access_token_name?: string | null;
  is_self?: boolean;
}

interface ConnectedDevicesProps {
  /** Array of connection information */
  connections?: ConnectionInfo[];
  /** Current user's access level - only 'full' access shows detailed info */
  currentUserAccess?: 'viewer' | 'full';
  /** Callback when user wants to disconnect a device */
  onDisconnectDevice?: (connectionId: string) => void;
  /** Callback when user wants to revoke an access token */
  onRevokeAccessToken?: (tokenId: number) => void;
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

// Group of connections sharing the same access token
interface ConnectionGroup {
  tokenId: number | string | null;
  tokenName: string;
  connections: ConnectionInfo[];
}

function ConnectionGroupItem({
  group,
  currentUserAccess,
  onDisconnect,
  onRevokeToken
}: {
  group: ConnectionGroup;
  currentUserAccess: 'viewer' | 'full';
  onDisconnect?: (connectionId: string) => void;
  onRevokeToken?: (tokenId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const connectionCount = group.connections.length;
  const onlineCount = group.connections.filter(c => {
    if (!c.last_ping) return true;
    return (new Date().getTime() - new Date(c.last_ping).getTime()) < 300000;
  }).length;

  // Check if any connection in the group is self
  const hasSelfConnection = group.connections.some(
    c => c.is_self === true || (c as any).self === true
  );

  return (
    <Box>
      <Box p="sm">
        <Group justify="space-between" wrap="nowrap">
          <Group wrap="nowrap" gap="sm" style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
            <ActionIcon variant="subtle" size="sm">
              {expanded ? <CaretDownIcon size="1rem" /> : <CaretRightIcon size="1rem" />}
            </ActionIcon>

            <Indicator
              color="teal"
              size={6}
              offset={2}
              processing
              disabled={onlineCount === 0}
            >
              <Avatar size="sm" color="violet">
                <TokenIcon size="1rem" />
              </Avatar>
            </Indicator>

            <div style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs" wrap="nowrap" align="center">
                <Text size="sm" fw={500} truncate>
                  {group.tokenName}
                </Text>
                <Badge size="xs" color="gray" variant="light">
                  {connectionCount} {connectionCount === 1 ? 'device' : 'devices'}
                </Badge>
                {hasSelfConnection && (
                  <Badge size="xs" color="green" variant="dot">
                    You
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {onlineCount} online
              </Text>
            </div>
          </Group>

          {currentUserAccess === 'full' && group.tokenId && !hasSelfConnection && onRevokeToken && (
            <Tooltip label="Revoke access token (disconnects all devices)" withinPortal>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Revoke token "${group.tokenName}"? This will disconnect all ${String(connectionCount)} device(s) using this token.`)) {
                    const tokenId = typeof group.tokenId === 'number' ? group.tokenId : Number(group.tokenId);
                    onRevokeToken(tokenId);
                  }
                }}
              >
                <RevokeIcon size="0.9rem" />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>

        <Collapse in={expanded}>
          <Stack gap={0} mt="sm" ml="xl">
            {group.connections.map((connection, index) => (
              <Box key={connection.connection_id}>
                <ConnectionItem
                  connection={connection}
                  currentUserAccess={currentUserAccess}
                  onDisconnect={onDisconnect}
                  isGrouped={true}
                />
                {index < group.connections.length - 1 && <Divider ml="xl" />}
              </Box>
            ))}
          </Stack>
        </Collapse>
      </Box>
    </Box>
  );
}

function ConnectionItem({
  connection,
  currentUserAccess,
  onDisconnect,
  isGrouped = false
}: {
  connection: ConnectionInfo;
  currentUserAccess: 'viewer' | 'full';
  onDisconnect?: (connectionId: string) => void;
  isGrouped?: boolean;
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
  onRevokeAccessToken,
  compactMode = false,
  className
}: ConnectedDevicesProps) {
  const [connectionList, setConnectionList] = useState<ConnectionInfo[]>(connections);

  useEffect(() => {
    console.log('=== ConnectedDevices Update ===');
    console.log('Raw connections:', JSON.stringify(connections, null, 2));
    console.log('Connection details:', connections.map(c => ({
      name: c.connection_name,
      access_token_id: c.access_token_id,
      access_token_name: c.access_token_name,
      type_of_token_id: typeof c.access_token_id,
      is_null: c.access_token_id === null,
      is_undefined: c.access_token_id === undefined,
      is_empty_string: c.access_token_id === '',
      hasToken_check: c.access_token_id != null && c.access_token_id !== '',
      all_keys: Object.keys(c)
    })));
    setConnectionList(connections);
  }, [connections]);

  const handleDisconnect = (connectionId: string) => {
    if (onDisconnectDevice) {
      onDisconnectDevice(connectionId);
      // Optimistically remove from local state
      setConnectionList(prev => prev.filter(conn => conn.connection_id !== connectionId));
    }
  };

  const handleRevokeToken = (tokenId: number) => {
    if (onRevokeAccessToken) {
      onRevokeAccessToken(tokenId);
      // Optimistically remove all connections with this token from local state
      setConnectionList(prev => prev.filter(conn => conn.access_token_id !== tokenId));
    }
  };

  // Group connections by access_token_id
  const connectionGroups = connectionList.reduce<Map<string, ConnectionGroup>>((groups, connection) => {
    // Create a unique key for grouping - handle null/undefined/empty string consistently
    const hasToken = connection.access_token_id != null && connection.access_token_id !== '';
    const tokenKey = hasToken ? `token_${connection.access_token_id}` : 'direct';

    console.log('Grouping connection:', {
      connection_name: connection.connection_name,
      access_token_id: connection.access_token_id,
      access_token_name: connection.access_token_name,
      tokenKey
    });

    if (!groups.has(tokenKey)) {
      // Determine the token name with priority: access_token_name > fallback
      let tokenName: string;
      if (hasToken) {
        if (connection.access_token_name) {
          // Use the access token name if available
          tokenName = connection.access_token_name;
        } else {
          // Fallback to a generic identifier
          tokenName = `Shared Link ${connection.access_token_id}`;
        }
      } else {
        tokenName = 'Direct Access';
      }

      groups.set(tokenKey, {
        tokenId: connection.access_token_id ?? null,
        tokenName,
        connections: []
      });
    }

    groups.get(tokenKey)!.connections.push(connection);
    return groups;
  }, new Map());

  const groupsArray = Array.from(connectionGroups.values());

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
              <Text size="sm" c="dimmed">
                {groupsArray.length} token{groupsArray.length !== 1 ? 's' : ''}
              </Text>
            </Group>
          </div>
        </Group>
      </Box>

      <Divider />

      <ScrollArea mah={400}>
        <Stack gap={0}>
          {groupsArray.map((group, index) => (
            <Box key={group.tokenId != null ? `token_${group.tokenId}` : 'direct'}>
              <ConnectionGroupItem
                group={group}
                currentUserAccess={currentUserAccess}
                onDisconnect={handleDisconnect}
                onRevokeToken={handleRevokeToken}
              />
              {index < groupsArray.length - 1 && <Divider />}
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
