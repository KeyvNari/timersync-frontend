// src/components/ai-timer-chat/index.tsx
import { useState, useRef } from 'react';
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
    // For now, just simulate a response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand. Let me help you create that timer...',
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
                      <Text size="sm" c="dark" style={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Text>
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

      {/* Add pulse animation */}
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
        `}
      </style>
    </Modal>
  );
}