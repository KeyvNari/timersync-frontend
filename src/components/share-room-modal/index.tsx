import React, { useState, useEffect } from 'react';
import {
  Modal,
  Text,
  Button,
  Stack,
  Group,
  TextInput,
  PasswordInput,
  Checkbox,
  Divider,
  Badge,
  CopyButton,
  ActionIcon,
  Box,
  Tabs,
  Alert,
  Paper,
  List,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCopy,
  IconCheck,
  IconEye,
  IconQrcode,
  IconDeviceDesktop,
  IconTrash,
  IconCircleCheck,
  IconEdit,
  IconClock,
  IconMessages,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import { useWebSocketContext } from '@/providers/websocket-provider';
import { useDisclosure } from '@mantine/hooks';
import QRCode from 'qrcode';

interface ShareRoomModalProps {
  opened: boolean;
  onClose: () => void;
  roomId: number;
  roomName: string;
}

interface RoomAccessToken {
  id: number;
  access_level: 'full' | 'viewer' | 'plan_view';
  name?: string;
  token: string;
  password_protected?: boolean;
  is_password_protected?: boolean;
  created_at: string;
}

type AccessLevel = 'full' | 'viewer';

const ShareRoomModal: React.FC<ShareRoomModalProps> = ({
  opened,
  onClose,
  roomId,
  roomName,
}) => {
  const [activeTab, setActiveTab] = useState<AccessLevel>('viewer');
  const [tokenName, setTokenName] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createdTokens, setCreatedTokens] = useState<RoomAccessToken[]>([]);
  const [currentToken, setCurrentToken] = useState<{ [key in AccessLevel]?: RoomAccessToken }>({});
  const [qrCodes, setQrCodes] = useState<Map<string, string>>(new Map());

  const { wsService } = useWebSocketContext();

  // QR code modal
  const [qrOpened, { open: openQr, close: closeQr }] = useDisclosure(false);
  const [currentQrToken, setCurrentQrToken] = useState<RoomAccessToken | null>(null);

  useEffect(() => {
    if (opened) {
      loadTokens();
    }
  }, [opened]);

  const loadTokens = () => {
    if (!wsService) return;

    wsService.listRoomAccessTokens();

    const handleTokenList = (message: any) => {
      if (message.tokens) {
        setCreatedTokens(message.tokens);

        // Set current token for each access level (most recent)
        const fullToken = message.tokens.find((t: RoomAccessToken) => t.access_level === 'full');
        const viewerToken = message.tokens.find((t: RoomAccessToken) => t.access_level === 'viewer');

        setCurrentToken({
          full: fullToken,
          viewer: viewerToken,
        });
      }
      wsService.off('success', handleTokenList);
    };

    wsService.on('success', handleTokenList);
  };

  const generateLink = (token: string, accessLevel: AccessLevel, isPasswordProtected: boolean = false) => {
    const baseUrl = window.location.origin;
    const route = accessLevel === 'full' ? 'controller' : 'viewer';
    const pwdSuffix = isPasswordProtected ? '/pwd' : '';
    return `${baseUrl}/${route}/${roomId}/${token}${pwdSuffix}`;
  };

  const handleCreateToken = async () => {
    if (!wsService) return;

    // Validate password length
    if (isPasswordProtected && password.length < 6) {
      return;
    }

    setIsLoading(true);

    const tokenData: any = {
      access_level: activeTab,
      name: tokenName.trim() || undefined, // Make name optional
      is_password_protected: isPasswordProtected,
    };

    if (isPasswordProtected && password) {
      tokenData.password = password;
    }

    const handleTokenCreate = async (message: any) => {
      if (message.token) {
        // Debug logging
        console.log('📝 Token created:', message.token);
        console.log('🔒 Password protected fields:', {
          password_protected: message.token.password_protected,
          is_password_protected: message.token.is_password_protected
        });

        // Check both field names for password protection
        const isProtected = message.token.password_protected ?? message.token.is_password_protected ?? false;
        console.log('🔐 Final isProtected value:', isProtected);

        // Generate QR code for the new token
        const link = generateLink(message.token.token, message.token.access_level as AccessLevel, isProtected);
        console.log('🔗 Generated link:', link);
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(link);
          setQrCodes(prev => new Map(prev.set(message.token.token, qrCodeDataUrl)));
        } catch (error) {
          console.error('Failed to generate QR code:', error);
        }

        setCreatedTokens(prev => [...prev, message.token]);

        // Update current token for this access level
        setCurrentToken(prev => ({
          ...prev,
          [activeTab]: message.token,
        }));

        // Reset form
        setTokenName('');
        setPassword('');
        setIsPasswordProtected(false);
      }
      wsService.off('success', handleTokenCreate);
      setIsLoading(false);
    };

    wsService.on('success', handleTokenCreate);
    wsService.createRoomAccessToken(tokenData);
  };

  const handleDeleteToken = (tokenId: number) => {
    if (!wsService) return;

    wsService.revokeAccessToken(tokenId);

    // Remove from local state
    setCreatedTokens(prev => prev.filter(t => t.id !== tokenId));

    // Update current token if deleted
    const deletedToken = createdTokens.find(t => t.id === tokenId);
    if (deletedToken && currentToken[deletedToken.access_level as AccessLevel]?.id === tokenId) {
      setCurrentToken(prev => ({
        ...prev,
        [deletedToken.access_level]: undefined,
      }));
    }
  };

  const showQrCode = (token: RoomAccessToken) => {
    setCurrentQrToken(token);
    openQr();
  };

  const getPermissionsList = (level: AccessLevel) => {
    if (level === 'full') {
      return [
        { icon: IconEdit, text: 'Full control over all timers' },
        { icon: IconClock, text: 'Start, pause, and stop timers' },
        { icon: IconSettings, text: 'Create, edit, and delete timers' },
        { icon: IconDeviceDesktop, text: 'Manage displays and connections' },
        { icon: IconMessages, text: 'Access room chat' },
        { icon: IconUsers, text: 'Disconnect other viewers' },
      ];
    } else {
      return [
        { icon: IconEye, text: 'View all timers in real-time' },
        { icon: IconMessages, text: 'Access room chat' },
        { icon: IconCircleCheck, text: 'Read-only access - cannot control timers' },
      ];
    }
  };

  const getAccessLevelIcon = (level: AccessLevel) => {
    return level === 'full' ? <IconDeviceDesktop size={16} /> : <IconEye size={16} />;
  };

  const getAccessLevelLabel = (level: AccessLevel) => {
    return level === 'full' ? 'Full Control' : 'View Only';
  };

  const renderTabContent = (level: AccessLevel) => {
    const token = currentToken[level];
    const permissions = getPermissionsList(level);

    // Check both field names for password protection
    const isProtected = token ? (token.password_protected ?? token.is_password_protected ?? false) : false;

    return (
      <Stack gap="lg" mt="md">
        {/* Permissions Section */}
        <Paper p="md" withBorder>
          <Text size="sm" fw={600} mb="sm">
            What can {level === 'full' ? 'controllers' : 'viewers'} do?
          </Text>
          <List spacing="xs" size="sm" center>
            {permissions.map((perm, idx) => (
              <List.Item
                key={idx}
                icon={
                  <ThemeIcon color={level === 'full' ? 'blue' : 'teal'} size={20} radius="xl">
                    <perm.icon size={12} />
                  </ThemeIcon>
                }
              >
                {perm.text}
              </List.Item>
            ))}
          </List>
        </Paper>

        <Divider />

        {/* Current Link Display */}
        {token && (
          <Box>
            <Text size="sm" fw={600} mb="sm">
              Current Link
            </Text>
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    {token.name && (
                      <Text size="sm" fw={500}>
                        {token.name}
                      </Text>
                    )}
                    {isProtected && (
                      <Badge color="orange" variant="dot" size="sm">
                        Protected
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {new Date(token.created_at).toLocaleDateString()}
                  </Text>
                </Group>

                <Group gap="xs">
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{
                      flex: 1,
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                    }}
                  >
                    {generateLink(token.token, token.access_level as AccessLevel, isProtected)}
                  </Text>
                  <CopyButton value={generateLink(token.token, token.access_level as AccessLevel, isProtected)}>
                    {({ copied, copy }) => (
                      <ActionIcon
                        size="sm"
                        color={copied ? 'teal' : 'blue'}
                        onClick={copy}
                        variant="subtle"
                        title="Copy link"
                      >
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    )}
                  </CopyButton>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="blue"
                    onClick={() => showQrCode(token)}
                    title="Show QR code"
                  >
                    <IconQrcode size={16} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => handleDeleteToken(token.id)}
                    title="Delete link"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Paper>
          </Box>
        )}

        <Divider />

        {/* Generate New Link Section */}
        <Box>
          <Text size="sm" fw={600} mb="sm">
            Generate New Link
          </Text>
          <Stack gap="md">
            <TextInput
              label="Link Name (Optional)"
              placeholder="e.g., John's Link, Team Meeting Access"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              description="Give this link a name to identify it later"
            />

            <Checkbox
              label="Password protect this link"
              checked={isPasswordProtected}
              onChange={(e) => setIsPasswordProtected(e.currentTarget.checked)}
            />

            {isPasswordProtected && (
              <PasswordInput
                label="Password"
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                error={password.length > 0 && password.length < 6 ? 'Password must be at least 6 characters' : null}
                description="Users will need this password to access the room"
              />
            )}

            <Button
              onClick={handleCreateToken}
              loading={isLoading}
              fullWidth
              disabled={isPasswordProtected && password.length < 6}
              leftSection={level === 'full' ? <IconDeviceDesktop size={18} /> : <IconEye size={18} />}
            >
              Generate {level === 'full' ? 'Controller' : 'Viewer'} Link
            </Button>
          </Stack>
        </Box>
      </Stack>
    );
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={`Share ${roomName}`}
        size="lg"
        centered
      >
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as AccessLevel)}>
          <Tabs.List grow>
            <Tabs.Tab
              value="viewer"
              leftSection={<IconEye size={16} />}
            >
              Viewer
            </Tabs.Tab>
            <Tabs.Tab
              value="full"
              leftSection={<IconDeviceDesktop size={16} />}
            >
              Full Control
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="viewer">
            {renderTabContent('viewer')}
          </Tabs.Panel>

          <Tabs.Panel value="full">
            {renderTabContent('full')}
          </Tabs.Panel>
        </Tabs>
      </Modal>

      {/* QR Code Modal */}
      {currentQrToken && (
        <Modal
          opened={qrOpened}
          onClose={closeQr}
          title={`QR Code - ${currentQrToken.name || 'Access Link'}`}
          size="sm"
          centered
        >
          <Stack align="center">
            <Text size="sm" c="dimmed" ta="center">
              Scan this QR code to join as {getAccessLevelLabel(currentQrToken.access_level as AccessLevel).toLowerCase()}:
            </Text>
            {qrCodes.has(currentQrToken.token) ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img
                  src={qrCodes.get(currentQrToken.token)}
                  alt="QR Code"
                  style={{
                    width: '200px',
                    height: '200px',
                    border: '1px solid #e9ecef',
                    borderRadius: '4px',
                    padding: '8px',
                    backgroundColor: 'white'
                  }}
                />
              </div>
            ) : (
              <Text>Loading QR code...</Text>
            )}
            <Group>
              <CopyButton value={generateLink(currentQrToken.token, currentQrToken.access_level as AccessLevel, currentQrToken.password_protected ?? currentQrToken.is_password_protected ?? false)}>
                {({ copied, copy }) => (
                  <Button
                    variant="light"
                    leftSection={<IconCopy size={16} />}
                    onClick={copy}
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                )}
              </CopyButton>
            </Group>
          </Stack>
        </Modal>
      )}
    </>
  );
};

export default ShareRoomModal;
