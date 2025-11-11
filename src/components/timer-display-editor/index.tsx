import React, { useEffect, useRef, useState } from 'react';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  ColorInput,
  Divider,
  FileInput,
  Grid,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Tabs,
  Title,
  Tooltip,
  useMantineTheme,
  BadgeVariant,
} from '@mantine/core';
import {
  IconTrash,
  IconDeviceFloppy,
  IconUpload,
  IconPhoto,
  IconPalette,
  IconClock,
  IconLayout,
  IconTextSize,
  IconChevronDown,
  IconMaximize,
  IconStar,
  IconPlus,
  IconAlertCircle,
  IconBolt,
} from '@tabler/icons-react';
import TimerDisplay from '@/components/timer-display';
import { useWebSocketContext } from '@/providers/websocket-provider';

/**
 * Redesigned Timer Display Editor (Tabs + Top Action Bar)
 *
 * - Top bar with select, name, default toggle, Save/Create, Delete, Preview action
 * - Tabs for Layout, Branding, Timer/Clock, Typography & Content, Colors
 * - Live preview on the right, sticky
 * - Unsaved changes indicator + Ctrl/Cmd+S to save
 *
 * Drop-in replacement — keeps same props and external callbacks.
 */

interface TimerDisplayEditorProps {
  initialDisplay?: any;
  displays?: any[];
  onSave?: (display: any) => void;
  onCancel?: () => void;
  onDelete?: (displayId: number) => void;
  nameError?: string | null;
  defaultDisplayId?: number | null;
}

const DEFAULT_DISPLAY = {
  name: 'New Display',
  logo_image: null,
  logo_size_percent: 60,
  logo_position: 'top_left',
  timer_format: 'mm:ss',
  timer_font_family: 'Roboto Mono',
  timer_color: '#ffffff',
  timer_size_percent: 100,
  timer_position: 'center',
  clock_font_family: 'Roboto Mono',
  clock_color: '#ffffff',
  clock_visible: false,
  message_font_family: 'Roboto Mono',
  message_color: '#ffffff',
  title_display_location: 'header',
  speaker_display_location: 'footer',
  header_font_family: 'Roboto Mono',
  header_color: '#ffffff',
  footer_font_family: 'Roboto Mono',
  footer_color: '#ffffff',
  display_ratio: '16:9',
  background_type: 'color',
  background_color: '#000000',
  background_image: null,
  progress_style: 'bottom_bar',
  progress_color_main: 'green',
  progress_color_secondary: 'orange',
  progress_color_tertiary: 'red',
  is_default: false,
};

export default function TimerDisplayEditorV2({
  initialDisplay,
  displays = [],
  onSave,
  onCancel,
  onDelete,
  nameError,
  defaultDisplayId = null,
}: TimerDisplayEditorProps) {
  const theme = useMantineTheme();
  const { setDefaultDisplay, lastError, lastSuccess } = useWebSocketContext();

  // prepare initial state with is_default flag based on defaultDisplayId
  const initialWithDefault = initialDisplay
    ? { ...initialDisplay, is_default: initialDisplay.id === defaultDisplayId }
    : { ...DEFAULT_DISPLAY, is_default: false };

  const [display, setDisplay] = useState<any>(initialWithDefault);
  const [selectedDisplayId, setSelectedDisplayId] = useState<string | number>(
    initialDisplay?.id ?? 'new'
  );
  const [isCreatingNew, setIsCreatingNew] = useState(!initialDisplay?.id);
  const [activeTab, setActiveTab] = useState<string | null>('layout');
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  const initialRef = useRef<any>(initialWithDefault);
  const unsavedRef = useRef(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Option lists
  const aspectRatioOptions = [
    { value: '16:9', label: '16:9 (Widescreen)' },
    { value: '4:3', label: '4:3 (Standard)' },
    { value: '21:9', label: '21:9 (Ultrawide)' },
    { value: '1:1', label: '1:1 (Square)' },
  ];
  const monoFontOptions = ['Roboto Mono', 'Courier New', 'monospace'];
  const fontOptions = [
    'Roboto Mono',
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Impact',
  ];
  const positionOptions = [
    { value: 'top_left', label: 'Top Left' },
    { value: 'top_right', label: 'Top Right' },
    { value: 'bottom_left', label: 'Bottom Left' },
    { value: 'bottom_right', label: 'Bottom Right' },
  ];
  const timerPositionOptions = [
    { value: 'center', label: 'Center' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
  ];
  const displayLocationOptions = [
    { value: 'header', label: 'Header' },
    { value: 'footer', label: 'Footer' },
    { value: 'none', label: 'Hidden' },
  ];
  const progressStyleOptions = [
    { value: 'bottom_bar', label: 'Bottom Bar' },
    { value: 'top_bar', label: 'Top Bar' },
    { value: 'ring', label: 'Ring' },
    { value: 'hidden', label: 'Hidden' },
  ];

  // Build select options (new + existing)
  const displayOptions = [
    { value: 'new', label: '+ Create New Display' },
    ...displays.map((d) => ({ value: d.id.toString(), label: d.name || `Display ${d.id}` })),
  ];

  // Mock timer for preview (kept local)
  const mockTimer = {
    title: 'Sample Timer',
    speaker: 'John Doe',
    notes: '',
    show_title: true,
    show_speaker: true,
    show_notes: true,
    timer_type: 'countdown' as const,
    duration_seconds: 300,
    current_time_seconds: 180,
    is_active: false,
    is_paused: false,
    is_finished: false,
    is_stopped: false,
    warning_time: 90,
    critical_time: 30,
  };

  // Helper to update display state and mark dirty
  const updateDisplay = (key: string, value: any) => {
    setDisplay((prev: any) => {
      const next = { ...prev, [key]: value };
      return next;
    });
    unsavedRef.current = true;
    setHasUnsavedChanges(true);
  };

  // Reflect unsaved changes by comparing JSON (simple deep compare)
  useEffect(() => {
    const isDifferent = JSON.stringify(display) !== JSON.stringify(initialRef.current);
    unsavedRef.current = isDifferent;
    setHasUnsavedChanges(isDifferent);
  }, [display]);

  // Selection handler (select existing or create new/copy)
  const handleSelect = (value: string | null) => {
    if (!value) return;
    if (value === 'new') {
      // Create new copy if editing existing, else blank
      const base = initialDisplay ? { ...display } : { ...DEFAULT_DISPLAY };
      const { id, ...withoutId } = base;
      const newName = initialDisplay ? `${withoutId.name} (Copy)` : 'New Display';
      const newDisp = { ...withoutId, name: newName, is_default: false };
      setDisplay(newDisp);
      setSelectedDisplayId('new');
      setIsCreatingNew(true);
      initialRef.current = newDisp;
      setHasUnsavedChanges(false);
    } else {
      const selected = displays.find((d) => d.id.toString() === value);
      if (selected) {
        const withDefault = { ...selected, is_default: selected.id === defaultDisplayId };
        setDisplay(withDefault);
        setSelectedDisplayId(selected.id);
        setIsCreatingNew(false);
        initialRef.current = withDefault;
        setHasUnsavedChanges(false);
      }
    }
  };

  // File upload handler (read as dataURL)
  const handleFileUpload = (file: File | null, key: string) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateDisplay(key, reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Delete flow
  const handleDeleteDisplay = () => {
    if (!display.id || !onDelete) return;

    setDeleteError(null);
    // validate not last display
    if (displays.length <= 1) {
      setDeleteError('Cannot delete the last display. At least one display must exist.');
      return;
    }
    onDelete(display.id);
    // wait for lastSuccess/lastError from websocket context to close modal
  };

  // Watch websocket errors for delete modal
  useEffect(() => {
    if (lastError && deleteConfirmOpened) {
      if (lastError.includes('Cannot delete display')) {
        let errorMessage = lastError;
        if (lastError.includes('assigned to') && lastError.includes('timer')) {
          errorMessage =
            'Cannot delete display: it is being used by one or more timers. Please unassign it from these timers first.';
        }
        setDeleteError(errorMessage);
      }
    }
  }, [lastError, deleteConfirmOpened]);

  // Watch successes for delete modal
  useEffect(() => {
    if (lastSuccess && deleteConfirmOpened && lastSuccess.includes('deleted successfully')) {
      setDeleteConfirmOpened(false);
      setDeleteError(null);
      // close editor if provided
      if (onCancel) {
        // slight delay to allow UI to update
        setTimeout(() => onCancel(), 100);
      }
    }
  }, [lastSuccess, deleteConfirmOpened, onCancel]);

  // Save (Create or Update)
  const handleSave = () => {
    // remove client-side only props before save if necessary
    const { is_default, ...toSave } = display;
    onSave?.(toSave);
    if (display.is_default && display.id) {
      setDefaultDisplay?.(display.id);
    }
    initialRef.current = display;
    unsavedRef.current = false;
    setHasUnsavedChanges(false);
  };

  // Ctrl/Cmd + S to save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (hasUnsavedChanges) handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasUnsavedChanges, display]);

  // Listen for fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && fullscreenPreview) {
        setFullscreenPreview(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [fullscreenPreview]);

  // Small UI helpers
  const showPreviewFullscreen = () => setFullscreenPreview(true);

  // Top action bar component
  const TopBar = () => (
    <Group justify="space-between" align="center" mb="sm">
      <Group align="center" gap="sm">
        <Select
          data={displayOptions}
          value={selectedDisplayId?.toString()}
          onChange={handleSelect}
          size="sm"
          style={{ minWidth: 260 }}
          rightSection={<IconChevronDown size={16} />}
        />
        <TextInput
          value={display.name}
          onChange={(e) => updateDisplay('name', e.currentTarget.value)}
          placeholder="Display name"
          disabled={!isCreatingNew}
          size="sm"
          style={{ minWidth: 220 }}
          error={nameError || undefined}
        />
        <Checkbox
          label={
            <Group gap={6} align="center">
              <IconStar size={20} />
              <Text size="xs" fw={600}>
                Set as default
              </Text>
            </Group>
          }
          checked={display.is_default}
          onChange={(e) => updateDisplay('is_default', e.currentTarget.checked)}
          size="xs"
        />
        {/* {display.logo_image ? (
          <Avatar src={display.logo_image} alt="logo" size={28} radius="sm" />
        ) : (
          <Tooltip label="No logo uploaded">
            <Avatar radius="sm" size={28}>
              <IconPhoto size={14} />
            </Avatar>
          </Tooltip>
        )} */}
        {display.background_type === 'image' && display.background_image && (
          <Badge variant="outline" size="sm">
            Background
          </Badge>
        )}
      </Group>

      <Group gap="xs">
        <Text size="sm" c={hasUnsavedChanges ? 'orange' : 'teal'} fw={700}>
          {hasUnsavedChanges ? 'Unsaved changes' : ''}
        </Text>

        {/* <Tooltip label="Preview fullscreen">
          <ActionIcon variant="light" onClick={showPreviewFullscreen}>
            <IconMaximize size={18} />
          </ActionIcon>
        </Tooltip> */}

        {!isCreatingNew && onDelete && displays.length > 1 && (
          <Tooltip label="Delete this display">
            <ActionIcon
              color="red"
              variant="filled"
              onClick={() => {
                setDeleteConfirmOpened(true);
                setDeleteError(null);
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        )}

        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          size="sm"
          onClick={handleSave}
          disabled={!hasUnsavedChanges || (isCreatingNew && !display.name?.trim())}
        >
          {isCreatingNew ? 'Create' : 'Save'}
        </Button>

        {onCancel && (
          <Button variant="default" size="sm" onClick={onCancel}>
            Close
          </Button>
        )}
      </Group>
    </Group>
  );

  // Small card wrapper to keep consistent spacing
  const SectionCard: React.FC<{ title?: string; icon?: React.ReactNode; children?: React.ReactNode }> = ({
    title,
    icon,
    children,
  }) => (
    <Card shadow="sm" radius="md" p="sm" withBorder>
      {title && (
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            {icon}
            <Text fw={700} size="sm">
              {title}
            </Text>
          </Group>
        </Group>
      )}
      <Divider mb="sm" />
      {children}
    </Card>
  );

  return (
    <>
      <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Grid gutter={0} style={{ flex: 1, height: '100%' }}>
        {/* Left: Controls */}
        <Grid.Col span={{ base: 12, lg: 5 }} p={0} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <Box style={{ padding: theme.spacing.md }}>
            <Stack gap="md">
              <TopBar />

              <Tabs value={activeTab} onChange={(val) => setActiveTab(val)} variant="pills">

                <Tabs.List>
                  <Tabs.Tab value="layout" leftSection={<IconLayout size={16} />}>
                    Layout
                  </Tabs.Tab>
                  <Tabs.Tab value="branding" leftSection={<IconPhoto size={16} />}>
                    Branding
                  </Tabs.Tab>
                  <Tabs.Tab value="timer" leftSection={<IconClock size={16} />}>
                    Timer
                  </Tabs.Tab>
                  <Tabs.Tab value="content" leftSection={<IconTextSize size={16} />}>
                    Content
                  </Tabs.Tab>
                  <Tabs.Tab value="colors" leftSection={<IconPalette size={16} />}>
                    Colors
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="layout" pt="sm">
                  <SectionCard title="Dimensions & Background" icon={<IconLayout size={18} />}>
                    <Stack gap="sm">
                      <Select
                        label="Aspect ratio"
                        data={aspectRatioOptions}
                        value={display.display_ratio}
                        onChange={(v) => updateDisplay('display_ratio', v)}
                      />

                      <Select
                        label="Background type"
                        data={[
                          { value: 'color', label: 'Color' },
                          { value: 'image', label: 'Image' },
                          { value: 'transparent', label: 'Transparent' },
                        ]}
                        value={display.background_type}
                        onChange={(v) => updateDisplay('background_type', v)}
                      />

                      {display.background_type === 'color' && (
                        <ColorInput
                          label="Background color"
                          value={display.background_color}
                          onChange={(v) => updateDisplay('background_color', v)}
                          withEyeDropper
                        />
                      )}

                      {display.background_type === 'image' && (
                        <Stack gap="xs">
                          <FileInput
                            label="Background image"
                            placeholder="Upload background"
                            onChange={(f) => f && handleFileUpload(f, 'background_image')}
                            leftSection={<IconUpload size={14} />}
                          />
                          {display.background_image && (
                            <Group gap="xs">
                              <Badge variant="light">Image</Badge>
                              <ActionIcon size="sm" onClick={() => updateDisplay('background_image', null)}>
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                          )}
                        </Stack>
                      )}

                      <Select
                        label="Progress style"
                        data={progressStyleOptions}
                        value={display.progress_style}
                        onChange={(v) => updateDisplay('progress_style', v)}
                      />
                    </Stack>
                  </SectionCard>
                </Tabs.Panel>

                <Tabs.Panel value="branding" pt="sm">
                  <SectionCard title="Logo & Branding" icon={<IconPhoto size={18} />}>
                    <Stack gap="sm">
                      <FileInput
                        label="Logo image"
                        placeholder="Upload logo"
                        onChange={(f) => f && handleFileUpload(f, 'logo_image')}
                        leftSection={<IconUpload size={14} />}
                      />
                      {display.logo_image && (
                        <Group gap="xs">
                          <Badge variant="light">Logo</Badge>
                          <ActionIcon size="sm" onClick={() => updateDisplay('logo_image', null)}>
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      )}

                      <NumberInput
                        label="Logo size"
                        value={display.logo_size_percent}
                        onChange={(v) => updateDisplay('logo_size_percent', v)}
                        min={20}
                        max={500}
                        suffix="px"
                      />

                      <Select
                        label="Logo position"
                        data={positionOptions}
                        value={display.logo_position}
                        onChange={(v) => updateDisplay('logo_position', v)}
                      />
                    </Stack>
                  </SectionCard>
                </Tabs.Panel>

                <Tabs.Panel value="timer" pt="sm">
                  <SectionCard title="Timer & Clock" icon={<IconClock size={18} />}>
                    <Stack gap="sm">
                      <Select
                        label="Timer format"
                        data={[
                          { value: 'mm:ss', label: 'MM:SS' },
                          { value: 'hh:mm:ss', label: 'HH:MM:SS' },
                        ]}
                        value={display.timer_format}
                        onChange={(v) => updateDisplay('timer_format', v)}
                      />

                      <Select
                        label="Timer font"
                        data={monoFontOptions}
                        value={display.timer_font_family}
                        onChange={(v) => updateDisplay('timer_font_family', v)}
                      />

                      <NumberInput
                        label="Timer size"
                        value={display.timer_size_percent}
                        onChange={(v) => updateDisplay('timer_size_percent', v)}
                        min={50}
                        max={200}
                        suffix="%"
                      />

                      <Select
                        label="Timer position"
                        data={timerPositionOptions}
                        value={display.timer_position}
                        onChange={(v) => updateDisplay('timer_position', v)}
                      />

                      <Divider />

                      <Group justify="space-between" align="center">
                        <Text fw={700} size="sm">
                          Clock
                        </Text>
                        <Switch
                          checked={display.clock_visible}
                          onChange={(e) => updateDisplay('clock_visible', e.currentTarget.checked)}
                        />
                      </Group>

                      {display.clock_visible && (
                        <Select
                          label="Clock font"
                          data={monoFontOptions}
                          value={display.clock_font_family}
                          onChange={(v) => updateDisplay('clock_font_family', v)}
                        />
                      )}
                    </Stack>
                  </SectionCard>
                </Tabs.Panel>

                <Tabs.Panel value="content" pt="sm">
                  <SectionCard title="Content & Typography" icon={<IconTextSize size={18} />}>
                    <Stack gap="sm">
                      <Select
                        label="Title location"
                        data={displayLocationOptions}
                        value={display.title_display_location}
                        onChange={(v) => updateDisplay('title_display_location', v)}
                      />

                      <Select
                        label="Speaker location"
                        data={displayLocationOptions}
                        value={display.speaker_display_location}
                        onChange={(v) => updateDisplay('speaker_display_location', v)}
                      />

                      <Divider />

                      <Select
                        label="Header font"
                        data={fontOptions}
                        value={display.header_font_family}
                        onChange={(v) => updateDisplay('header_font_family', v)}
                      />

                      <Select
                        label="Footer font"
                        data={fontOptions}
                        value={display.footer_font_family}
                        onChange={(v) => updateDisplay('footer_font_family', v)}
                      />

                      <Select
                        label="Message font"
                        data={fontOptions}
                        value={display.message_font_family}
                        onChange={(v) => updateDisplay('message_font_family', v)}
                      />
                    </Stack>
                  </SectionCard>
                </Tabs.Panel>

                <Tabs.Panel value="colors" pt="sm">
                  <SectionCard title="Colors & Theme" icon={<IconPalette size={18} />}>
                    <Stack gap="sm">
                      <ColorInput
                        label="Timer color"
                        value={display.timer_color}
                        onChange={(v) => updateDisplay('timer_color', v)}
                        withEyeDropper
                      />
                      <ColorInput
                        label="Clock color"
                        value={display.clock_color}
                        onChange={(v) => updateDisplay('clock_color', v)}
                        withEyeDropper
                      />

                      <Divider />

                      <ColorInput
                        label="Header text color"
                        value={display.header_color}
                        onChange={(v) => updateDisplay('header_color', v)}
                        withEyeDropper
                      />
                      <ColorInput
                        label="Footer text color"
                        value={display.footer_color}
                        onChange={(v) => updateDisplay('footer_color', v)}
                        withEyeDropper
                      />
                      <ColorInput
                        label="Message color"
                        value={display.message_color}
                        onChange={(v) => updateDisplay('message_color', v)}
                        withEyeDropper
                      />

                      <Divider />

                      <Text fw={700} size="sm">
                        Progress colors
                      </Text>
                      <ColorInput
                        label="Normal"
                        value={display.progress_color_main}
                        onChange={(v) => updateDisplay('progress_color_main', v)}
                        withEyeDropper
                      />
                      <ColorInput
                        label="Warning"
                        value={display.progress_color_secondary}
                        onChange={(v) => updateDisplay('progress_color_secondary', v)}
                        withEyeDropper
                      />
                      <ColorInput
                        label="Critical"
                        value={display.progress_color_tertiary}
                        onChange={(v) => updateDisplay('progress_color_tertiary', v)}
                        withEyeDropper
                      />
                    </Stack>
                  </SectionCard>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Box>
        </Grid.Col>

        {/* Right: Live Preview */}
        <Grid.Col span={{ base: 12, lg: 7 }} p={0} style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <Box style={{ padding: theme.spacing.md, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Card withBorder={false} radius={0} p="sm" style={{ flex: 1, display: 'flex', flexDirection: 'column', border: `1px solid ${theme.colors.gray[3]}`, minHeight: 0 }}>
              <Group justify="space-between" align="center" mb="sm">
                <div>
                  {/* <Title order={3}>Live Preview</Title> */}
                  <Text size="xs" c="dimmed">
                    Preview updates instantly as you change settings. Some size updates are shown  correclty the in full screen preview.
                  </Text>
                </div>
                <Group>
                  {/* <Badge color="green" variant="dot">
                    Real-time
                  </Badge> */}
                  <Tooltip label="Toggle fullscreen preview">
                    <ActionIcon onClick={() => setFullscreenPreview(true)}>
                      <IconMaximize size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>

              <Divider mb="sm" />

              <Box style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, overflow: 'hidden' }}>
                <Box style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Box style={{ aspectRatio: display.display_ratio === '4:3' ? '4/3' : display.display_ratio === '21:9' ? '21/9' : display.display_ratio === '1:1' ? '1/1' : '16/9', width: '100%', maxHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TimerDisplay display={display} timer={mockTimer} />
                  </Box>
                </Box>
              </Box>
            </Card>
          </Box>
        </Grid.Col>
      </Grid>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteConfirmOpened}
        onClose={() => {
          setDeleteConfirmOpened(false);
          setDeleteError(null);
        }}
        title="Delete Display?"
        centered
        size="md"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete the display <strong>{display.name}</strong>? This action cannot be undone.
          </Text>

          {display.is_default && !deleteError && (
            <Text c="orange" fw={700}>
              Warning: this is your default display. You will need to set a new default after deletion.
            </Text>
          )}

          {deleteError && (
            <Card withBorder radius="sm" p="sm" style={{ borderColor: 'rgba(255, 107, 107, 0.3)' }}>
              <Group gap="sm">
                <IconAlertCircle color="var(--mantine-color-red-filled)" />
                <Text c="red" fw={700}>
                  {deleteError}
                </Text>
              </Group>
            </Card>
          )}

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                setDeleteConfirmOpened(false);
                setDeleteError(null);
              }}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteDisplay} disabled={!!deleteError && deleteError.includes('Cannot delete')}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Fullscreen Preview - using browser fullscreen API */}
      {fullscreenPreview && (
        <Box ref={(el) => {
          if (el && !document.fullscreenElement) {
            el.requestFullscreen?.().catch(err => {
              console.warn('Fullscreen request failed:', err);
              setFullscreenPreview(false);
            });
          }
        }} style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
          <Box style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
            <TimerDisplay display={display} timer={mockTimer} in_view_mode />
          </Box>
        </Box>
      )}
      </Box>
    </>
  );
}
