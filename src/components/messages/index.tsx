// src/components/messages/index.tsx
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Group,
  Text,
  TextInput,
  Textarea,
  Switch,
  Modal,
  Tooltip,
  Badge,
  Popover,
  ColorPicker,
  ActionIcon,
  Paper,
  Stack,
} from '@mantine/core';
import { IconPlus, IconTrash, IconPalette, IconSearch, IconX, IconEye, IconFocus, IconFlare } from '@tabler/icons-react';
import { v4 as uuidv4 } from 'uuid';
import cx from 'clsx';
import classes from './messages.module.css';
import { useWebSocketContext } from '@/providers/websocket-provider';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { UpgradeCta } from '@/components/timer-panel/upgrade-cta';

export interface Message {
  id: string;
  date: string;
  content: string;
  color?: string | null;
  is_focused?: boolean;
  is_flashing?: boolean;
  is_showing: boolean;
}

interface MessagesProps {
  // Props are now optional - we use WebSocket context by default
  messages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
  // If true, use local state instead of WebSocket (for testing/standalone use)
  useLocalState?: boolean;
}

interface MessageItemProps {
  message: Message;
  onUpdate: (id: string, updates: Partial<Message>) => void;
  onDelete: (id: string) => void;
}

function MessageItem({ message, onUpdate, onDelete }: MessageItemProps) {
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [contentValue, setContentValue] = useState(message.content);

  // Inline editing states for other fields
  const [colorPickerOpened, setColorPickerOpened] = useState(false);
  const [colorValue, setColorValue] = useState(message.color || '');

  const handleDeleteClick = () => {
    setDeleteModalOpened(true);
  };

  const handleConfirmDelete = () => {
    setDeleteModalOpened(false);
    onDelete(message.id);
  };

  const handleSaveContent = () => {
    if (contentValue.trim() && contentValue.length <= 2000) {
      onUpdate(message.id, { content: contentValue });
      setEditingContent(false);
    }
  };

  const handleCancelEdit = () => {
    setContentValue(message.content);
    setEditingContent(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };


  const handleColorChange = (color: string) => {
    setColorValue(color);
    onUpdate(message.id, { color: color || undefined });
  };

  const handleClearColor = () => {
    setColorValue('');
    onUpdate(message.id, { color: undefined });
    setColorPickerOpened(false);
  };

  const handleToggleShowing = () => {
    onUpdate(message.id, { is_showing: !message.is_showing });
  };

  return (
    <div
      className={cx(classes.item, {
        [classes.itemFlashing]: message.is_flashing && message.is_showing,
        [classes.itemShowing]: message.is_showing,
      })}
      style={{
        borderLeftColor: message.is_showing && message.color ? message.color : undefined,
      }}
    >
      <div className={classes.messageContent}>
        <div className={classes.messageHeader}>
          <Text size="xs" c="dimmed">
            {new Date(message.date).toLocaleString()}
          </Text>
          {message.is_showing && (
            <Badge size="xs" color="blue" variant="filled">
              SHOWING
            </Badge>
          )}
        </div>

        {/* Content editing */}
        {editingContent ? (
          <div style={{ width: '100%', marginBottom: '8px' }}>
            <Textarea
              value={contentValue}
              onChange={(e) => setContentValue(e.currentTarget.value)}
              onKeyDown={handleKeyPress}
              size="xs"
              minRows={2}
              maxLength={2000}
              autoFocus
            />
            <Group gap="xs" mt="xs">
              <Button size="xs" onClick={handleSaveContent}>
                Save
              </Button>
              <Button size="xs" variant="default" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </Group>
          </div>
        ) : (
          <div className={classes.messageTextBox}>
            {message.content === 'New message' ? (
              <div className={classes.emptyMessageContent} onClick={() => setEditingContent(true)}>
                <Text size="sm" c="dimmed">
                  Click to edit message...
                </Text>
              </div>
            ) : (
              <Text
                size="sm"
                className={classes.editableField}
                onClick={() => setEditingContent(true)}
                style={{
                  color: message.color || undefined,
                  fontWeight: message.is_focused ? 700 : 500,
                  fontSize: message.is_focused ? '15px' : undefined,
                  textDecoration: message.is_focused ? 'underline' : undefined,
                }}
              >
                {message.content}
              </Text>
            )}
          </div>
        )}
      </div>

      <div className={classes.controls}>
        {/* Show button with icon and text */}
        <Button
          variant={message.is_showing ? 'filled' : 'default'}
          onClick={handleToggleShowing}
          size="xs"
          leftSection={<IconEye size={14} />}
        >
          Show
        </Button>

        {/* Color picker */}
        <Popover
          opened={colorPickerOpened}
          onChange={setColorPickerOpened}
          width={250}
          position="bottom"
          withArrow
          shadow="md"
        >
          <Popover.Target>
            <Button
              variant="default"
              onClick={() => setColorPickerOpened(true)}
              size="xs"
              leftSection={
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: message.color || '#FFFFFF',
                    border: '1px solid var(--mantine-color-gray-4)',
                    borderRadius: '2px',
                  }}
                />
              }
            >
              Color
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <ColorPicker
              format="hex"
              value={colorValue || '#000000'}
              onChange={handleColorChange}
              swatches={[
                '#FF5733',
                '#33FF57',
                '#3357FF',
                '#F333FF',
                '#FF33F3',
                '#33FFF3',
                '#F3FF33',
                '#FF8C33',
                '#8C33FF',
                '#33FF8C',
              ]}
            />
            <Group justify="space-between" mt="xs">
              <Button size="xs" variant="light" color="red" onClick={handleClearColor}>
                Clear
              </Button>
              <Button size="xs" onClick={() => setColorPickerOpened(false)}>
                Done
              </Button>
            </Group>
          </Popover.Dropdown>
        </Popover>

        {/* Delete button */}
        <ActionIcon
          variant="default"
          color="red"
          onClick={handleDeleteClick}
          size="sm"
          title="Delete message"
        >
          <IconTrash size={16} />
        </ActionIcon>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={() => setDeleteModalOpened(false)} title="Delete Message" centered>
        <Text mb="lg">Are you sure you want to delete this message? This action cannot be undone.</Text>
        <Group justify="flex-end" gap="md">
          <Button variant="light" onClick={() => setDeleteModalOpened(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleConfirmDelete}>
            Delete Message
          </Button>
        </Group>
      </Modal>
    </div>
  );
}

export function Messages({
  messages: propMessages,
  onMessagesChange,
  useLocalState = false
}: MessagesProps) {
  // Get WebSocket context
  const wsContext = useWebSocketContext();
  const features = useFeatureAccess();

  // Use local state only if useLocalState is true, otherwise use WebSocket context
  const [localMessages, setLocalMessages] = useState<Message[]>(propMessages || []);

  // Determine which messages to use
  const messages = useLocalState ? localMessages : (wsContext?.messages || []);

  // Ref for scrollable content
  const scrollableRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef(messages.length);

  // Debug logging - track when messages change from context
  useEffect(() => {
    // Messages state tracked internally
  }, [messages, wsContext?.messages, useLocalState]);

  // Debug logging - track component mount/unmount
  useEffect(() => {
    // Component lifecycle tracked
    return () => {
      // Component unmounting
    };
  }, []);

  // Auto-scroll to bottom when new message is added
  useEffect(() => {
    if (messages.length > previousMessageCount.current) {
      // New message was added, scroll to bottom
      if (scrollableRef.current) {
        scrollableRef.current.scrollTo({
          top: scrollableRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
    previousMessageCount.current = messages.length;
  }, [messages.length]);

  // Determine which update functions to use
  const addMessageFn = useLocalState
    ? (messageData: Omit<Message, 'id'>) => {
        const newMessage: Message = {
          ...messageData,
          id: uuidv4(),
        };
        const newMessages = [...localMessages, newMessage];
        setLocalMessages(newMessages);
        onMessagesChange?.(newMessages);
      }
    : (messageData: Omit<Message, 'id'>) => {
        wsContext?.addMessage(messageData);
      };

  const updateMessageFn = useLocalState
    ? (id: string, updates: Partial<Message>) => {
        const updatedMessages = localMessages.map((msg) =>
          msg.id === id ? { ...msg, ...updates } : msg
        );
        setLocalMessages(updatedMessages);
        onMessagesChange?.(updatedMessages);
      }
    : (id: string, updates: Partial<Message>) => {
        wsContext?.updateMessage(id, updates);
      };

  const deleteMessageFn = useLocalState
    ? (id: string) => {
        const updatedMessages = localMessages.filter((msg) => msg.id !== id);
        setLocalMessages(updatedMessages);
        onMessagesChange?.(updatedMessages);
      }
    : (id: string) => {
        wsContext?.deleteMessage(id);
      };

  const handleAddMessage = () => {
    const newMessage = {
      date: new Date().toISOString(),
      content: 'New message',
      color: '#FFFFFF',
      is_focused: false,
      is_flashing: false,
      source: 'user',
      asker: undefined,
      is_showing: false,
    };

    addMessageFn(newMessage);
  };

  const handleUpdateMessage = (id: string, updates: Partial<Message>) => {
    // If showing a message, hide all other messages first and apply global display options
    if (updates.is_showing === true) {
      // Hide all other messages that are currently showing
      messages
        .filter(msg => msg.id !== id && msg.is_showing)
        .forEach(msg => {
          updateMessageFn(msg.id, { is_showing: false });
        });

      // Apply global display options to the newly shown message
      updates = {
        ...updates,
        is_focused: globalDisplayOptions.is_focused,
        is_flashing: globalDisplayOptions.is_flashing,
      };
    }

    // Then apply the update to the selected message
    updateMessageFn(id, updates);
  };

  const handleDeleteMessage = (id: string) => {
    deleteMessageFn(id);
  };

  // Get the currently showing message for global controls
  const showingMessage = messages.find(m => m.is_showing);

  // Store global display options state
  const [globalDisplayOptions, setGlobalDisplayOptions] = useState({
    is_focused: false,
    is_flashing: false,
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sync global options with showing message
  useEffect(() => {
    if (showingMessage) {
      setGlobalDisplayOptions({
        is_focused: showingMessage.is_focused || false,
        is_flashing: showingMessage.is_flashing || false,
      });
    }
  }, [showingMessage?.id, showingMessage?.is_focused, showingMessage?.is_flashing]);

  // Global control handlers - always work, apply to showing message if exists
  const handleGlobalToggleFocused = (checked: boolean) => {
    setGlobalDisplayOptions(prev => ({ ...prev, is_focused: checked }));
    if (showingMessage) {
      handleUpdateMessage(showingMessage.id, { is_focused: checked });
    }
  };

  const handleGlobalToggleFlashing = (checked: boolean) => {
    setGlobalDisplayOptions(prev => ({ ...prev, is_flashing: checked }));
    if (showingMessage) {
      handleUpdateMessage(showingMessage.id, { is_flashing: checked });
    }
  };

  // Filter messages based on search query
  const filteredMessages = messages.filter((message) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return message.content.toLowerCase().includes(query);
  });

  return (
    <Box className={classes.container}>
      {/* Fixed Header Section */}
      <Box className={classes.fixedHeader}>
        {/* Top Row: Display Options on left, Add Message on right */}
        <Group gap="xs" wrap="nowrap" align="center" justify="space-between">
          <Group gap="xs" wrap="nowrap" align="center">
            {/* Display Options - Focus Button */}
            <Button
              variant={globalDisplayOptions.is_focused ? 'filled' : 'default'}
              onClick={() => handleGlobalToggleFocused(!globalDisplayOptions.is_focused)}
              size="xs"
              leftSection={<IconFocus size={14} />}
              style={{ flexShrink: 0 }}
            >
              Focus
            </Button>

            {/* Display Options - Flash Button */}
            <Button
              variant={globalDisplayOptions.is_flashing ? 'filled' : 'default'}
              onClick={() => handleGlobalToggleFlashing(!globalDisplayOptions.is_flashing)}
              size="xs"
              leftSection={<IconFlare size={14} />}
              style={{ flexShrink: 0 }}
            >
              Flash
            </Button>

            {showingMessage && (
              <Badge size="xs" color="blue" variant="light" style={{ flexShrink: 0 }}>
                Active
              </Badge>
            )}
          </Group>

          <Tooltip label={!features.canCreateMessage().isAvailable ? features.canCreateMessage().reason : undefined} position="top" withArrow disabled={features.canCreateMessage().isAvailable}>
            <div>
              <Button
                variant="default"
                size="sm"
                onClick={handleAddMessage}
                style={{ flexShrink: 0 }}
                disabled={!features.canCreateMessage().isAvailable}
              >
                + Add Message
              </Button>
            </div>
          </Tooltip>
        </Group>
      </Box>

      {/* Scrollable Messages Section */}
      <Box className={classes.scrollableContent} ref={scrollableRef}>
        {messages.length === 0 ? (
          <Box className={classes.emptyState}>
            <Text c="dimmed" size="sm" ta="center">
              No messages yet. Click "Add Message" to create your first message.
            </Text>
          </Box>
        ) : filteredMessages.length === 0 ? (
          <Box className={classes.emptyState}>
            <Text c="dimmed" size="sm" ta="center">
              No messages found matching "{searchQuery}"
            </Text>
            <Button
              variant="subtle"
              size="xs"
              mt="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </Button>
          </Box>
        ) : (
          <Box className={classes.messagesList}>
            {filteredMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onUpdate={handleUpdateMessage}
                onDelete={handleDeleteMessage}
              />
            ))}

            {/* Show upgrade CTA if message limit is reached */}
            {!features.canCreateMessage().isAvailable && messages.length > 0 && (
              <Box style={{ gridColumn: '1 / -1', minWidth: 0 }}>
                <UpgradeCta
                  current={messages.length}
                  limit={features.planFeatures?.max_messages_per_room || 0}
                  featureLabel="messages"
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
