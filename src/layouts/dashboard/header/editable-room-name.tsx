import { useState, useRef, useEffect } from 'react';
import { Text, TextInput, ActionIcon, Group, Tooltip, Select } from '@mantine/core';
import { PiPencilSimpleDuotone as EditIcon, PiCheckDuotone as CheckIcon, PiXDuotone as CancelIcon } from 'react-icons/pi';

interface EditableRoomNameProps {
  initialName?: string;
  initialTimeZone?: string;
  onSave?: (name: string) => void;
  onTimeZoneSave?: (timeZone: string) => void;
  maxLength?: number;
}

export function EditableRoomName({
  initialName = "Unnamed Room...",
  initialTimeZone = "UTC",
  onSave,
  onTimeZoneSave,
  maxLength = 50
}: EditableRoomNameProps) {
  const [roomName, setRoomName] = useState(initialName);
  const [timeZone, setTimeZone] = useState(initialTimeZone);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(roomName);
  const [tempTimeZone, setTempTimeZone] = useState(timeZone);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Update the roomName state when initialName prop changes
  useEffect(() => {
    setRoomName(initialName);
  }, [initialName]);

  // Update the timeZone state when initialTimeZone prop changes
  useEffect(() => {
    setTimeZone(initialTimeZone);
  }, [initialTimeZone]);

  // Sync tempName and tempTimeZone when not editing
  useEffect(() => {
    if (!isEditing) {
      setTempName(roomName);
      setTempTimeZone(timeZone);
    }
  }, [roomName, timeZone, isEditing]);

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
    if (tempTimeZone !== timeZone) {
      setTimeZone(tempTimeZone);
      onTimeZoneSave?.(tempTimeZone);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(roomName);
    setTempTimeZone(timeZone);
    setIsEditing(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  // Timezone options
  const timeZoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'EST (Eastern Standard Time)' },
    { value: 'America/Chicago', label: 'CST (Central Standard Time)' },
    { value: 'America/Denver', label: 'MST (Mountain Standard Time)' },
    { value: 'America/Los_Angeles', label: 'PST (Pacific Standard Time)' },
    { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)' },
    { value: 'Europe/Berlin', label: 'CET (Central European Time)' },
    { value: 'Europe/Paris', label: 'CET (Central European Time)' },
    { value: 'Europe/Rome', label: 'CET (Central European Time)' },
    { value: 'Europe/Moscow', label: 'MSK (Moscow Time)' },
    { value: 'Asia/Dubai', label: 'GST (Gulf Standard Time)' },
    { value: 'Asia/Kolkata', label: 'IST (Indian Standard Time)' },
    { value: 'Asia/Shanghai', label: 'CST (China Standard Time)' },
    { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)' },
    { value: 'Asia/Seoul', label: 'KST (Korea Standard Time)' },
    { value: 'Australia/Sydney', label: 'AEST (Australian Eastern Standard Time)' },
    { value: 'Australia/Melbourne', label: 'AEST (Australian Eastern Standard Time)' },
    { value: 'Pacific/Auckland', label: 'NZST (New Zealand Standard Time)' },
  ];

  if (isEditing) {
    return (
      <Group gap="sm" wrap="wrap" align="flex-start">
        <div>
          <TextInput
            ref={inputRef}
            value={tempName}
            onChange={(e) => setTempName(e.currentTarget.value)}
            onKeyDown={handleKeyPress}
            placeholder="Room name"
            size="sm"
            mb="xs"
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
          <Select
            value={tempTimeZone}
            onChange={(value) => setTempTimeZone(value || 'UTC')}
            data={timeZoneOptions}
            placeholder="Select timezone"
            size="sm"
            styles={{
              input: {
                minWidth: '120px',
                maxWidth: '250px',
              },
            }}
          />
        </div>
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
    <Group gap="xs" wrap="nowrap" align="center">
      <Group gap="xs" align="baseline">
        <Text
          fw={500}
          style={{
            cursor: 'pointer',
            minWidth: '60px',
            fontSize: '2rem',
          }}
          onClick={handleStartEdit}
          title="Click to edit room name and timezone"
        >
          {roomName}
        </Text>
        <Group gap={4} align="center">
          <Text
            size="xs"
            c="dimmed"
            fw={500}
            style={{
              cursor: 'pointer',
              letterSpacing: '0.5px',
            }}
            onClick={handleStartEdit}
            title="Click to edit room name and timezone"
          >
            TimeZone:
          </Text>
          <Text
            size="sm"
            c="dimmed"
            style={{ cursor: 'pointer' }}
            onClick={handleStartEdit}
            title="Click to edit room name and timezone"
          >
            {timeZone}
          </Text>
        </Group>
      </Group>
      <Tooltip label="Edit room name and timezone">
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
