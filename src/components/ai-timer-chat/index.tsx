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
      content: 'Hello! How can I help you create a timer today? I can create timers for you based on your description. You can also upload a file and let me analyze it.',
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
      size="1200px"
      title={
        <Group gap="sm" style={{ padding: '4px 0' }}>
          <Box
            style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              borderRadius: '12px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSparkles size={20} color="white" />
          </Box>
          <div>
            <Text fw={600} size="lg" c="gray.9" style={{ lineHeight: 1.2 }}>AI Timer Assistant</Text>
            <Text size="xs" c="gray.6" fw={400}>Powered by intelligent automation</Text>
          </div>
        </Group>
      }
      padding={0}
      styles={{
        body: {
          height: 'calc(85vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
        },
        content: {
          height: '85vh',
          border: 'none',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        },
        header: {
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          padding: '20px 24px',
          background: 'white',
        }
      }}
    >
      <Stack gap={0} style={{ height: '100%', backgroundColor: '#F9FAFB' }}>
        <ScrollArea
          style={{ flex: 1 }}
          p="xl"
          type="auto"
          viewportRef={viewport}
        >
          <Stack gap="lg">
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
                      <Group align="flex-start" gap="md" wrap="nowrap">
                        <Box
                          style={{
                            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                            borderRadius: '16px',
                            padding: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                          }}
                        >
                          <IconSparkles size={18} color="white" />
                        </Box>
                        <Stack gap="xs" style={{ flex: 1, maxWidth: '85%' }}>
                          <Paper
                            p="lg"
                            radius="xl"
                            style={{
                              backgroundColor: 'white',
                              border: '1px solid #E5E7EB',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            }}
                          >
                            <Box className="markdown-content">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                            </Box>
                          </Paper>
                          <Group gap="xs" ml="md">
                            <Tooltip label={copiedId === message.id ? "Copied!" : "Copy"}>
                              <ActionIcon
                                size="md"
                                variant="subtle"
                                color="gray"
                                radius="xl"
                                onClick={() => handleCopyMessage(message.content, message.id)}
                              >
                                {copiedId === message.id ? (
                                  <IconCheck size={16} />
                                ) : (
                                  <IconCopy size={16} />
                                )}
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Good answer">
                              <ActionIcon
                                size="md"
                                variant="subtle"
                                color="gray"
                                radius="xl"
                              >
                                <IconThumbUp size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Bad answer">
                              <ActionIcon
                                size="md"
                                variant="subtle"
                                color="gray"
                                radius="xl"
                              >
                                <IconThumbDown size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Stack>
                      </Group>
                    ) : (
                      <Group align="flex-start" gap="md" wrap="nowrap" justify="flex-end">
                        <Stack gap="xs" align="flex-end" style={{ flex: 1, maxWidth: '85%' }}>
                          <Paper
                            p="lg"
                            radius="xl"
                            style={{
                              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                              color: 'white',
                              boxShadow: '0 4px 16px rgba(79, 70, 229, 0.25)',
                            }}
                          >
                            <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'white' }}>
                              {message.content}
                            </Text>
                          </Paper>
                        </Stack>
                        <Avatar
                          size="lg"
                          radius="xl"
                          color="gray"
                          style={{
                            border: '2px solid #E5E7EB',
                            flexShrink: 0,
                            backgroundColor: '#F3F4F6',
                          }}
                        >
                          <IconUser size={20} color="#4B5563" />
                        </Avatar>
                      </Group>
                    )}
                  </Box>
                )}
              </Transition>
            ))}

            {isThinking && (
              <Group align="flex-start" gap="md" wrap="nowrap">
                <Box
                  style={{
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    borderRadius: '16px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                  }}
                >
                  <IconSparkles size={18} color="white" />
                </Box>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Paper
                    p="lg"
                    radius="xl"
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      maxWidth: '200px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    <Group gap="sm" justify="center">
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
          p="xl"
          style={{
            borderTop: '1px solid #E5E7EB',
            backgroundColor: 'white',
          }}
        >
          <Stack gap="md">
            {uploadedFile && (
              <Paper
                p="md"
                radius="lg"
                style={{
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#F3F4F6',
                }}
              >
                <Group gap="md" justify="space-between">
                  <Group gap="md">
                    <Box
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #E5E7EB',
                      }}
                    >
                      {isExtractingFile ? (
                        <Loader size="sm" color="indigo" />
                      ) : (
                        <IconFile size={20} color="#4F46E5" />
                      )}
                    </Box>
                    <div>
                      <Text size="sm" fw={600} c="gray.9">{uploadedFile.name}</Text>
                      <Group gap="xs" mt={4}>
                        <Text size="xs" c="gray.6">
                          {formatFileSize(uploadedFile.size)}
                        </Text>
                        {extractedFileContent && (
                          <Badge size="xs" color="green" variant="light" radius="sm">
                            {extractedFileContent.length} chars
                          </Badge>
                        )}
                        {hasFileSent && (
                          <Badge size="xs" color="indigo" variant="light" radius="sm">
                            Sent
                          </Badge>
                        )}
                      </Group>
                    </div>
                  </Group>
                  <Tooltip label={hasFileSent ? "Cannot remove - file already sent" : "Remove file"}>
                    <ActionIcon
                      size="lg"
                      variant="light"
                      color="red"
                      radius="xl"
                      onClick={handleRemoveFile}
                      disabled={hasFileSent}
                    >
                      <IconX size={18} />
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
                      size={44}
                      variant="light"
                      color="gray"
                      radius="xl"
                      disabled={uploadedFile !== null || isExtractingFile}
                      style={{
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#F3F4F6',
                      }}
                    >
                      <IconPaperclip size={20} color="#4B5563" />
                    </ActionIcon>
                  </Tooltip>
                )}
              </FileButton>

              <TextInput
                placeholder="Describe the timer you want to create..."
                value={inputValue}
                onChange={(e) => setInputValue(e.currentTarget.value)}
                onKeyDown={handleKeyPress}
                style={{ flex: 1 }}
                size="lg"
                radius="xl"
                styles={{
                  input: {
                    border: '1px solid #E5E7EB',
                    paddingRight: '60px',
                    fontSize: '15px',
                    color: '#111827',
                    backgroundColor: 'white',
                  }
                }}
              />

              <Tooltip label="Send message">
                <ActionIcon
                  size={44}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: '#4F46E5', to: '#7C3AED', deg: 135 }}
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && !extractedFileContent) || isThinking}
                  style={{
                    boxShadow: (inputValue.trim() || extractedFileContent) && !isThinking ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IconSend size={20} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Clear chat">
                <ActionIcon
                  size={44}
                  variant="light"
                  color="gray"
                  radius="xl"
                  onClick={handleClearChat}
                  style={{
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#F3F4F6',
                  }}
                >
                  <IconRotateClockwise size={20} color="#4B5563" />
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
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            animation: dotPulse 1.4s ease-in-out infinite;
          }

          .markdown-content {
            font-size: 15px;
            line-height: 1.7;
            color: #374151;
          }

          .markdown-content h1,
          .markdown-content h2,
          .markdown-content h3,
          .markdown-content h4,
          .markdown-content h5,
          .markdown-content h6 {
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: 700;
            line-height: 1.3;
            color: #111827;
          }

          .markdown-content h3 {
            font-size: 18px;
          }

          .markdown-content p {
            margin-top: 0;
            margin-bottom: 16px;
          }

          .markdown-content ul,
          .markdown-content ol {
            margin-top: 0;
            margin-bottom: 16px;
            padding-left: 28px;
          }

          .markdown-content li {
            margin-bottom: 6px;
          }

          .markdown-content strong {
            font-weight: 700;
            color: #111827;
          }

          .markdown-content code {
            background-color: #F3F4F6;
            padding: 3px 8px;
            border-radius: 6px;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            border: 1px solid #E5E7EB;
            color: #DC2626;
          }

          .markdown-content pre {
            background-color: #1F2937;
            padding: 16px;
            border-radius: 12px;
            overflow-x: auto;
            margin-bottom: 16px;
            border: 1px solid #374151;
          }

          .markdown-content pre code {
            background: transparent;
            padding: 0;
            color: #F3F4F6;
            border: none;
          }

          .markdown-content blockquote {
            border-left: 4px solid #4F46E5;
            padding-left: 16px;
            margin-left: 0;
            color: #6B7280;
            font-style: italic;
            background-color: #F9FAFB;
            padding: 12px 16px;
            border-radius: 0 8px 8px 0;
          }

          .markdown-content table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 16px;
            font-size: 14px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .markdown-content th,
          .markdown-content td {
            border: 1px solid #E5E7EB;
            padding: 12px 16px;
            text-align: left;
          }

          .markdown-content th {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            font-weight: 700;
            color: white;
          }

          .markdown-content tr:nth-child(even) {
            background-color: #F9FAFB;
          }

          .markdown-content tr:hover {
            background-color: #F3F4F6;
            transition: background-color 0.2s ease;
          }

          .markdown-content a {
            color: #4F46E5;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s ease;
          }

          .markdown-content a:hover {
            color: #7C3AED;
            text-decoration: underline;
          }
        `}
      </style>
    </Modal>
  );
}
