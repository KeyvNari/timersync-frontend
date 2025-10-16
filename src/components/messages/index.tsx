// src/components/messages/index.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Group,
  Text,
  TextInput,
  Textarea,
  Checkbox,
  Modal,
  Tooltip,
  Badge,
  Popover,
  ColorPicker,
  ActionIcon,
} from '@mantine/core';
import { IconPlus, IconTrash, IconEye, IconEyeOff, IconPalette } from '@tabler/icons-react';
import { v4 as uuidv4 } from 'uuid';
import cx from 'clsx';
import classes from './messages.module.css';
import { useWebSocketContext } from '@/providers/websocket-provider';

export interface Message {
  id: string;
  date: string;
  content: string;
  color?: string | null;
  is_focused?: boolean;
  is_flashing?: boolean;
  source?: string | null;
  asker?: string | null;
  is_showing: boolean;
  show_asker?: boolean;
  show_source?: boolean;
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
  const [editingSource, setEditingSource] = useState(false);
  const [sourceValue, setSourceValue] = useState(message.source || '');
  const [editingAsker, setEditingAsker] = useState(false);
  const [askerValue, setAskerValue] = useState(message.asker || '');
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

  const handleSaveSource = () => {
    onUpdate(message.id, { source: sourceValue || undefined });
    setEditingSource(false);
  };

  const handleCancelSource = () => {
    setSourceValue(message.source || '');
    setEditingSource(false);
  };

  const handleSaveAsker = () => {
    onUpdate(message.id, { asker: askerValue || undefined });
    setEditingAsker(false);
  };

  const handleCancelAsker = () => {
    setAskerValue(message.asker || '');
    setEditingAsker(false);
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

  const handleToggleFocused = (checked: boolean) => {
    onUpdate(message.id, { is_focused: checked });
  };

  const handleToggleFlashing = (checked: boolean) => {
    onUpdate(message.id, { is_flashing: checked });
  };

  const handleToggleShowAsker = (checked: boolean) => {
    onUpdate(message.id, { show_asker: checked });
  };

  const handleToggleShowSource = (checked: boolean) => {
    onUpdate(message.id, { show_source: checked });
  };

  return (
    <div
      className={cx(classes.item, {
        [classes.itemFlashing]: message.is_flashing,
      })}
      style={{
        borderLeftColor: message.is_showing && message.color ? message.color : 'transparent',
        borderLeftWidth: message.is_showing ? '3px' : '3px',
      }}
    >
      <div className={classes.messageContent}>
        <div className={classes.messageHeader}>
          <Text size="xs" c="dimmed">
            {new Date(message.date).toLocaleString()}
          </Text>
        </div>

        <div className={classes.messageMeta}>
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
            <div style={{ width: '100%', marginBottom: '8px' }}>
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
            </div>
          )}

          {/* Source editing */}
          <span className={classes.editableField} onClick={() => !editingSource && setEditingSource(true)}>
            Source: {editingSource ? (
              <Group gap="xs" style={{ display: 'inline-flex' }}>
                <TextInput
                  value={sourceValue}
                  onChange={(e) => setSourceValue(e.currentTarget.value)}
                  onBlur={handleSaveSource}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveSource();
                    if (e.key === 'Escape') handleCancelSource();
                  }}
                  size="xs"
                  style={{ width: '120px', display: 'inline-block' }}
                  autoFocus
                />
              </Group>
            ) : (
              <span style={{ minWidth: '20px', display: 'inline-block' }}>
                {message.source ? message.source : <span style={{color: 'gray'}}>Enter source...</span>}
              </span>
            )}
          </span>

          {/* Asker editing */}
          <span className={classes.editableField} onClick={() => !editingAsker && setEditingAsker(true)}>
            Asked by: {editingAsker ? (
              <Group gap="xs" style={{ display: 'inline-flex' }}>
                <TextInput
                  value={askerValue}
                  onChange={(e) => setAskerValue(e.currentTarget.value)}
                  onBlur={handleSaveAsker}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveAsker();
                    if (e.key === 'Escape') handleCancelAsker();
                  }}
                  size="xs"
                  style={{ width: '120px', display: 'inline-block' }}
                  autoFocus
                />
              </Group>
            ) : (
              <span style={{ minWidth: '20px', display: 'inline-block' }}>
                {message.asker ? message.asker : <span style={{color: 'gray'}}>Enter asker...</span>}
              </span>
            )}
          </span>

          {/* Color editing */}
          <Popover
            opened={colorPickerOpened}
            onChange={setColorPickerOpened}
            width={250}
            position="bottom"
            withArrow
            shadow="md"
          >
            <Popover.Target>
              <span
                className={classes.editableField}
                onClick={() => setColorPickerOpened(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Color:</span>
                {message.color ? (
                  <>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: message.color,
                        border: '1px solid var(--mantine-color-gray-4)',
                        borderRadius: '3px',
                      }}
                    />
                    <span>{message.color}</span>
                  </>
                ) : (
                  <span>none</span>
                )}
              </span>
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
        </div>
      </div>

      <div className={classes.controls}>
        {/* Show Source checkbox */}
        <Tooltip label="Show Source" position="top" withArrow>
          <div className={classes.checkboxWrapper}>
            <Checkbox
              checked={message.show_source || false}
              onChange={(e) => handleToggleShowSource(e.currentTarget.checked)}
              size="xs"
              label="S"
              styles={{
                label: { fontSize: '10px', fontWeight: 600 },
              }}
            />
          </div>
        </Tooltip>

        {/* Show Asker checkbox */}
        <Tooltip label="Show Asker" position="top" withArrow>
          <div className={classes.checkboxWrapper}>
            <Checkbox
              checked={message.show_asker || false}
              onChange={(e) => handleToggleShowAsker(e.currentTarget.checked)}
              size="xs"
              label="A"
              styles={{
                label: { fontSize: '10px', fontWeight: 600 },
              }}
            />
          </div>
        </Tooltip>

        {/* Focused checkbox */}
        <Tooltip label="Focused" position="top" withArrow>
          <div className={classes.checkboxWrapper}>
            <Checkbox
              checked={message.is_focused || false}
              onChange={(e) => handleToggleFocused(e.currentTarget.checked)}
              size="xs"
              label="F"
              styles={{
                label: { fontSize: '10px', fontWeight: 600 },
              }}
            />
          </div>
        </Tooltip>

        {/* Flashing checkbox */}
        <Tooltip label="Flashing" position="top" withArrow>
          <div className={classes.checkboxWrapper}>
            <Checkbox
              checked={message.is_flashing || false}
              onChange={(e) => handleToggleFlashing(e.currentTarget.checked)}
              size="xs"
              label="⚡"
              styles={{
                label: { fontSize: '12px' },
              }}
            />
          </div>
        </Tooltip>

        {/* Show/Hide button */}
        <Tooltip label={message.is_showing ? 'Hide message' : 'Show message'} position="top" withArrow>
          <button
            className={cx(classes.controlButton, message.is_showing ? classes.showing : classes.hidden)}
            onClick={handleToggleShowing}
          >
            {message.is_showing ? <IconEye size={14} /> : <IconEyeOff size={14} />}
          </button>
        </Tooltip>

        {/* Delete button */}
        <Tooltip label="Delete message" position="top" withArrow>
          <button className={cx(classes.controlButton, classes.delete)} onClick={handleDeleteClick}>
            <IconTrash size={14} />
          </button>
        </Tooltip>
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

  // Use local state only if useLocalState is true, otherwise use WebSocket context
  const [localMessages, setLocalMessages] = useState<Message[]>(propMessages || []);

  // Determine which messages to use
  const messages = useLocalState ? localMessages : (wsContext?.messages || []);

  // Debug logging - track when messages change from context
  useEffect(() => {
    console.log('📬 Messages component: Context messages changed:', {
      useLocalState,
      messageCount: messages.length,
      messages: messages,
      wsContextMessages: wsContext?.messages,
      wsContextMessagesCount: wsContext?.messages?.length
    });
  }, [messages, wsContext?.messages, useLocalState]);

  // Debug logging - track component mount/unmount
  useEffect(() => {
    console.log('🎬 Messages component mounted', {
      useLocalState,
      initialMessageCount: messages.length
    });
    return () => {
      console.log('🎬 Messages component unmounted');
    };
  }, []);

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
      is_showing: true,
    };

    addMessageFn(newMessage);
  };

  const handleUpdateMessage = (id: string, updates: Partial<Message>) => {
    updateMessageFn(id, updates);
  };

  const handleDeleteMessage = (id: string) => {
    deleteMessageFn(id);
  };

  return (
    <Box className={classes.container}>
      {/* Add Message Button */}
      <Group mb="md">
        <Button leftSection={<IconPlus size={16} />} onClick={handleAddMessage} size="sm">
          Add Message
        </Button>
      </Group>

      {/* Messages List */}
      {messages.length === 0 ? (
        <Text c="dimmed" size="sm" ta="center" mt="xl">
          No messages yet. Click "Add Message" to create your first message.
        </Text>
      ) : (
        <Box className={classes.messagesList}>
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onUpdate={handleUpdateMessage}
              onDelete={handleDeleteMessage}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
