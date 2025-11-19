import React, { useState, useEffect, useCallback } from 'react';
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
  SegmentedControl,
  Paper,
  List,
  ThemeIcon,
  Card,
  Title,
  Loader,
  Center,
  Divider,
  Collapse,
  ActionIcon,
  rem,
} from '@mantine/core';
import {
  IconCopy,
  IconCheck,
  IconEye,
  IconQrcode,
  IconDeviceDesktop,
  IconTrash,
  IconDownload,
  IconLink,
  IconShare,
  IconX,
  IconLock,
  IconCirclePlus,
  IconLetterXSmall,
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasFormChanges, setHasFormChanges] = useState(false);

  const { wsService } = useWebSocketContext();

  // Use ref to track if component is still mounted to prevent state updates after unmount
  const isMountedRef = React.useRef(true);

  // QR code modal
  const [qrOpened, { open: openQr, close: closeQr }] = useDisclosure(false);
  const [currentQrToken, setCurrentQrToken] = useState<RoomAccessToken | null>(null);
  const [isGenerateOpen, { toggle: toggleGenerate }] = useDisclosure(false);

  // Ref to store the current verification handler to clean it up properly
  const verificationHandlerRef = React.useRef<((message: any) => void) | null>(null);
  // Ref to store the tokens that were being verified in the current verification run
  const verifyingTokensRef = React.useRef<Set<string>>(new Set());

  // Verify current tokens and remove any that are invalid
  const verifyCurrentTokens = useCallback(() => {
    const tokensToVerify = Object.values(currentToken).filter(token => token);

    if (!wsService || tokensToVerify.length === 0) {
      setIsVerifying(false);
      return;
    }

    // Clean up any existing listeners from previous verification
    if (verificationHandlerRef.current && wsService) {
      wsService.off('room_access_token_verify_result', verificationHandlerRef.current);
    }
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }

    setIsVerifying(true);
    let tokensChecked = 0;
    const expectedTokenCount = tokensToVerify.length;
    // Create a fresh set from the current tokens to verify
    const tokensToVerifySet = new Set(tokensToVerify.map(t => t.token));
    // Update the ref to track which tokens we're currently verifying
    verifyingTokensRef.current = tokensToVerifySet;

    // Setup listener for verification results - only for current tokens
    const handleVerificationResult = (message: any) => {
      if (!isMountedRef.current) return;

      const verifiedToken = message.token;
      // Only process results for tokens we're currently verifying (use ref for freshest data)
      if (!verifyingTokensRef.current.has(verifiedToken)) return;

      // If token is invalid, remove it from current tokens
      if (!message.valid && verifiedToken) {
        setCurrentToken(prev => {
          const newState = { ...prev };
          if (prev.full?.token === verifiedToken) {
            newState.full = undefined;
          }
          if (prev.viewer?.token === verifiedToken) {
            newState.viewer = undefined;
          }
          return newState;
        });
      }

      tokensChecked++;
      if (tokensChecked >= expectedTokenCount) {
        if (isMountedRef.current) {
          setIsVerifying(false);
        }
        if (verificationHandlerRef.current && wsService) {
          wsService.off('room_access_token_verify_result', verificationHandlerRef.current);
        }
        if (verificationTimeoutRef.current) {
          clearTimeout(verificationTimeoutRef.current);
        }
      }
    };

    verificationHandlerRef.current = handleVerificationResult;
    wsService.on('room_access_token_verify_result', handleVerificationResult);

    // Failsafe: clear loading after 5 seconds
    verificationTimeoutRef.current = window.setTimeout(() => {
      if (isMountedRef.current) {
        setIsVerifying(false);
      }
      if (verificationHandlerRef.current && wsService) {
        wsService.off('room_access_token_verify_result', verificationHandlerRef.current);
      }
    }, 5000);

    // Send verification requests only for current tokens
    tokensToVerify.forEach(token => {
      if (token) {
        wsService.verifyRoomAccessToken(token.token);
      }
    });
  }, [currentToken, wsService]);

  // Ref to track verification timeout
  const verificationTimeoutRef = React.useRef<number | null>(null);

  // Reset form changes state when tab changes
  useEffect(() => {
    setHasFormChanges(false);
  }, [activeTab]);

  useEffect(() => {
    // Track when modal opens/closes
    if (opened) {
      isMountedRef.current = true;
      loadTokens();
    } else {
      isMountedRef.current = false;
      setIsVerifying(false);
      // Clean up verification timeout and listener
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
      if (verificationHandlerRef.current && wsService) {
        wsService.off('room_access_token_verify_result', verificationHandlerRef.current);
      }
    }

    return () => {
      isMountedRef.current = false;
      // Clean up timeout and listener on unmount
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
      if (verificationHandlerRef.current && wsService) {
        wsService.off('room_access_token_verify_result', verificationHandlerRef.current);
      }
    };
  }, [opened, wsService]);

  // Verify tokens when they're loaded
  useEffect(() => {
    if (opened && Object.keys(currentToken).length > 0) {
      verifyCurrentTokens();
    }
  }, [opened, currentToken, wsService]);

  const loadTokens = async () => {
    if (!wsService) return;

    wsService.listRoomAccessTokens();

    const handleTokenList = async (message: any) => {
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      if (message.tokens) {
        setCreatedTokens(message.tokens);

        // Set current token for each access level (most recent - get the last one)
        const fullTokens = message.tokens.filter((t: RoomAccessToken) => t.access_level === 'full');
        const viewerTokens = message.tokens.filter((t: RoomAccessToken) => t.access_level === 'viewer');

        const fullToken = fullTokens.length > 0 ? fullTokens[fullTokens.length - 1] : undefined;
        const viewerToken = viewerTokens.length > 0 ? viewerTokens[viewerTokens.length - 1] : undefined;

        setCurrentToken({
          full: fullToken,
          viewer: viewerToken,
        });

        // Generate QR codes for all tokens
        for (const token of message.tokens) {
          // Check again before state updates in async loop
          if (!isMountedRef.current) return;

          const isProtected = token.password_protected ?? token.is_password_protected ?? false;
          const link = generateLink(token.token, token.access_level as AccessLevel, isProtected);
          try {
            const qrCodeDataUrl = await QRCode.toDataURL(link);
            if (isMountedRef.current) {
              setQrCodes(prev => new Map(prev.set(token.token, qrCodeDataUrl)));
            }
          } catch (error) {
            // Failed to generate QR code
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
        // Token created successfully
        // Check both field names for password protection
        const isProtected = message.token.password_protected ?? message.token.is_password_protected ?? false;

        // Generate QR code for the new token
        const link = generateLink(message.token.token, message.token.access_level as AccessLevel, isProtected);
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(link);
          setQrCodes(prev => new Map(prev.set(message.token.token, qrCodeDataUrl)));
        } catch (error) {
          // Failed to generate QR code
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
        setHasFormChanges(false);
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
        { icon: IconCheck, text: 'View current running timer display' },
        { icon: IconCheck, text: 'Full control over all timers and messages' },
        { icon: IconCheck, text: 'Manage displays and connections' }
      ];
    } else {
      return [
        { icon: IconCheck, text: 'View current running timer display' },
        { icon: IconLetterXSmall, text: 'Full control over all timers and messages' },
        { icon: IconLetterXSmall, text: 'Manage displays and connections' }

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
    const isProtected = token ? (token.password_protected ?? token.is_password_protected ?? false) : false;
    const hasToken = !!token;

    return (
      <Stack gap="md">
        {/* Permissions - Visual & Compact */}
        <Card withBorder padding="sm" radius="md" bg="var(--mantine-color-body)">
          <Group gap="xs">
            <ThemeIcon variant="light" size="lg" color={level === 'full' ? 'blue' : 'teal'}>
              {level === 'full' ? <IconDeviceDesktop size={20} /> : <IconEye size={20} />}
            </ThemeIcon>
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={500}>{level === 'full' ? 'Controller Access' : 'Viewer Access'}</Text>
              <Text size="xs" c="dimmed">
                {level === 'full'
                  ? 'Full control over timers, messages, and settings.'
                  : 'Read-only view of the timer display.'}
              </Text>
            </Box>
          </Group>
          <Divider my="sm" />
          <List spacing="xs" size="xs" center>
            {permissions.map((perm, idx) => (
              <List.Item
                key={idx}
                icon={
                  <ThemeIcon color={perm.icon === IconLetterXSmall ? 'gray' : 'teal'} variant="transparent" size="xs">
                    <perm.icon size={14} />
                  </ThemeIcon>
                }
              >
                <Text size="xs" c={perm.icon === IconLetterXSmall ? 'dimmed' : undefined}>{perm.text}</Text>
              </List.Item>
            ))}
          </List>
        </Card>

        {/* Active Link Display */}
        {hasToken && !hasFormChanges && (
          <Card withBorder shadow="sm" radius="md" padding="lg">
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <Text fw={600} size="sm">Active Link</Text>
                {token.name && <Badge variant="dot" size="sm">{token.name}</Badge>}
              </Group>
              {isProtected && (
                <Badge color="orange" variant="light" size="sm" leftSection={<IconLock size={10} />}>
                  Protected
                </Badge>
              )}
            </Group>

            <Paper p="md" bg="var(--mantine-color-gray-0)" withBorder radius="md" mb="md">
              <Group justify="space-between" gap="xs">
                <Text
                  size="sm"
                  style={{
                    wordBreak: 'break-all',
                    fontFamily: 'var(--mantine-font-family-monospace)',
                  }}
                >
                  {generateLink(token.token, token.access_level as AccessLevel, isProtected)}
                </Text>
                <CopyButton value={generateLink(token.token, token.access_level as AccessLevel, isProtected)}>
                  {({ copied, copy }) => (
                    <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  )}
                </CopyButton>
              </Group>
            </Paper>

            <Group grow>
              <Button
                variant="light"
                leftSection={<IconQrcode size={16} />}
                onClick={() => showQrCode(token)}
              >
                Show QR
              </Button>
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => handleDeleteToken(token.id)}
              >
                Revoke
              </Button>
            </Group>
          </Card>
        )}

        {/* Generate New Link Section */}
        {(!hasToken || isGenerateOpen) && (
          <Card withBorder radius="md" padding="lg" style={{ borderColor: 'var(--mantine-color-blue-filled)' }}>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={5}>Generate New Link</Title>
                {hasToken && (
                  <ActionIcon variant="subtle" color="gray" onClick={toggleGenerate}>
                    <IconX size={16} />
                  </ActionIcon>
                )}
              </Group>

              <TextInput
                label="Link Name (Optional)"
                placeholder="e.g., Guest View"
                value={tokenName}
                onChange={(e) => {
                  setTokenName(e.target.value);
                  setHasFormChanges(true);
                }}
              />

              <Box>
                <Checkbox
                  label="Password protect"
                  checked={isPasswordProtected}
                  onChange={(e) => {
                    setIsPasswordProtected(e.currentTarget.checked);
                    setHasFormChanges(true);
                  }}
                  mb="xs"
                />
                <Collapse in={isPasswordProtected}>
                  <PasswordInput
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setHasFormChanges(true);
                    }}
                    error={password.length > 0 && password.length < 6 ? 'Min 6 characters' : null}
                  />
                </Collapse>
              </Box>

              <Button
                fullWidth
                onClick={() => {
                  handleCreateToken();
                  if (hasToken) toggleGenerate(); // Close if we were adding another
                }}
                loading={isLoading}
                disabled={isPasswordProtected && password.length < 6}
              >
                Create Link
              </Button>
            </Stack>
          </Card>
        )}

        {/* Toggle Generate Button (if token exists and form is closed) */}
        {hasToken && !isGenerateOpen && (
          <Button variant="subtle" onClick={toggleGenerate} leftSection={<IconCirclePlus size={16} />}>
            Create New Link
          </Button>
        )}

      </Stack>
    );
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size="md"
        centered
        withCloseButton={true}
        title={
          <Group gap="xs">
            <ThemeIcon variant="light" size="md">
              <IconShare size={16} />
            </ThemeIcon>
            <Text fw={600}>Share Room</Text>
          </Group>
        }
      >
        {isVerifying ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Text size="sm" c="dimmed">Verifying access tokens...</Text>
            </Stack>
          </Center>
        ) : (
          <Stack gap="lg">
            <SegmentedControl
              value={activeTab}
              onChange={(value) => setActiveTab(value as AccessLevel)}
              fullWidth
              data={[
                {
                  value: 'viewer',
                  label: (
                    <Center style={{ gap: 10 }}>
                      <IconEye style={{ width: rem(16), height: rem(16) }} />
                      <span>Viewer</span>
                    </Center>
                  ),
                },
                {
                  value: 'full',
                  label: (
                    <Center style={{ gap: 10 }}>
                      <IconDeviceDesktop style={{ width: rem(16), height: rem(16) }} />
                      <span>Controller</span>
                    </Center>
                  ),
                },
              ]}
            />

            {renderTabContent(activeTab)}
          </Stack>
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
