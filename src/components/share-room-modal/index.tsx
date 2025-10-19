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
  Badge,
  CopyButton,
  Box,
  Tabs,
  Paper,
  List,
  ThemeIcon,
  Grid,
  Card,
  Title,
  Alert,
  Loader,
  Center,
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
  IconDownload,
  IconAlertCircle,
  IconRefresh,
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
  const [revokedTokens, setRevokedTokens] = useState<Set<string>>(new Set());
  const [isVerifying, setIsVerifying] = useState(false);

  const { wsService } = useWebSocketContext();

  // QR code modal
  const [qrOpened, { open: openQr, close: closeQr }] = useDisclosure(false);
  const [currentQrToken, setCurrentQrToken] = useState<RoomAccessToken | null>(null);

  // Handler for token verification results
  const handleTokenVerification = (message: any) => {
    console.log('🔍 Token verification result:', message);

    if (message.type === 'room_access_token_verify_result') {
      // Backend now includes the token string in the response
      const verifiedToken = message.token;

      if (!message.valid && verifiedToken) {
        // Only mark tokens that are currently displayed (viewer or full)
        const isCurrentToken = Object.values(currentToken).some(
          token => token && token.token === verifiedToken
        );

        if (isCurrentToken) {
          // Mark this token as revoked (UI will update automatically)
          setRevokedTokens(prev => new Set(prev).add(verifiedToken));
          console.log('Current token revoked:', message.message);
        }
      }

      // Mark verification as complete
      setIsVerifying(false);
    }
  };

  // Setup listener for token verification
  const setupTokenVerificationListener = () => {
    if (!wsService) return;
    wsService.on('room_access_token_verify_result', handleTokenVerification);
  };

  // Verify all current tokens
  const verifyCurrentTokens = () => {
    if (!wsService) return;

    const tokensToVerify = Object.values(currentToken).filter(token => token);

    // If there are tokens to verify, set loading state
    if (tokensToVerify.length > 0) {
      setIsVerifying(true);
    }

    // Verify the current token for each access level
    tokensToVerify.forEach(token => {
      if (token) {
        wsService.verifyRoomAccessToken(token.token);
      }
    });

    // If no tokens to verify, mark as complete immediately
    if (tokensToVerify.length === 0) {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (opened) {
      // Reset states when modal opens
      setIsVerifying(true);
      setRevokedTokens(new Set());
      loadTokens();
      setupTokenVerificationListener();
    } else {
      // Reset verification state when modal closes
      setIsVerifying(false);
    }

    return () => {
      // Cleanup listeners when modal closes
      if (wsService) {
        wsService.off('room_access_token_verify_result', handleTokenVerification);
      }
    };
  }, [opened]);

  // Verify tokens when modal opens and tokens are loaded
  useEffect(() => {
    if (opened && Object.keys(currentToken).length > 0) {
      verifyCurrentTokens();
    }
  }, [opened, currentToken]);

  const loadTokens = async () => {
    if (!wsService) return;

    wsService.listRoomAccessTokens();

    const handleTokenList = async (message: any) => {
      if (message.tokens) {
        setCreatedTokens(message.tokens);

        // Set current token for each access level (most recent)
        const fullToken = message.tokens.find((t: RoomAccessToken) => t.access_level === 'full');
        const viewerToken = message.tokens.find((t: RoomAccessToken) => t.access_level === 'viewer');

        setCurrentToken({
          full: fullToken,
          viewer: viewerToken,
        });

        // Generate QR codes for all tokens
        for (const token of message.tokens) {
          const isProtected = token.password_protected ?? token.is_password_protected ?? false;
          const link = generateLink(token.token, token.access_level as AccessLevel, isProtected);
          try {
            const qrCodeDataUrl = await QRCode.toDataURL(link);
            setQrCodes(prev => new Map(prev.set(token.token, qrCodeDataUrl)));
          } catch (error) {
            console.error('Failed to generate QR code for token:', error);
          }
        }
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

  const downloadQrCode = () => {
    if (!currentQrToken || !qrCodes.has(currentQrToken.token)) return;

    const qrCodeDataUrl = qrCodes.get(currentQrToken.token);
    if (!qrCodeDataUrl) return;

    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `${roomName}-${currentQrToken.name || getAccessLevelLabel(currentQrToken.access_level as AccessLevel)}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

    // Check if current token is revoked
    const isTokenRevoked = token ? revokedTokens.has(token.token) : false;

    return (
      <Grid gutter="xl" mt="md">
        {/* Left Column - Generate New Link */}
        <Grid.Col span={6}>
          <Card withBorder h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
            <Title order={5} mb="md">Generate New Link</Title>
            <Stack gap="md" style={{ flex: 1 }}>
              <TextInput
                label="Link Name (Optional)"
                placeholder="e.g., John's Link, Team Access"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                size="sm"
              />

              <Box>
                <Checkbox
                  label="Password protect this link"
                  checked={isPasswordProtected}
                  onChange={(e) => setIsPasswordProtected(e.currentTarget.checked)}
                  mb="xs"
                />

                {isPasswordProtected && (
                  <PasswordInput
                    placeholder="Enter password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    size="sm"
                    error={password.length > 0 && password.length < 6 ? 'Min 6 characters' : null}
                  />
                )}
              </Box>

              <Button
                onClick={handleCreateToken}
                loading={isLoading}
                fullWidth
                disabled={isPasswordProtected && password.length < 6}
                leftSection={level === 'full' ? <IconDeviceDesktop size={18} /> : <IconEye size={18} />}
                size="md"
                mt="auto"
              >
                Generate {level === 'full' ? 'Controller' : 'Viewer'} Link
              </Button>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Right Column - Permissions & Current Link */}
        <Grid.Col span={6}>
          <Stack gap="md" h="100%">
            {/* Permissions Section */}
            <Card withBorder>
              <Title order={5} mb="sm">Access Permissions</Title>
              <List spacing="xs" size="sm">
                {permissions.map((perm, idx) => (
                  <List.Item
                    key={idx}
                    icon={
                      <ThemeIcon color={level === 'full' ? 'blue' : 'teal'} size={18} radius="xl">
                        <perm.icon size={11} />
                      </ThemeIcon>
                    }
                  >
                    <Text size="sm">{perm.text}</Text>
                  </List.Item>
                ))}
              </List>
            </Card>

            {/* Revoked Token Alert */}
            {isTokenRevoked && token && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Token Revoked"
                color="red"
                variant="light"
              >
                <Text size="sm" mb="sm">
                  This access token has been revoked and is no longer valid. Please generate a new link.
                </Text>
                <Button
                  size="xs"
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => {
                    // Clear the revoked state and remove from current token
                    setRevokedTokens(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(token.token);
                      return newSet;
                    });
                    setCurrentToken(prev => ({
                      ...prev,
                      [level]: undefined,
                    }));
                  }}
                >
                  Generate New Link
                </Button>
              </Alert>
            )}

            {/* Current Link Display */}
            {token && !isTokenRevoked && (
              <Card withBorder style={{ flex: 1 }}>
                <Group justify="space-between" mb="sm">
                  <Title order={5}>Current Link</Title>
                  <Group gap="xs">
                    {isProtected && (
                      <Badge color="orange" variant="dot" size="sm">
                        Protected
                      </Badge>
                    )}
                    <Text size="xs" c="dimmed">
                      {new Date(token.created_at).toLocaleDateString()}
                    </Text>
                  </Group>
                </Group>

                {token.name && (
                  <Text size="sm" fw={500} mb="xs">
                    {token.name}
                  </Text>
                )}

                <Paper p="sm" withBorder bg="gray.0" style={{ borderRadius: 4 }}>
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      lineHeight: 1.4,
                    }}
                  >
                    {generateLink(token.token, token.access_level as AccessLevel, isProtected)}
                  </Text>
                </Paper>

                <Group gap="xs" mt="md" justify="flex-end">
                  <CopyButton value={generateLink(token.token, token.access_level as AccessLevel, isProtected)}>
                    {({ copied, copy }) => (
                      <Button
                        size="xs"
                        variant="light"
                        color={copied ? 'teal' : 'blue'}
                        onClick={copy}
                        leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    )}
                  </CopyButton>
                  <Button
                    size="xs"
                    variant="light"
                    color="blue"
                    onClick={() => showQrCode(token)}
                    leftSection={<IconQrcode size={14} />}
                  >
                    QR Code
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    onClick={() => handleDeleteToken(token.id)}
                    leftSection={<IconTrash size={14} />}
                  >
                    Delete
                  </Button>
                </Group>
              </Card>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    );
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={`Share ${roomName}`}
        size="xl"
        centered
      >
        {isVerifying ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text size="sm" c="dimmed">Verifying access tokens...</Text>
            </Stack>
          </Center>
        ) : (
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
        )}
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
            <Group justify="center">
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
              <Button
                variant="light"
                color="blue"
                leftSection={<IconDownload size={16} />}
                onClick={downloadQrCode}
                disabled={!qrCodes.has(currentQrToken.token)}
              >
                Download QR
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </>
  );
};

export default ShareRoomModal;
