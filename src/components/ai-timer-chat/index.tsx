import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Modal,
  Paper,
  ActionIcon,
  Stack,
  Text,
  Box,
  Group,
  ScrollArea,
  Avatar,
  FileButton,
  Loader,
  Tooltip,
  UnstyledButton,
  Badge,
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
  IconClock,
  IconBulb,
  IconUpload,
  IconWand,
} from '@tabler/icons-react';
import { useWebSocketContext } from '@/providers/websocket-provider';
import { notifications } from '@mantine/notifications';
import { extractFileContent, formatFileSize } from '@/utils/file-parser';
import classes from './AITimerChat.module.css';

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

const SAMPLE_PROMPTS = [
  {
    icon: IconClock,
    title: 'HIIT Workout',
    description: 'High-intensity interval training with warm-up',
    prompt: 'Create a comprehensive 20-minute HIIT workout timer sequence. Structure it as follows:\n1. Warm-up (3 mins): "Light Jogging"\n2. Cycle 1 (4 mins): 4 rounds of "Sprint" (45s) and "Walk" (15s)\n3. Rest (2 mins): "Hydrate and Recover"\n4. Cycle 2 (4 mins): 4 rounds of "Burpees" (45s) and "Rest" (15s)\n5. Cool-down (3 mins): "Stretching"\n\nPlease ensure each timer has a distinct color if possible.',
  },
  {
    icon: IconBulb,
    title: 'Deep Work Session',
    description: 'Focus blocks with short and long breaks',
    prompt: 'Set up a "Deep Work" timer schedule for the next 2 hours:\n- Focus Block 1: 45 minutes (Label: "Deep Focus")\n- Short Break: 5 minutes (Label: "Stretch")\n- Focus Block 2: 45 minutes (Label: "Deep Focus")\n- Long Break: 15 minutes (Label: "Recharge")\n\nI need these to auto-start sequentially so I don\'t have to touch the timer.',
  },
  {
    icon: IconUpload,
    title: 'Analyze Schedule',
    description: 'Extract timers from an uploaded document',
    prompt: 'I am uploading a document containing my agenda. Please analyze it to:\n1. Extract all time-bound events.\n2. Create a corresponding timer for each event duration.\n3. Name the timers exactly as they appear in the agenda.\n4. If any event is missing a duration, assume 30 minutes and flag it for me.',
  },
  {
    icon: IconWand,
    title: 'Morning Routine',
    description: 'Structured start to your day',
    prompt: 'Build a "Perfect Morning" timer sequence:\n1. "Wake Up & Hydrate" - 5 mins\n2. "Meditation/Mindfulness" - 10 mins\n3. "Quick Exercise" - 15 mins\n4. "Shower & Get Ready" - 20 mins\n5. "Breakfast" - 15 mins\n\nTotal duration should be around 1 hour. Please set them to run one after another.',
  },
];

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
  const [showHero, setShowHero] = useState(true);
  const resetRef = useRef<() => void>(null);
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
    setShowHero(false);

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
        content: 'Hi! I can help you create custom timers. Just describe what you need, or upload a file for me to analyze. I can also manage your existing timers by removing specific ones or clearing them all.',
        timestamp: new Date(),
      },
    ]);
    setUploadedFile(null);
    setExtractedFileContent(null);
    setHasFileSent(false);
    setSessionId(null);
    setShowHero(true);
    resetRef.current?.();
  };

  const handleSamplePromptClick = (prompt: string) => {
    setTimeout(() => {
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
        content: prompt,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsThinking(true);
      setShowHero(false);

      // Send WebSocket message
      const wsMessage = {
        type: 'agent_query',
        question: prompt,
        ...(sessionId && { session_id: sessionId }),
      };

      wsService?.send(wsMessage);
    }, 0);
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    setUploadedFile(file);
    setIsExtractingFile(true);

    try {
      const result = await extractFileContent(file);

      if (result.success && result.content) {
        setExtractedFileContent(result.content);
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
      withCloseButton={false}
      centered
      size="90%"
      padding={0}
      styles={{
        body: { padding: 0 },
        content: {
          borderRadius: 'var(--mantine-radius-xl)',
          overflow: 'hidden',
          backgroundColor: 'transparent',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
        }
      }}
    >
      <div className={classes.container}>
        {/* Custom Header */}
        <div className={classes.header}>
          <Group gap="sm">
            <Avatar color="blue" radius="md">
              <IconSparkles size={20} />
            </Avatar>
            <div>
              <Text fw={700} size="sm">Timer Assistant</Text>
              <Text size="xs" c="dimmed">Powered by VeroTime.io</Text>
            </div>
          </Group>
          <Group gap="xs">
            <Tooltip label="Clear chat">
              <ActionIcon variant="subtle" color="black" onClick={handleClearChat}>
                <IconRotateClockwise size={20} />
              </ActionIcon>
            </Tooltip>
            <ActionIcon variant="subtle" color="black" onClick={onClose}>
              <IconX size={20} />
            </ActionIcon>
          </Group>
        </div>

        {/* Chat Area */}
        <ScrollArea
          className={classes.scrollArea}
          viewportRef={viewport}
          type="auto"
        >
          <div className={classes.messagesContainer}>
            {showHero && messages.length === 1 ? (
              <div className={classes.heroContainer}>
                <div className={classes.heroIcon}>
                  <IconSparkles size={32} />
                </div>
                <Text size="xl" fw={700} mb="xs">
                  How can I help you today?
                </Text>
                <Text size="sm" c="dimmed" mb="xl" style={{ maxWidth: 400 }}>
                  I can help you create complex timers, analyze schedules, or organize your day. Just ask!
                </Text>

                <div className={classes.suggestionGrid}>
                  {SAMPLE_PROMPTS.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <UnstyledButton
                        key={index}
                        className={classes.suggestionCard}
                        onClick={() => handleSamplePromptClick(prompt.title)}
                      >
                        <div className={classes.suggestionIcon}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <Text size="sm" fw={600} mb={2}>
                            {prompt.title}
                          </Text>
                          <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }}>
                            {prompt.description}
                          </Text>
                        </div>
                      </UnstyledButton>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`${classes.messageBubble} ${message.role === 'user' ? classes.userMessage : classes.aiMessage
                      }`}
                  >
                    {message.role === 'assistant' ? (
                      <Group align="flex-start" gap="sm" wrap="nowrap">
                        <Avatar
                          size="sm"
                          radius="sm"
                          color="blue"
                          style={{ backgroundColor: 'var(--mantine-color-blue-light)' }}
                        >
                          <IconSparkles size={16} />
                        </Avatar>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <Box className="markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                          </Box>
                          {index > 0 && (
                            <Group gap="xs" mt="sm">
                              <Tooltip label={copiedId === message.id ? "Copied!" : "Copy"}>
                                <ActionIcon
                                  size="xs"
                                  variant="subtle"
                                  color="gray"
                                  onClick={() => handleCopyMessage(message.content, message.id)}
                                >
                                  {copiedId === message.id ? <IconCheck size={14} /> : <IconCopy size={14} />}
                                </ActionIcon>
                              </Tooltip>
                              <Group gap={4}>
                                <ActionIcon
                                  size="xs"
                                  variant={feedbackId === message.id && feedbackType === 'good' ? 'light' : 'subtle'}
                                  color={feedbackId === message.id && feedbackType === 'good' ? 'green' : 'gray'}
                                  onClick={() => handleFeedback(message.id, 'good')}
                                >
                                  <IconThumbUp size={14} />
                                </ActionIcon>
                                <ActionIcon
                                  size="xs"
                                  variant={feedbackId === message.id && feedbackType === 'bad' ? 'light' : 'subtle'}
                                  color={feedbackId === message.id && feedbackType === 'bad' ? 'red' : 'gray'}
                                  onClick={() => handleFeedback(message.id, 'bad')}
                                >
                                  <IconThumbDown size={14} />
                                </ActionIcon>
                              </Group>
                            </Group>
                          )}
                        </div>
                      </Group>
                    ) : (
                      <Text style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {message.content}
                      </Text>
                    )}
                  </div>
                ))}

                {isThinking && (
                  <div className={classes.typingIndicator}>
                    <div className={classes.dot} />
                    <div className={classes.dot} />
                    <div className={classes.dot} />
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className={classes.inputWrapper}>
          {uploadedFile && (
            <Paper
              p="xs"
              mb="sm"
              radius="md"
              withBorder
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <IconFile size={16} />
              <Text size="sm">{uploadedFile.name}</Text>
              <ActionIcon
                size="xs"
                color="red"
                variant="subtle"
                onClick={handleRemoveFile}
                disabled={hasFileSent}
              >
                <IconX size={14} />
              </ActionIcon>
            </Paper>
          )}

          <div className={classes.inputContainer}>
            <FileButton
              resetRef={resetRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.md,.txt,.csv,.xlsx,.xls"
              disabled={uploadedFile !== null || isExtractingFile}
            >
              {(props) => (
                <Tooltip label="Attach file">
                  <ActionIcon
                    {...props}
                    variant="subtle"
                    color="black"
                    size="lg"
                    radius="xl"
                    disabled={uploadedFile !== null || isExtractingFile}
                  >
                    <IconPaperclip size={20} />
                  </ActionIcon>
                </Tooltip>
              )}
            </FileButton>

            <input
              className={classes.inputField}
              placeholder="Ask me anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
            />

            <button
              className={classes.sendButton}
              onClick={handleSendMessage}
              disabled={(!inputValue.trim() && !extractedFileContent) || isThinking}
            >
              <IconSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
