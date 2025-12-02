import { useState, useRef, useEffect, useMemo } from 'react';
import { Text, TextInput, ActionIcon, Group, Tooltip, Select, Modal, Stack, Divider, Button, Box, ThemeIcon, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconEdit,
  IconCheck,
  IconX,
  IconClock,
  IconWorld,
  IconMapPin
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

interface EditableRoomNameProps {
  initialName?: string;
  initialTimeZone?: string;
  onSave?: (name: string) => void;
  onTimeZoneSave?: (timeZone: string) => void;
  maxLength?: number;
}

export function EditableRoomName({
  initialName = "Unnamed Room...",
  initialTimeZone = "Europe/Berlin",
  onSave,
  onTimeZoneSave,
  maxLength = 50
}: EditableRoomNameProps) {
  const [roomName, setRoomName] = useState(initialName);
  const [timeZone, setTimeZone] = useState(initialTimeZone);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(roomName);

  // Modal state
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [modalTimeZone, setModalTimeZone] = useState(timeZone);

  // Time state
  const [currentTime, setCurrentTime] = useState(dayjs());
  const inputRef = useRef<HTMLInputElement>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Sync props with state
  useEffect(() => {
    setRoomName(initialName);
  }, [initialName]);

  useEffect(() => {
    setTimeZone(initialTimeZone);
    setModalTimeZone(initialTimeZone);
  }, [initialTimeZone]);

  const handleStartEdit = () => {
    setTempName(roomName);
    setIsEditing(true);
  };

  const handleSaveName = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== roomName) {
      setRoomName(trimmedName);
      onSave?.(trimmedName);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempName(roomName);
    setIsEditing(false);
  };

  const handleSaveTimeZone = () => {
    if (modalTimeZone !== timeZone) {
      setTimeZone(modalTimeZone);
      onTimeZoneSave?.(modalTimeZone);
    }
    closeModal();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSaveName();
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Get browser timezone
  const browserTimeZone = useMemo(() => {
    try {
      return dayjs.tz.guess();
    } catch (e) {
      return 'UTC';
    }
  }, []);

  // Generate timezone options with groups
  const timeZoneOptions = useMemo(() => {
    // Common timezones list
    const commonTimezones = [
      'UTC',
      'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Toronto', 'America/Sao_Paulo',
      'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Amsterdam', 'Europe/Moscow', 'Europe/Istanbul',
      'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Singapore', 'Asia/Bangkok',
      'Australia/Sydney', 'Pacific/Auckland'
    ];

    // Group by region
    const groups: Record<string, { value: string; label: string }[]> = {};

    commonTimezones.forEach(tz => {
      try {
        const offset = dayjs().tz(tz).format('Z');
        const region = tz.includes('/') ? tz.split('/')[0] : 'Other';
        const city = tz.includes('/') ? tz.split('/')[1].replace(/_/g, ' ') : tz;

        if (!groups[region]) {
          groups[region] = [];
        }

        groups[region].push({
          value: tz,
          label: `(UTC${offset}) ${city}`
        });
      } catch (e) {
        console.error(`Error parsing timezone ${tz}`, e);
      }
    });

    // Convert to Mantine format and sort
    return Object.entries(groups)
      .map(([group, items]) => ({
        group,
        items: items.sort((a, b) => a.label.localeCompare(b.label))
      }))
      .sort((a, b) => a.group.localeCompare(b.group));
  }, []);

  // Format times for display
  const roomTime = useMemo(() => {
    try {
      return currentTime.tz(timeZone);
    } catch (e) {
      return currentTime;
    }
  }, [currentTime, timeZone]);

  const previewRoomTime = useMemo(() => {
    try {
      return currentTime.tz(modalTimeZone);
    } catch (e) {
      return currentTime;
    }
  }, [currentTime, modalTimeZone]);

  const localTime = currentTime;

  const formatTime = (time: dayjs.Dayjs) => time.format('HH:mm');
  const formatDate = (time: dayjs.Dayjs) => time.format('ddd, MMM D');

  return (
    <>
      <Group gap="md" align="center">
        {/* Room Name Section */}
        <Box>
          {isEditing ? (
            <Group gap="xs">
              <TextInput
                ref={inputRef}
                value={tempName}
                onChange={(e) => setTempName(e.currentTarget.value)}
                onKeyDown={handleKeyPress}
                placeholder="Room name"
                size="md"
                styles={{
                  input: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    height: 'auto',
                    padding: '0 8px',
                    minWidth: '200px'
                  }
                }}
                maxLength={maxLength}
              />
              <ActionIcon size="lg" color="green" variant="light" onClick={handleSaveName}>
                <IconCheck size={20} />
              </ActionIcon>
              <ActionIcon size="lg" color="red" variant="light" onClick={handleCancelEdit}>
                <IconX size={20} />
              </ActionIcon>
            </Group>
          ) : (
            <Group gap="xs" align="center">
              <Text
                fw={800}
                size="xl"
                style={{
                  fontSize: '1.75rem',
                  lineHeight: 1.2,
                  cursor: 'pointer'
                }}
                onClick={handleStartEdit}
              >
                {roomName}
              </Text>
              <Tooltip label="Edit room name">
                <ActionIcon
                  variant="transparent"
                  color="gray"
                  size="sm"
                  onClick={handleStartEdit}
                  style={{ opacity: 0.5 }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}
        </Box>

        <Divider orientation="vertical" h={30} visibleFrom="sm" />

        {/* Time & Timezone Section - Clickable */}
        <Tooltip label="View time details & change timezone" withArrow position="bottom">
          <Button
            variant="subtle"
            color="gray"
            onClick={openModal}
            h="auto"
            py={4}
            px="xs"
            styles={{
              root: {
                fontWeight: 400,
                '&:hover': {
                  backgroundColor: 'var(--mantine-color-gray-1)'
                }
              }
            }}
          >
            <Group gap="xs">
              <ThemeIcon variant="light" color="blue" size="md" radius="md">
                <IconClock size={18} />
              </ThemeIcon>
              <Stack gap={0} align="flex-start">
                <Text size="sm" fw={700} lh={1.2} c="dark">
                  {formatTime(roomTime)}
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  {timeZone.split('/').pop()?.replace(/_/g, ' ')}
                </Text>
              </Stack>
            </Group>
          </Button>
        </Tooltip>
      </Group>

      {/* Timezone Settings Modal */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={
          <Group gap="xs">
            <IconWorld size={20} />
            <Text fw={700}>Room Time Settings</Text>
          </Group>
        }
        centered
        size="lg"
      >
        <Stack gap="lg">
          {/* Time Comparison */}
          <Box p="lg" bg="gray.0" style={{ borderRadius: '8px' }}>
            <Stack gap="lg">
              <Stack gap="xs" align="center">
                <Badge variant="dot" size="lg" color="blue">Room Time</Badge>
                <Text size="2.5rem" fw={800} lh={1.1} variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>
                  {formatTime(previewRoomTime)}
                </Text>
                <Text size="sm" c="dimmed" ta="center" maw="100%">
                  {formatDate(previewRoomTime)}
                </Text>
                <Text size="xs" c="dimmed" ta="center" maw="100%" style={{ wordBreak: 'break-word' }}>
                  {modalTimeZone}
                </Text>
              </Stack>

              <Divider />

              <Stack gap="xs" align="center">
                <Badge variant="dot" size="lg" color="gray">Your Time</Badge>
                <Text size="2.5rem" fw={800} lh={1.1} c="dimmed">
                  {formatTime(localTime)}
                </Text>
                <Text size="sm" c="dimmed" ta="center" maw="100%">
                  {formatDate(localTime)}
                </Text>
                <Text size="xs" c="dimmed" ta="center" maw="100%" style={{ wordBreak: 'break-word' }}>
                  {browserTimeZone}
                </Text>
              </Stack>
            </Stack>
          </Box>

          {/* Timezone Selection */}
          <Stack gap="xs">
            <Text size="sm" fw={500}>Select Room Timezone</Text>
            <Select
              searchable
              data={timeZoneOptions}
              value={modalTimeZone}
              onChange={(val) => setModalTimeZone(val || 'UTC')}
              leftSection={<IconMapPin size={16} />}
              placeholder="Search timezone..."
              maxDropdownHeight={200}
              nothingFoundMessage="No timezone found"
            />
            <Text size="xs" c="dimmed">
              This will update the countdown timers for everyone in the room.
            </Text>
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSaveTimeZone} color="blue">Save Changes</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
