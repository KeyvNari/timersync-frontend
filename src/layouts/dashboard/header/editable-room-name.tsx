import { useState, useRef, useEffect } from 'react';
import { Text, TextInput, ActionIcon, Group, Tooltip } from '@mantine/core';
import { PiPencilSimpleDuotone as EditIcon, PiCheckDuotone as CheckIcon, PiXDuotone as CancelIcon } from 'react-icons/pi';

interface EditableRoomNameProps {
  initialName?: string;
  onSave?: (name: string) => void;
  maxLength?: number;
}

export function EditableRoomName({ 
  initialName = "Unnamed Room...", 
  onSave, 
  maxLength = 50 
}: EditableRoomNameProps) {
  const [roomName, setRoomName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(roomName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setTempName(roomName);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== roomName) {
      setRoomName(trimmedName);
      onSave?.(trimmedName);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(roomName);
    setIsEditing(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Group gap="xs" wrap="nowrap">
        <TextInput
          ref={inputRef}
          value={tempName}
          onChange={(e) => setTempName(e.currentTarget.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleSave}
          size="sm"
          styles={{
            input: {
              minWidth: '120px',
              maxWidth: '250px',
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
          maxLength={maxLength}
        />
        <Group gap={4}>
          <Tooltip label="Save">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="green"
              onClick={handleSave}
            >
              <CheckIcon size="0.875rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Cancel">
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={handleCancel}
            >
              <CancelIcon size="0.875rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    );
  }

  return (
    <Group gap="xs" wrap="nowrap">
      <Text
        fw={500}
        style={{
          cursor: 'pointer',
          minWidth: '60px',
          fontSize: '2rem',
        }}
        onClick={handleStartEdit}
        title="Click to edit room name"
      >
        {roomName}
      </Text>
      <Tooltip label="Edit room name">
        <ActionIcon
          size="sm"
          variant="subtle"
          onClick={handleStartEdit}
          style={{ opacity: 0.7 }}
        >
          <EditIcon size="0.875rem" />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}