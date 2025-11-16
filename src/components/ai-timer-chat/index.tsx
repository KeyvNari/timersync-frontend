import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Modal,
  Paper,
  TextInput,
  ActionIcon,
  Stack,
  Text,
  Box,
  Group,
  Button,
  ScrollArea,
  Avatar,
  Badge,
  FileButton,
  Loader,
  Tooltip,
  Transition,
} from '@mantine/core';
import {
  IconSend,
  IconSparkles,
  IconThumbUp,
  IconThumbDown,
  IconCopy,
  IconRotateClockwise,
  IconUser,
  IconPaperclip,
  IconX,
  IconFile,
  IconCheck,
} from '@tabler/icons-react';
import { useWebSocketContext } from '@/providers/websocket-provider';
import { notifications } from '@mantine/notifications';
import { extractFileContent, formatFileSize } from '@/utils/file-parser';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AITimerChatProps {
  opened: boolean;
  onClose: () => void;
  onTimerCreate?: (timerData: any) => void;
  roomId: number | null;
}

export function AITimerChat({ opened, onClose, onTimerCreate, roomId }: AITimerChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I can help you create custom timers. Just describe what you need, or upload a file for me to analyze. I can also manage your existing timers by removing specific ones or clearing them all.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedFileContent, setExtractedFileContent] = useState<string | null>(null);
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [hasFileSent, setHasFileSent] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'good' | 'bad' | null>(null);
  const resetRef = useRef<() => void>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isThinking]);

  const { wsService } = useWebSocketContext();

  // Set up WebSocket event handlers
  useEffect(() => {
    if (!wsService) return;

    const handleAIResponse = (message: any) => {
      setSessionId(message.session_id);
      const aiResponse: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: message.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsThinking(false);
    };

    const handleAIError = (message: any) => {
      setIsThinking(false);
      notifications.show({
        title: 'Error',
        message: message.message || 'Failed to get response from AI',
        color: 'red',
      });
    };

    // Register event handlers
    wsService.on('agent_response', handleAIResponse);
    wsService.on('agent_error', handleAIError);

    // Cleanup function
    return () => {
      wsService.off('agent_response', handleAIResponse);
      wsService.off('agent_error', handleAIError);
    };
  }, [wsService]);

  const handleSendMessage = () => {
    if (!inputValue.trim() && !extractedFileContent) return;

    if (!roomId) {
      notifications.show({
        title: 'Error',
        message: 'No room selected. Please select a room first.',
        color: 'red',
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue || '[File attached]',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const question = inputValue || 'Please analyze this file and help me create a timer based on its content.';
    setInputValue('');
    setIsThinking(true);

    if (hasFileSent && extractedFileContent) {
      setHasFileSent(true);
    }

    // Send WebSocket message
    const wsMessage = {
      type: 'agent_query',
      question,
      ...(sessionId && { session_id: sessionId }),
      ...((!hasFileSent && extractedFileContent) && { file_content: extractedFileContent }),
    };

    wsService?.send(wsMessage);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (messageId: string, type: 'good' | 'bad') => {
    setFeedbackId(messageId);
    setFeedbackType(type);

    // Reset feedback state after animation
    setTimeout(() => {
      setFeedbackId(null);
      setFeedbackType(null);
    }, 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! How can I help you create a timer today? If you have any questions about creating timers, their features, or settings, feel free to ask.',
        timestamp: new Date(),
      },
    ]);
    setUploadedFile(null);
    setExtractedFileContent(null);
    setHasFileSent(false);
    setSessionId(null);
    resetRef.current?.();
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    setUploadedFile(file);
    setIsExtractingFile(true);

    try {
      const result = await extractFileContent(file);

      if (result.success && result.content) {
        setExtractedFileContent(result.content);
        // notifications.show({
        //   title: 'File uploaded',
        //   message: `Successfully extracted content from ${file.name}`,
        //   color: 'green',
        // });
      } else {
        setUploadedFile(null);
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to extract file content',
          color: 'red',
        });
      }
    } catch (error) {
      setUploadedFile(null);
      notifications.show({
        title: 'Error',
        message: 'An unexpected error occurred while processing the file',
        color: 'red',
      });
    } finally {
      setIsExtractingFile(false);
    }
  };

  const handleRemoveFile = () => {
    if (hasFileSent) {
      notifications.show({
        title: 'Cannot remove file',
        message: 'File has already been sent. Clear the chat to upload a new file.',
        color: 'orange',
      });
      return;
    }
    setUploadedFile(null);
    setExtractedFileContent(null);
    resetRef.current?.();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Timer Assistant"
      centered
      size="90%"
      padding={0}
      styles={{
        header: {
          padding: 'var(--mantine-spacing-md)',
          borderBottom: '1px solid var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-body)',
        },
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '80vh',
          backgroundColor: 'var(--mantine-color-body)',
        },
        content: {
          overflow: 'hidden',
          borderRadius: 'var(--mantine-radius-md)',
          backgroundColor: 'var(--mantine-color-body)',
        }
      }}
    >
      <Stack gap={0} style={{ height: '100%', backgroundColor: 'var(--mantine-color-body)' }}>
        <ScrollArea
          style={{ flex: 1 }}
          p="lg"
          type="auto"
          viewportRef={viewport}
        >
          <Stack gap="md">
            {messages.map((message, index) => (
              <Transition
                key={message.id}
                mounted={true}
                transition="slide-up"
                duration={300}
                timingFunction="ease"
              >
                {(styles) => (
                  <Box style={styles}>
                    {message.role === 'assistant' ? (
                      <Group align="flex-start" gap="sm" wrap="nowrap">
                        <Avatar
                          size="sm"
                          radius="md"
                          color="blue"
                          style={{
                            flexShrink: 0,
                            backgroundColor: 'var(--mantine-color-blue-light)',
                          }}
                        >
                          <IconSparkles size={16} />
                        </Avatar>
                        <Stack gap="xs" style={{ flex: 1, maxWidth: '85%' }}>
                          <Paper
                            p="lg"
                            radius="md"
                            withBorder
                            style={{
                              backgroundColor: 'white',
                            }}
                          >
                            <Box className="markdown-content">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </Box>
                          </Paper>
                          {index > 0 && (
                            <Group gap="xs" ml="sm">
                              <Tooltip label={copiedId === message.id ? "Copied!" : "Copy"}>
                                <ActionIcon
                                  size="xs"
                                  variant="subtle"
                                  color="gray"
                                  onClick={() => handleCopyMessage(message.content, message.id)}
                                >
                                  {copiedId === message.id ? (
                                    <IconCheck size={14} />
                                  ) : (
                                    <IconCopy size={14} />
                                  )}
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Good answer">
                                <ActionIcon
                                  size="xs"
                                  variant={feedbackId === message.id && feedbackType === 'good' ? 'filled' : 'subtle'}
                                  color={feedbackId === message.id && feedbackType === 'good' ? 'green' : 'gray'}
                                  onClick={() => handleFeedback(message.id, 'good')}
                                >
                                  <IconThumbUp size={14} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Bad answer">
                                <ActionIcon
                                  size="xs"
                                  variant={feedbackId === message.id && feedbackType === 'bad' ? 'filled' : 'subtle'}
                                  color={feedbackId === message.id && feedbackType === 'bad' ? 'red' : 'gray'}
                                  onClick={() => handleFeedback(message.id, 'bad')}
                                >
                                  <IconThumbDown size={14} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          )}
                        </Stack>
                      </Group>
                    ) : (
                      <Group align="flex-start" gap="sm" wrap="nowrap" justify="flex-end">
                        <Stack gap="xs" align="flex-end" style={{ flex: 1, maxWidth: '85%' }}>
                          <Paper
                            p="lg"
                            radius="md"
                            style={{
                              backgroundColor: 'var(--mantine-color-blue-6)',
                              color: 'white',
                            }}
                          >
                            <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                              {message.content}
                            </Text>
                          </Paper>
                        </Stack>
                        <Avatar
                          size="sm"
                          radius="md"
                          color="gray"
                          style={{
                            flexShrink: 0,
                          }}
                        >
                          <IconUser size={16} />
                        </Avatar>
                      </Group>
                    )}
                  </Box>
                )}
              </Transition>
            ))}

            {isThinking && (
              <Group align="flex-start" gap="sm" wrap="nowrap">
                <Avatar
                  size="sm"
                  radius="md"
                  color="blue"
                  style={{
                    flexShrink: 0,
                    backgroundColor: 'var(--mantine-color-blue-light)',
                  }}
                >
                  <IconSparkles size={16} />
                </Avatar>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Paper
                    p="md"
                    radius="md"
                    withBorder
                    style={{
                      backgroundColor: 'white',
                      maxWidth: '120px',
                    }}
                  >
                    <Group gap="xs" justify="center">
                      <Box className="dot-pulse" />
                      <Box className="dot-pulse" style={{ animationDelay: '0.2s' }} />
                      <Box className="dot-pulse" style={{ animationDelay: '0.4s' }} />
                    </Group>
                  </Paper>
                </Stack>
              </Group>
            )}
          </Stack>
        </ScrollArea>

        <Box
          p="lg"
          style={{
            borderTop: '1px solid var(--mantine-color-default-border)',
            backgroundColor: 'var(--mantine-color-body)',
            flexShrink: 0,
          }}
        >
          <Stack gap="md">
            {uploadedFile && (
              <Paper
                p="sm"
                radius="md"
                withBorder
                style={{
                  backgroundColor: 'var(--mantine-color-gray-0)',
                }}
              >
                <Group gap="sm" justify="space-between">
                  <Group gap="sm">
                    <Box
                      style={{
                        background: 'white',
                        borderRadius: 'var(--mantine-radius-md)',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isExtractingFile ? (
                        <Loader size="sm" color="blue" />
                      ) : (
                        <IconFile size={18} />
                      )}
                    </Box>
                    <div>
                      <Text size="sm" fw={500}>{uploadedFile.name}</Text>
                      <Group gap="xs" mt={4}>
                        <Text size="xs" c="dimmed">
                          {formatFileSize(uploadedFile.size)}
                        </Text>
                        {extractedFileContent && (
                          <Badge size="xs" color="green" variant="light">
                            {extractedFileContent.length} chars
                          </Badge>
                        )}
                        {hasFileSent && (
                          <Badge size="xs" color="blue" variant="light">
                            Sent
                          </Badge>
                        )}
                      </Group>
                    </div>
                  </Group>
                  <Tooltip label={hasFileSent ? "Cannot remove - file already sent" : "Remove file"}>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="red"
                      onClick={handleRemoveFile}
                      disabled={hasFileSent}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Paper>
            )}

            <Group gap="sm" wrap="nowrap" align="flex-end">
              <FileButton
                resetRef={resetRef}
                onChange={handleFileUpload}
                accept=".pdf,.docx,.md,.txt,.csv,.xlsx,.xls"
                disabled={uploadedFile !== null || isExtractingFile}
              >
                {(props) => (
                  <Tooltip label={uploadedFile ? "Remove current file to attach another" : "Attach file"}>
                    <ActionIcon
                      {...props}
                      size="lg"
                      variant="default"
                      disabled={uploadedFile !== null || isExtractingFile}
                    >
                      <IconPaperclip size={20} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </FileButton>

              <TextInput
                placeholder="Describe the timers you want to create"
                value={inputValue}
                onChange={(e) => setInputValue(e.currentTarget.value)}
                onKeyDown={handleKeyPress}
                style={{ flex: 1 }}
                size="md"
              />

              <Tooltip label="Send message">
                <ActionIcon
                  size="lg"
                  color="blue"
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && !extractedFileContent) || isThinking}
                >
                  <IconSend size={20} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Clear chat">
                <ActionIcon
                  size="lg"
                  variant="default"
                  onClick={handleClearChat}
                >
                  <IconRotateClockwise size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Stack>
        </Box>
      </Stack>

      <style>
        {`
          @keyframes dotPulse {
            0%, 100% {
              opacity: 0.4;
              transform: scale(0.8);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
          }

          .dot-pulse {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--mantine-color-blue-6);
            animation: dotPulse 1.4s ease-in-out infinite;
          }

          .markdown-content {
            font-size: 14px;
            line-height: 1.6;
            color: var(--mantine-color-gray-7);
          }

          .markdown-content h1,
          .markdown-content h2,
          .markdown-content h3,
          .markdown-content h4,
          .markdown-content h5,
          .markdown-content h6 {
            margin-top: 16px;
            margin-bottom: 8px;
            font-weight: 600;
            line-height: 1.3;
            color: var(--mantine-color-gray-9);
          }

          .markdown-content h3 {
            font-size: 16px;
          }

          .markdown-content p {
            margin-top: 0;
            margin-bottom: 12px;
          }

          .markdown-content ul,
          .markdown-content ol {
            margin-top: 0;
            margin-bottom: 12px;
            padding-left: 24px;
          }

          .markdown-content li {
            margin-bottom: 4px;
          }

          .markdown-content strong {
            font-weight: 600;
            color: var(--mantine-color-gray-9);
          }

          .markdown-content code {
            background-color: var(--mantine-color-gray-1);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
            font-size: 13px;
            border: 1px solid var(--mantine-color-gray-2);
            color: var(--mantine-color-red-7);
          }

          .markdown-content pre {
            background-color: var(--mantine-color-gray-9);
            padding: 12px;
            border-radius: var(--mantine-radius-md);
            overflow-x: auto;
            margin-bottom: 12px;
            border: 1px solid var(--mantine-color-gray-3);
          }

          .markdown-content pre code {
            background: transparent;
            padding: 0;
            color: var(--mantine-color-gray-0);
            border: none;
          }

          .markdown-content blockquote {
            border-left: 4px solid var(--mantine-color-blue-6);
            padding-left: 12px;
            margin-left: 0;
            color: var(--mantine-color-gray-6);
            font-style: italic;
            background-color: var(--mantine-color-gray-0);
            padding: 8px 12px;
            border-radius: 0 4px 4px 0;
          }

          .markdown-content table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 12px;
            font-size: 13px;
            border-radius: var(--mantine-radius-md);
            overflow: hidden;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }

          .markdown-content th,
          .markdown-content td {
            border: 1px solid var(--mantine-color-gray-2);
            padding: 8px 12px;
            text-align: left;
          }

          .markdown-content th {
            background-color: var(--mantine-color-blue-6);
            font-weight: 600;
            color: white;
          }

          .markdown-content tr:nth-child(even) {
            background-color: var(--mantine-color-gray-0);
          }

          .markdown-content tr:hover {
            background-color: var(--mantine-color-gray-1);
            transition: background-color 0.2s ease;
          }

          .markdown-content a {
            color: var(--mantine-color-blue-6);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s ease;
          }

          .markdown-content a:hover {
            color: var(--mantine-color-blue-7);
            text-decoration: underline;
          }
        `}
      </style>
    </Modal>
  );
}
