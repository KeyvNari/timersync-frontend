import React, { useState, useEffect } from 'react';
import {
  Modal,
  Text,
  Button,
  Stack,
  Group,
  TextInput,
  Select,
  PasswordInput,
  Checkbox,
  Divider,
  Badge,
  CopyButton,
  ActionIcon,
  Box,
  Tabs,
  Alert,
} from '@mantine/core';
import {
  IconCopy,
  IconCheck,
  IconUsers,
  IconEye,
  IconEyeOff,
  IconQrcode,
  IconLink,
  IconDeviceDesktop,
  IconX,
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
  created_at: string;
}

const ShareRoomModal: React.FC<ShareRoomModalProps> = ({
  opened,
  onClose,
  roomId,
  roomName,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [accessLevel, setAccessLevel] = useState<'full' | 'viewer' | 'plan_view'>('viewer');
  const [tokenName, setTokenName] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createdTokens, setCreatedTokens] = useState<RoomAccessToken[]>([]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [qrCodes, setQrCodes] = useState<Map<string, string>>(new Map());

  const { wsService } = useWebSocketContext();

  // QR code modal
  const [qrOpened, { open: openQr, close: closeQr }] = useDisclosure(false);
  const [currentQrToken, setCurrentQrToken] = useState<RoomAccessToken | null>(null);

  useEffect(() => {
    if (opened && activeTab === 'manage') {
      loadTokens();
    }
  }, [opened, activeTab]);

  const loadTokens = () => {
    if (!wsService) return;

    wsService.listRoomAccessTokens();

    const handleTokenList = (message: any) => {
      if (message.tokens) {
        setCreatedTokens(message.tokens);
      }
      wsService.off('success', handleTokenList);
    };

    wsService.on('success', handleTokenList);
  };

  const generateLink = (token: string, accessLevel: 'full' | 'viewer' | 'plan_view') => {
    const baseUrl = window.location.origin;
    if (accessLevel === 'plan_view') {
      // Plan view not implemented yet, default to viewer
      accessLevel = 'viewer';
    }

    const route = accessLevel === 'full' ? 'controller' : 'viewer';
    return `${baseUrl}/${route}/${roomId}/${token}`;
  };

  const handleCreateToken = async () => {
    if (!wsService || !tokenName.trim()) return;

    setIsLoading(true);

    const tokenData: any = {
      access_level: accessLevel,
      name: tokenName.trim(),
      is_password_protected: isPasswordProtected,
    };

    if (isPasswordProtected && password) {
      tokenData.password = password;
    }

    const handleTokenCreate = async (message: any) => {
      if (message.token) {
        // Generate QR code for the new token
        const link = generateLink(message.token.token, message.token.access_level);
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(link);
          setQrCodes(prev => new Map(prev.set(message.token.token, qrCodeDataUrl)));
        } catch (error) {
          console.error('Failed to generate QR code:', error);
        }

        setCreatedTokens(prev => [...prev, message.token]);
        setActiveTab('manage');
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

  const handleCopyLink = (token: RoomAccessToken) => {
    const link = generateLink(token.token, token.access_level);
    navigator.clipboard.writeText(link);
    setCopySuccess(token.token);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const showQrCode = (token: RoomAccessToken) => {
    setCurrentQrToken(token);
    openQr();
  };

  const getAccessLevelIcon = (level: 'full' | 'viewer' | 'plan_view') => {
    switch (level) {
      case 'full':
        return <IconDeviceDesktop size={16} />;
      case 'viewer':
        return <IconEye size={16} />;
      case 'plan_view':
        return <IconEyeOff size={16} />;
      default:
        return <IconUsers size={16} />;
    }
  };

  const getAccessLevelLabel = (level: 'full' | 'viewer' | 'plan_view') => {
    switch (level) {
      case 'full':
        return 'Full Control';
      case 'viewer':
        return 'View Only';
      case 'plan_view':
        return 'Plan View';
      default:
        return level;
    }
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
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as any)}>
          <Tabs.List>
            <Tabs.Tab value="create">Create Link</Tabs.Tab>
            <Tabs.Tab value="manage">
              Manage Links {createdTokens.length > 0 && `(${createdTokens.length})`}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="create" pt="md">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Create a new access link for others to join this room.
              </Text>

              <Select
                label="Access Level"
                data={[
                  { value: 'viewer', label: 'View Only - Can see timers and chat' },
                  { value: 'full', label: 'Full Control - Can control timers and manage room' },
                  // { value: 'plan_view', label: 'Plan View (Coming Soon)' }, // Not implemented yet
                ]}
                value={accessLevel}
                onChange={(value) => setAccessLevel(value as any)}
                required
              />

              <TextInput
                label="Link Name"
                placeholder="e.g., John's Viewer Link, Team Meeting Access"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                required
              />

              <Checkbox
                label="Password protect this link"
                checked={isPasswordProtected}
                onChange={(e) => setIsPasswordProtected(e.currentTarget.checked)}
              />

              {isPasswordProtected && (
                <PasswordInput
                  label="Password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}

              <Group justify="right" mt="md">
                <Button variant="light" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateToken}
                  loading={isLoading}
                  disabled={!tokenName.trim()}
                >
                  Create Link
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="manage" pt="md">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                Manage your created access links.
              </Text>

              {createdTokens.length === 0 ? (
                <Alert title="No links created yet">
                  Create your first access link to get started.
                </Alert>
              ) : (
                createdTokens.map((token) => (
                  <Box key={token.id}>
                    <Group justify="space-between" mb="xs">
                      <Group>
                        <Badge
                          leftSection={getAccessLevelIcon(token.access_level)}
                          variant="light"
                        >
                          {getAccessLevelLabel(token.access_level)}
                        </Badge>
                        <Text fw={500}>{token.name}</Text>
                        {token.password_protected && (
                          <Badge color="orange" variant="dot">
                            Protected
                          </Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        Created: {new Date(token.created_at).toLocaleDateString()}
                      </Text>
                    </Group>

                    <Group>
                      <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                        {generateLink(token.token, token.access_level)}
                      </Text>
                      <CopyButton value={generateLink(token.token, token.access_level)}>
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
                    </Group>
                    <Divider mt="sm" />
                  </Box>
                ))
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Modal>

      {/* QR Code Modal */}
      {currentQrToken && (
        <Modal
          opened={qrOpened}
          onClose={closeQr}
          title={`QR Code - ${currentQrToken.name}`}
          size="sm"
          centered
        >
          <Stack align="center">
            <Text size="sm" c="dimmed" ta="center">
              Scan this QR code to join as {getAccessLevelLabel(currentQrToken.access_level).toLowerCase()}:
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
              <CopyButton value={generateLink(currentQrToken.token, currentQrToken.access_level)}>
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
