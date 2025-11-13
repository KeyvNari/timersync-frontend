import React, { useEffect, useRef, useState } from 'react';
import {
  ActionIcon,
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
  Tooltip,
  useMantineTheme,
  useMantineColorScheme,
  ScrollArea,
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
  IconMaximize,
} from '@tabler/icons-react';
import TimerDisplay from '@/components/timer-display';
import { useWebSocketContext } from '@/providers/websocket-provider';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { UpgradeCta } from '@/components/timer-panel/upgrade-cta';


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
  const { colorScheme } = useMantineColorScheme();
  const { setDefaultDisplay, lastError, lastSuccess } = useWebSocketContext();
  const features = useFeatureAccess();

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
  };

  // Helper to update display state and mark dirty
  const updateDisplay = (key: string, value: any) => {
    setDisplay((prev: any) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Reflect unsaved changes by comparing JSON (simple deep compare)
  useEffect(() => {
    setHasUnsavedChanges(
      JSON.stringify(display) !== JSON.stringify(initialRef.current)
    );
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
    const { is_default, ...toSave } = display;
    onSave?.(toSave);
    if (display.is_default && display.id) setDefaultDisplay?.(display.id);
    initialRef.current = display;
    setHasUnsavedChanges(false);
  };

  // Ctrl/Cmd + S to save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
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

  const SectionCard = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <Card withBorder radius="md" p="sm" bg="var(--mantine-color-body)">
      <Group mb="xs" gap="xs">
        {icon}
        <Text fw={600} size="sm">
          {title}
        </Text>
      </Group>
      <Divider mb="sm" />
      {children}
    </Card>
  );

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Group justify="space-between" align="center" p="sm" style={{ borderBottom: `1px solid ${theme.colors.gray[3]}` }}>
        <Group gap="sm">
          <Select
            data={displayOptions}
            value={selectedDisplayId?.toString()}
            onChange={handleSelect}
            size="sm"
            style={{ minWidth: 220 }}
          />
          <TextInput
            value={display.name}
            onChange={(e) => updateDisplay('name', e.currentTarget.value)}
            placeholder="Display name"
            size="sm"
            style={{ minWidth: 200 }}
            error={nameError || undefined}
          />
          <Checkbox
            label="Default"
            checked={display.is_default}
            onChange={(e) =>
              updateDisplay('is_default', e.currentTarget.checked)
            }
            size="xs"
          />
          {hasUnsavedChanges && (
            <Badge color="orange" variant="light" size="sm">
              Unsaved
            </Badge>
          )}
        </Group>
        <Group gap="xs">
          {!isCreatingNew && onDelete && displays.length > 1 && (
            <Tooltip label="Delete this display">
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => {
                  setDeleteConfirmOpened(true);
                  setDeleteError(null);
                }}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label={!features.canSaveDisplay().isAvailable ? features.canSaveDisplay().reason : undefined} position="top" withArrow disabled={features.canSaveDisplay().isAvailable}>
            <div>
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                size="sm"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || (isCreatingNew && !display.name?.trim()) || !features.canSaveDisplay().isAvailable}
              >
                {isCreatingNew ? 'Create' : 'Save'}
              </Button>
            </div>
          </Tooltip>
          {onCancel && (
            <Button variant="default" size="sm" onClick={onCancel}>
              Close
            </Button>
          )}
        </Group>
      </Group>

      <Grid gutter="xs" style={{ flex: 1, overflow: 'hidden' }}>
        {/* Left controls */}
        <Grid.Col
          span={{ base: 12, lg: 5 }}
          style={{
            height: '100%',
            borderRight: `1px solid ${theme.colors.gray[3]}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ScrollArea style={{ flex: 1 }}>
            <Box p="md">
              {!features.canCustomizeDisplay().isAvailable && (
                <UpgradeCta
                  current={0}
                  limit={0}
                  message={features.canCustomizeDisplay().reason}
                />
              )}

              <Tabs
                value={activeTab}
                onChange={setActiveTab}
                variant="outline"
                radius="md"
              >
                <Tabs.List grow>
                  <Tabs.Tab value="layout" leftSection={<IconLayout size={14} />}>
                    Layout
                  </Tabs.Tab>
                  <Tabs.Tab value="branding" leftSection={<IconPhoto size={14} />}>
                    Branding
                  </Tabs.Tab>
                  <Tabs.Tab value="timer" leftSection={<IconClock size={14} />}>
                    Timer
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="content"
                    leftSection={<IconTextSize size={14} />}
                  >
                    Content
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="colors"
                    leftSection={<IconPalette size={14} />}
                  >
                    Colors
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="layout" pt="sm">
                  <SectionCard title="Layout" icon={<IconLayout size={16} />}>
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
                          onChange={(v) =>
                            updateDisplay('background_color', v)
                          }
                        />
                      )}
                      {display.background_type === 'image' && (
                        <FileInput
                          label="Background image"
                          placeholder="Upload"
                          onChange={(f) =>
                            f && handleFileUpload(f, 'background_image')
                          }
                        />
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
                  <SectionCard
                    title="Branding"
                    icon={<IconPhoto size={16} />}
                  >
                    <Stack gap="sm">
                      <FileInput
                        label="Logo"
                        placeholder="Upload logo"
                        onChange={(f) =>
                          f && handleFileUpload(f, 'logo_image')
                        }
                      />
                      <NumberInput
                        label="Logo size %"
                        value={display.logo_size_percent}
                        onChange={(v) =>
                          updateDisplay('logo_size_percent', v)
                        }
                      />
                      <Select
                        label="Logo position"
                        data={positionOptions}
                        value={display.logo_position}
                        onChange={(v) =>
                          updateDisplay('logo_position', v)
                        }
                      />
                    </Stack>
                  </SectionCard>
                </Tabs.Panel>

                <Tabs.Panel value="timer" pt="sm">
                  <SectionCard title="Timer" icon={<IconClock size={16} />}>
                    <Stack gap="sm">
                      <Select
                        label="Format"
                        data={[
                          { value: 'mm:ss', label: 'MM:SS' },
                          { value: 'hh:mm:ss', label: 'HH:MM:SS' },
                        ]}
                        value={display.timer_format}
                        onChange={(v) => updateDisplay('timer_format', v)}
                      />
                      <Select
                        label="Font"
                        data={monoFontOptions}
                        value={display.timer_font_family}
                        onChange={(v) =>
                          updateDisplay('timer_font_family', v)
                        }
                      />
                      <NumberInput
                        label="Size %"
                        value={display.timer_size_percent}
                        onChange={(v) =>
                          updateDisplay('timer_size_percent', v)
                        }
                      />
                      <Select
                        label="Position"
                        data={timerPositionOptions}
                        value={display.timer_position}
                        onChange={(v) =>
                          updateDisplay('timer_position', v)
                        }
                      />
                      <Divider />
                      <Group justify="space-between">
                        <Text size="sm" fw={600}>
                          Show clock
                        </Text>
                        <Switch
                          checked={display.clock_visible}
                          onChange={(e) =>
                            updateDisplay(
                              'clock_visible',
                              e.currentTarget.checked
                            )
                          }
                        />
                      </Group>
                      {display.clock_visible && (
                        <Select
                          label="Clock font"
                          data={monoFontOptions}
                          value={display.clock_font_family}
                          onChange={(v) =>
                            updateDisplay('clock_font_family', v)
                          }
                        />
                      )}
                    </Stack>
                  </SectionCard>
                </Tabs.Panel>

                <Tabs.Panel value="content" pt="sm">
                  <SectionCard
                    title="Typography & Content"
                    icon={<IconTextSize size={16} />}
                  >
                    <Stack gap="sm">
                      <Select
                        label="Title location"
                        data={displayLocationOptions}
                        value={display.title_display_location}
                        onChange={(v) =>
                          updateDisplay('title_display_location', v)
                        }
                      />
                      <Select
                        label="Speaker location"
                        data={displayLocationOptions}
                        value={display.speaker_display_location}
                        onChange={(v) =>
                          updateDisplay('speaker_display_location', v)
                        }
                      />
                      <Divider />
                      <Select
                        label="Header font"
                        data={fontOptions}
                        value={display.header_font_family}
                        onChange={(v) =>
                          updateDisplay('header_font_family', v)
                        }
                      />
                      <Select
                        label="Footer font"
                        data={fontOptions}
                        value={display.footer_font_family}
                        onChange={(v) =>
                          updateDisplay('footer_font_family', v)
                        }
                      />
                      <Select
                        label="Message font"
                        data={fontOptions}
                        value={display.message_font_family}
                        onChange={(v) =>
                          updateDisplay('message_font_family', v)
                        }
                      />
                    </Stack>
                  </SectionCard>
                </Tabs.Panel>

                <Tabs.Panel value="colors" pt="sm">
                  <SectionCard title="Colors" icon={<IconPalette size={16} />}>
                    <Stack gap="sm">
                      <ColorInput
                        label="Timer"
                        value={display.timer_color}
                        onChange={(v) => updateDisplay('timer_color', v)}
                      />
                      <ColorInput
                        label="Clock"
                        value={display.clock_color}
                        onChange={(v) => updateDisplay('clock_color', v)}
                      />
                      <ColorInput
                        label="Header"
                        value={display.header_color}
                        onChange={(v) => updateDisplay('header_color', v)}
                      />
                      <ColorInput
                        label="Footer"
                        value={display.footer_color}
                        onChange={(v) => updateDisplay('footer_color', v)}
                      />
                      <ColorInput
                        label="Message"
                        value={display.message_color}
                        onChange={(v) => updateDisplay('message_color', v)}
                      />
                      <Divider />
                      <ColorInput
                        label="Progress main"
                        value={display.progress_color_main}
                        onChange={(v) =>
                          updateDisplay('progress_color_main', v)
                        }
                      />
                      <ColorInput
                        label="Progress secondary"
                        value={display.progress_color_secondary}
                        onChange={(v) =>
                          updateDisplay('progress_color_secondary', v)
                        }
                      />
                      <ColorInput
                        label="Progress tertiary"
                        value={display.progress_color_tertiary}
                        onChange={(v) =>
                          updateDisplay('progress_color_tertiary', v)
                        }
                      />
                    </Stack>
                  </SectionCard>
                </Tabs.Panel>
              </Tabs>
            </Box>
          </ScrollArea>
        </Grid.Col>

        {/* Preview */}
        <Grid.Col
          span={{ base: 12, lg: 7 }}
          style={{
            background: colorScheme === 'dark'
              ? theme.colors.dark[7]
              : theme.colors.gray[1],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.md,
            position: 'relative',
          }}
        >
          <Card
            withBorder
            radius="md"
            style={{
              width: '100%',
              maxWidth: '90%',
              aspectRatio: display.display_ratio.replace(':', '/'),
              backgroundColor: '#000',
              position: 'relative',
              padding: 0,
            }}
          >
            <Box style={{ width: '100%', height: '100%' }}>
              <TimerDisplay
                display={display}
                timer={mockTimer}
              />
            </Box>
            <ActionIcon
              variant="light"
              radius="xl"
              color="gray"
              style={{
                position: 'absolute',
                top: theme.spacing.xs,
                right: theme.spacing.xs,
              }}
              onClick={() => setFullscreenPreview(true)}
            >
              <IconMaximize size={16} />
            </ActionIcon>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Delete confirm modal */}
      <Modal
        opened={deleteConfirmOpened}
        onClose={() => setDeleteConfirmOpened(false)}
        title="Confirm delete"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete <b>{display.name}</b>?
          </Text>
          {deleteError && (
            <Text c="red" size="sm">
              {deleteError}
            </Text>
          )}
          <Group justify="end">
            <Button
              variant="default"
              onClick={() => setDeleteConfirmOpened(false)}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteDisplay}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Fullscreen preview */}
      <Modal
        fullScreen
        opened={fullscreenPreview}
        onClose={() => setFullscreenPreview(false)}
        withCloseButton={false}
        styles={{
          content: { background: '#000', padding: 0 },
          body: { background: '#000', padding: 0, height: '100%' },
        }}
      >
        <Box
          style={{
            background: '#000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Box style={{ width: '90%', height: '90%' }}>
            <TimerDisplay
              display={display}
              timer={mockTimer}
            />
          </Box>
          <ActionIcon
            variant="filled"
            color="gray"
            radius="xl"
            size="lg"
            style={{
              position: 'absolute',
              top: theme.spacing.md,
              right: theme.spacing.md,
            }}
            onClick={() => setFullscreenPreview(false)}
          >
            ✕
          </ActionIcon>
        </Box>
      </Modal>
    </Box>
  );
}
