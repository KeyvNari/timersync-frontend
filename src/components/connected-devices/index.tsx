import { useState, useEffect } from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
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
  Alert,
  Modal,
  Button,
  Card,
  ThemeIcon,
  SimpleGrid,
  rem
} from '@mantine/core';
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceLaptop,
  IconWorld,
  IconTrash,
  IconAlertCircle,
  IconShieldOff,
  IconInfoCircle
} from '@tabler/icons-react';

// Types based on the backend structure
interface ConnectionInfo {
  connection_id: string;
  room_id?: string;
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
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hr ago';
  if (diffHours < 24) return `${diffHours} hrs ago`;

  return time.toLocaleDateString();
}

function getDeviceIcon(userAgent?: string | null) {
  if (!userAgent) return <IconWorld size="1rem" />;

  if (userAgent.includes('iPhone') || userAgent.includes('Android Mobile')) return <IconDeviceMobile size="1rem" />;
  if (userAgent.includes('iPad') || userAgent.includes('Tablet')) return <IconDeviceTablet size="1rem" />;
  if (userAgent.includes('Macintosh') || userAgent.includes('Windows')) return <IconDeviceDesktop size="1rem" />;

  return <IconWorld size="1rem" />;
}

function getDeviceLabel(userAgent?: string | null): string {
  if (!userAgent) return 'Unknown Device';

  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Macintosh')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux';

  return 'Browser';
}

// Group of connections sharing the same access token
interface ConnectionGroup {
  tokenId: number | string | null;
  tokenName: string;
  connections: ConnectionInfo[];
}

function ConnectionGroupCard({
  group,
  currentUserAccess,
  onRevokeToken
}: {
  group: ConnectionGroup;
  currentUserAccess: 'viewer' | 'full';
  onRevokeToken?: (tokenId: number) => void;
}) {
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const connectionCount = group.connections.length;

  // Check if any connection in the group is self
  const hasSelfConnection = group.connections.some(
    c => c.is_self === true || (c as any).self === true
  );

  // Get the access level for this group
  const groupAccessLevel = group.connections[0]?.access_level || 'viewer';

  return (
    <Card withBorder padding="sm" radius="md" bg="var(--mantine-color-body)">
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Text fw={600} size="sm" c="bright">
            {group.tokenName}
          </Text>
          {hasSelfConnection && (
            <Badge size="xs" variant="dot" color="green">You</Badge>
          )}
          <Badge
            size="xs"
            variant="light"
            color={groupAccessLevel === 'full' ? 'blue' : 'gray'}
          >
            {groupAccessLevel}
          </Badge>
        </Group>

        {currentUserAccess === 'full' && group.tokenId && !hasSelfConnection && onRevokeToken && (
          <>
            <Tooltip label="Revoke access" withinPortal>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => setRevokeModalOpen(true)}
              >
                <IconTrash size="0.8rem" />
              </ActionIcon>
            </Tooltip>

            <Modal
              opened={revokeModalOpen}
              onClose={() => setRevokeModalOpen(false)}
              title="Revoke Access"
              centered
              size="sm"
            >
              <Stack>
                <Text size="sm">
                  Are you sure you want to revoke access for <b>{group.tokenName}</b>?
                  This will disconnect {connectionCount} device{connectionCount !== 1 ? 's' : ''}.
                </Text>
                <Group justify="flex-end">
                  <Button variant="default" onClick={() => setRevokeModalOpen(false)}>Cancel</Button>
                  <Button color="red" onClick={() => {
                    const tokenId = typeof group.tokenId === 'number' ? group.tokenId : Number(group.tokenId);
                    onRevokeToken(tokenId);
                    setRevokeModalOpen(false);
                  }}>Revoke</Button>
                </Group>
              </Stack>
            </Modal>
          </>
        )}
      </Group>

      <Stack gap="xs">
        {group.connections.map(conn => (
          <ConnectionItem
            key={conn.connection_id}
            connection={conn}
            currentUserAccess={currentUserAccess}
          />
        ))}
      </Stack>
    </Card>
  );
}

function ConnectionItem({
  connection,
  currentUserAccess
}: {
  connection: ConnectionInfo;
  currentUserAccess: 'viewer' | 'full';
}) {
  const isOnline = connection.last_ping ?
    (new Date().getTime() - new Date(connection.last_ping).getTime()) < 300000 : true;

  const isSelf = connection.is_self === true || (connection as any).self === true;

  return (
    <Group wrap="nowrap" align="flex-start" gap="sm">
      <Indicator
        position="bottom-end"
        color={isOnline ? 'teal' : 'gray'}
        offset={2}
        size={6}
        processing={isOnline}
        withBorder
      >
        <ThemeIcon variant="light" color="gray" size="md" radius="xl">
          {getDeviceIcon(connection.user_agent)}
        </ThemeIcon>
      </Indicator>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Group gap="xs" wrap="nowrap">
          <Text size="sm" fw={500} truncate style={{ lineHeight: 1.2 }}>
            {connection.connection_name}
          </Text>
          {isSelf && <Badge size="xs" variant="outline" color="green" radius="sm">This Device</Badge>}
        </Group>

        <Group gap={6} align="center" mt={2}>
          <Text size="xs" c="dimmed">
            {getDeviceLabel(connection.user_agent)}
          </Text>
          {currentUserAccess === 'full' && (
            <>
              <Text size="xs" c="dimmed">•</Text>
              <Text size="xs" c="dimmed" truncate>
                {connection.ip_address}
              </Text>
            </>
          )}
        </Group>
      </div>

      {currentUserAccess === 'full' && (
        <Tooltip label={`Last seen: ${connection.last_ping ? formatTimeAgo(connection.last_ping) : 'Unknown'}`} position="left">
          <ThemeIcon variant="transparent" color="gray" size="xs">
            <IconInfoCircle size="0.8rem" />
          </ThemeIcon>
        </Tooltip>
      )}
    </Group>
  );
}

export function ConnectedDevices({
  connections = mockConnections,
  currentUserAccess = 'full',
  onRevokeAccessToken,
  compactMode = false,
  className
}: ConnectedDevicesProps) {
  const [connectionList, setConnectionList] = useState<ConnectionInfo[]>(connections);
  const features = useFeatureAccess();

  useEffect(() => {
    setConnectionList(connections);
  }, [connections]);

  const handleRevokeToken = (tokenId: number) => {
    if (onRevokeAccessToken) {
      onRevokeAccessToken(tokenId);
      setConnectionList(prev => prev.filter(conn => conn.access_token_id !== tokenId));
    }
  };

  // Group connections
  const connectionGroups = connectionList.reduce<Map<string, ConnectionGroup>>((groups, connection) => {
    const hasToken = connection.access_token_id != null && connection.access_token_id !== '';
    const tokenKey = hasToken ? `token_${connection.access_token_id}` : 'direct';

    if (!groups.has(tokenKey)) {
      let tokenName: string;
      if (hasToken) {
        tokenName = connection.access_token_name || `Shared Link ${connection.access_token_id}`;
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

  if (compactMode) {
    return (
      <Paper withBorder p="xs" className={className}>
        <Group justify="space-between">
          <Group gap="xs">
            <IconWorld size="1rem" />
            <Text size="sm">Devices</Text>
          </Group>
          <Badge size="sm" variant="light">{totalConnections}</Badge>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper withBorder h="100%" display="flex" style={{ flexDirection: 'column' }} className={className}>
      <Box p="md" pb="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon variant="light" size="lg" color="blue">
              <IconWorld size="1.2rem" />
            </ThemeIcon>
            <div>
              <Title order={5}>Connected Devices</Title>
              <Text size="xs" c="dimmed">
                {totalConnections} active {totalConnections === 1 ? 'session' : 'sessions'}
              </Text>
            </div>
          </Group>
        </Group>
      </Box>

      <Divider />

      {!features.canConnectDevice().isAvailable && (
        <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light" radius={0}>
          {features.canConnectDevice().reason}
        </Alert>
      )}

      <ScrollArea style={{ flex: 1 }}>
        <Box p="md">
          {currentUserAccess !== 'full' ? (
            <Stack align="center" py="xl" gap="xs">
              <IconShieldOff size="2rem" color="var(--mantine-color-gray-4)" />
              <Text size="sm" c="dimmed">Full details hidden</Text>
            </Stack>
          ) : groupsArray.length > 0 ? (
            <Stack gap="md">
              {groupsArray.map(group => (
                <ConnectionGroupCard
                  key={group.tokenId != null ? `token_${group.tokenId}` : 'direct'}
                  group={group}
                  currentUserAccess={currentUserAccess}
                  onRevokeToken={handleRevokeToken}
                />
              ))}
            </Stack>
          ) : (
            <Text c="dimmed" ta="center" py="xl" size="sm">No devices connected</Text>
          )}
        </Box>
      </ScrollArea>
    </Paper>
  );
}
