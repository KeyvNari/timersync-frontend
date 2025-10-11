import { useState, useRef } from 'react';
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
} from '@tabler/icons-react';

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
}

export function AITimerChat({ opened, onClose, onTimerCreate }: AITimerChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! How can I help you create a timer today? If you have any questions about creating timers, their features, or settings, feel free to ask.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const resetRef = useRef<() => void>(null);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    // TODO: Add AI logic here
    // Simulating a response with markdown formatting
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Let's create a timer for your presentation titled **\"AI Use Cases in Data Analytics\"** with a duration of **10 minutes** as a countdown timer.\n\nHere's a summary of what I'll create:\n\n| **Timer Title**                       | **Duration** | **Timer Type** |\n|---------------------------------------|--------------|-----------------|\n| AI Use Cases in Data Analytics        | 10 minutes   | Countdown       |\n\nDo you want me to proceed? (yes/no)",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsThinking(false);
    }, 1000);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
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
    resetRef.current?.();
  };

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
    // TODO: Process the file here
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    resetRef.current?.();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group gap="xs">
          <IconSparkles size={24} color="var(--mantine-color-blue-6)" />
          <Text fw={600} size="lg">Create Timer with AI</Text>
        </Group>
      }
      padding={0}
      styles={{
        body: { 
          height: 'calc(80vh - 60px)',
          display: 'flex',
          flexDirection: 'column',
        },
        content: { height: '80vh' }
      }}
    >
      <Stack gap={0} style={{ height: '100%' }}>
        {/* Messages Area */}
        <ScrollArea 
          style={{ flex: 1 }}
          p="md"
          type="auto"
        >
          <Stack gap="md">
            {messages.map((message) => (
              <Box key={message.id}>
                {message.role === 'assistant' ? (
                  <Stack gap="xs">
                    <Group gap="xs" wrap="nowrap">
                      <Avatar size="sm" color="blue" radius="xl">
                        <IconSparkles size={16} />
                      </Avatar>
                      <Text size="sm" fw={500}>AI Assistant</Text>
                    </Group>
                    <Paper
                      p="md"
                      radius="md"
                      style={{
                        backgroundColor: 'var(--mantine-color-gray-0)',
                        marginLeft: '32px',
                      }}
                    >
                      <Box className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </Box>
                      <Group gap="xs" mt="sm">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="gray"
                          title="Copy"
                          onClick={() => handleCopyMessage(message.content)}
                        >
                          <IconCopy size={14} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="gray"
                          title="Good answer"
                        >
                          <IconThumbUp size={14} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="gray"
                          title="Bad answer"
                        >
                          <IconThumbDown size={14} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  </Stack>
                ) : (
                  <Stack gap="xs" align="flex-end">
                    <Group gap="xs" wrap="nowrap">
                      <Text size="sm" fw={500}>You</Text>
                      <Avatar size="sm" color="blue" radius="xl">
                        <IconUser size={16} />
                      </Avatar>
                    </Group>
                    <Paper
                      p="md"
                      radius="md"
                      style={{
                        backgroundColor: 'var(--mantine-color-blue-1)',
                        marginRight: '32px',
                        maxWidth: '80%',
                      }}
                    >
                      <Text size="sm" c="dark" style={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Text>
                    </Paper>
                  </Stack>
                )}
              </Box>
            ))}

            {isThinking && (
              <Stack gap="xs">
                <Group gap="xs" wrap="nowrap">
                  <Avatar size="sm" color="blue" radius="xl">
                    <IconSparkles size={16} />
                  </Avatar>
                  <Text size="sm" fw={500}>AI Assistant</Text>
                  <Badge size="sm" variant="dot" color="blue">
                    Thinking...
                  </Badge>
                </Group>
                <Paper
                  p="md"
                  radius="md"
                  style={{
                    backgroundColor: 'var(--mantine-color-gray-0)',
                    marginLeft: '32px',
                  }}
                >
                  <Group gap="xs">
                    <Box
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--mantine-color-blue-6)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                    <Box
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--mantine-color-blue-6)',
                        animation: 'pulse 1.5s ease-in-out 0.2s infinite',
                      }}
                    />
                    <Box
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--mantine-color-blue-6)',
                        animation: 'pulse 1.5s ease-in-out 0.4s infinite',
                      }}
                    />
                  </Group>
                </Paper>
              </Stack>
            )}
          </Stack>
        </ScrollArea>

        {/* Input Area */}
        <Box
          p="md"
          style={{
            borderTop: '1px solid var(--mantine-color-gray-3)',
            backgroundColor: 'var(--mantine-color-body)',
          }}
        >
          <Stack gap="sm">
            <Group gap="xs">
              <Button
                variant="subtle"
                size="compact-sm"
                leftSection={<IconRotateClockwise size={14} />}
                onClick={handleClearChat}
              >
                Clear
              </Button>
            </Group>

            {/* Uploaded File Display */}
            {uploadedFile && (
              <Paper p="xs" withBorder>
                <Group gap="xs" justify="space-between">
                  <Group gap="xs">
                    <IconFile size={18} color="var(--mantine-color-blue-6)" />
                    <Text size="sm" fw={500}>{uploadedFile.name}</Text>
                    <Text size="xs" c="dimmed">
                      ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </Text>
                  </Group>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={handleRemoveFile}
                    title="Remove file"
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
              </Paper>
            )}
            
            <Group gap="xs" align="flex-end" wrap="nowrap">
              <FileButton
                resetRef={resetRef}
                onChange={handleFileUpload}
                accept=".pdf,.docx,.md,.txt,.csv"
                disabled={uploadedFile !== null}
              >
                {(props) => (
                  <ActionIcon
                    {...props}
                    size="lg"
                    variant="light"
                    color="gray"
                    disabled={uploadedFile !== null}
                    title={uploadedFile ? "Remove current file to upload another" : "Upload file"}
                  >
                    <IconPaperclip size={18} />
                  </ActionIcon>
                )}
              </FileButton>

              <TextInput
                placeholder="Describe the timer you want to create..."
                value={inputValue}
                onChange={(e) => setInputValue(e.currentTarget.value)}
                onKeyDown={handleKeyPress}
                style={{ flex: 1 }}
                size="md"
                rightSection={
                  <ActionIcon
                    size="lg"
                    color="blue"
                    variant="filled"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isThinking}
                  >
                    <IconSend size={18} />
                  </ActionIcon>
                }
                rightSectionWidth={50}
              />
            </Group>
          </Stack>
        </Box>
      </Stack>

      {/* Markdown and animation styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
          }

          .markdown-content {
            font-size: 14px;
            line-height: 1.6;
            color: var(--mantine-color-dark-6);
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
            color: var(--mantine-color-dark-7);
          }

          .markdown-content code {
            background-color: var(--mantine-color-gray-1);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
          }

          .markdown-content pre {
            background-color: var(--mantine-color-gray-1);
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
            margin-bottom: 12px;
          }

          .markdown-content pre code {
            background-color: transparent;
            padding: 0;
          }

          .markdown-content blockquote {
            border-left: 4px solid var(--mantine-color-blue-5);
            padding-left: 12px;
            margin-left: 0;
            color: var(--mantine-color-gray-7);
          }

          .markdown-content table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 12px;
            font-size: 14px;
          }

          .markdown-content th,
          .markdown-content td {
            border: 1px solid var(--mantine-color-gray-3);
            padding: 8px 12px;
            text-align: left;
          }

          .markdown-content th {
            background-color: var(--mantine-color-gray-1);
            font-weight: 600;
            color: var(--mantine-color-dark-7);
          }

          .markdown-content tr:nth-child(even) {
            background-color: var(--mantine-color-gray-0);
          }

          .markdown-content tr:hover {
            background-color: var(--mantine-color-gray-1);
          }
        `}
      </style>
    </Modal>
  );
}