import React, { useEffect, useRef, useState } from 'react';
import {
  ActionIcon,
  Accordion,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  ColorInput,
  Divider,
  FileInput,
  Group,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  Slider,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
  rem,
  useMantineTheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconCheck,
  IconChevronLeft,
  IconClock,
  IconDeviceFloppy,
  IconLayout,
  IconMaximize,
  IconPalette,
  IconPhoto,
  IconTemplate,
  IconTextSize,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
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
  const isMobile = useMediaQuery('(max-width: 768px)');
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
  const [activeTab, setActiveTab] = useState<string>('layout');
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
  const monoFontOptions = ['Roboto Mono', 'Oswald', 'Courier New', 'monospace'];
  const fontOptions = [
    'Roboto Mono',
    'Oswald',
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

  // Animation variants
  const panelVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mantine-color-body)' }}>
      {/* Top Bar */}
      <Paper
        p="sm"
        radius={0}
        style={{
          borderBottom: `1px solid ${theme.colors.gray[3]}`,
          zIndex: 10,
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="sm">
            {onCancel && (
              <ActionIcon variant="subtle" color="gray" onClick={onCancel}>
                <IconChevronLeft size={20} />
              </ActionIcon>
            )}
            <Stack gap={0}>
              {!isMobile && (
                <Text size="xs" c="dimmed" fw={500} tt="uppercase">
                  Editing Display
                </Text>
              )}
              <Group gap="xs">
                <TextInput
                  variant="unstyled"
                  size="sm"
                  value={display.name}
                  onChange={(e) => updateDisplay('name', e.currentTarget.value)}
                  placeholder="Display Name"
                  styles={{ input: { fontWeight: 600, fontSize: rem(16), height: 'auto', padding: 0 } }}
                  error={nameError}
                />
                {hasUnsavedChanges && (
                  <Badge color="orange" variant="dot" size="xs">
                    Unsaved
                  </Badge>
                )}
              </Group>
            </Stack>
          </Group>

          <Group gap="sm">
            <Select
              data={displayOptions}
              value={selectedDisplayId?.toString()}
              onChange={handleSelect}
              size="xs"
              placeholder="Switch Display"
              style={{ width: isMobile ? 130 : 200 }}
              leftSection={<IconTemplate size={14} />}
            />
            <Divider orientation="vertical" />
            <Group gap="xs">
              <Switch
                label={isMobile ? undefined : "Default"}
                checked={display.is_default}
                onChange={(e) => updateDisplay('is_default', e.currentTarget.checked)}
                size="xs"
              />
            </Group>
            <Divider orientation="vertical" />
            <Group gap="xs">
              {!isCreatingNew && onDelete && displays.length > 1 && (
                <Tooltip label="Delete Display" withArrow>
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => {
                      setDeleteConfirmOpened(true);
                      setDeleteError(null);
                    }}
                    disabled={!features.canSaveDisplay().isAvailable}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Tooltip>
              )}
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                size="xs"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || (isCreatingNew && !display.name?.trim()) || !features.canSaveDisplay().isAvailable}
              >
                {isCreatingNew ? 'Create' : (isMobile ? 'Save' : 'Save Changes')}
              </Button>
            </Group>
          </Group>
        </Group>
      </Paper>

      <Box style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', overflow: 'hidden' }}>
        {/* Left Editor Panel */}
        <Paper
          radius={0}
          style={{
            width: isMobile ? '100%' : 400,
            height: isMobile ? '50%' : '100%',
            borderRight: isMobile ? 'none' : `1px solid ${theme.colors.gray[3]}`,
            borderTop: isMobile ? `1px solid ${theme.colors.gray[3]}` : 'none',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 5,
          }}
        >
          <Box p="md" pb="xs">
            <SegmentedControl
              fullWidth
              value={activeTab}
              onChange={setActiveTab}
              data={[
                {
                  value: 'layout',
                  label: (
                    <Group gap={6} justify="center">
                      <IconLayout size={16} />
                      <Text inherit>Layout</Text>
                    </Group>
                  ),
                },
                {
                  value: 'style',
                  label: (
                    <Group gap={6} justify="center">
                      <IconPalette size={16} />
                      <Text inherit>Style</Text>
                    </Group>
                  ),
                },
                {
                  value: 'content',
                  label: (
                    <Group gap={6} justify="center">
                      <IconTextSize size={16} />
                      <Text inherit>Content</Text>
                    </Group>
                  ),
                },
              ]}
            />
          </Box>

          <ScrollArea style={{ flex: 1 }}>
            <Box p="md">
              {!features.canCustomizeDisplay().isAvailable && (
                <Box mb="md">
                  <UpgradeCta
                    current={0}
                    limit={0}
                    message={features.canCustomizeDisplay().reason}
                  />
                </Box>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial="hidden"
                  animate="visible"
                  variants={panelVariants}
                >
                  {activeTab === 'layout' && (
                    <Stack gap="md">
                      <Accordion variant="separated" defaultValue="general">
                        <Accordion.Item value="general">
                          <Accordion.Control icon={<IconLayout size={18} />}>General Layout</Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap="sm">
                              <Select
                                label="Aspect Ratio"
                                description="Target screen ratio"
                                data={aspectRatioOptions}
                                value={display.display_ratio}
                                onChange={(v) => updateDisplay('display_ratio', v)}
                              />
                              <Select
                                label="Progress Bar Style"
                                data={progressStyleOptions}
                                value={display.progress_style}
                                onChange={(v) => updateDisplay('progress_style', v)}
                              />
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="background">
                          <Accordion.Control icon={<IconPhoto size={18} />}>Background</Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap="sm">
                              <Select
                                label="Type"
                                data={[
                                  { value: 'color', label: 'Solid Color' },
                                  { value: 'image', label: 'Image' },
                                  { value: 'transparent', label: 'Transparent' },
                                ]}
                                value={display.background_type}
                                onChange={(v) => updateDisplay('background_type', v)}
                              />
                              {display.background_type === 'color' && (
                                <ColorInput
                                  label="Color"
                                  value={display.background_color}
                                  onChange={(v) => updateDisplay('background_color', v)}
                                  format="hex"
                                  swatches={['#000000', '#ffffff', '#1a1b1e', '#25262b', '#2C2E33']}
                                />
                              )}
                              {display.background_type === 'image' && (
                                <FileInput
                                  label="Upload Image"
                                  placeholder="Choose file"
                                  accept="image/*"
                                  leftSection={<IconPhoto size={14} />}
                                  onChange={(f) => f && handleFileUpload(f, 'background_image')}
                                />
                              )}
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    </Stack>
                  )}

                  {activeTab === 'style' && (
                    <Stack gap="md">
                      <Accordion variant="separated" defaultValue="timer">
                        <Accordion.Item value="timer">
                          <Accordion.Control icon={<IconClock size={18} />}>Timer Appearance</Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap="sm">
                              <Select
                                label="Font Family"
                                data={monoFontOptions}
                                value={display.timer_font_family}
                                onChange={(v) => updateDisplay('timer_font_family', v)}
                                renderOption={({ option }) => (
                                  <Text style={{ fontFamily: option.value }}>{option.label}</Text>
                                )}
                              />
                              <ColorInput
                                label="Color"
                                value={display.timer_color}
                                onChange={(v) => updateDisplay('timer_color', v)}
                              />
                              <Box>
                                <Text size="sm" fw={500} mb={4}>Size Scale</Text>
                                <Slider
                                  value={display.timer_size_percent}
                                  onChange={(v) => updateDisplay('timer_size_percent', v)}
                                  min={50}
                                  max={200}
                                  step={5}
                                  marks={[
                                    { value: 100, label: '100%' },
                                  ]}
                                />
                              </Box>
                              <Select
                                label="Format"
                                data={[
                                  { value: 'mm:ss', label: 'MM:SS' },
                                  { value: 'hh:mm:ss', label: 'HH:MM:SS' },
                                ]}
                                value={display.timer_format}
                                onChange={(v) => updateDisplay('timer_format', v)}
                              />
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="colors">
                          <Accordion.Control icon={<IconPalette size={18} />}>Theme Colors</Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap="sm">
                              <ColorInput label="Header Text" value={display.header_color} onChange={(v) => updateDisplay('header_color', v)} />
                              <ColorInput label="Footer Text" value={display.footer_color} onChange={(v) => updateDisplay('footer_color', v)} />
                              <ColorInput label="Message Text" value={display.message_color} onChange={(v) => updateDisplay('message_color', v)} />
                              <Divider label="Progress Bar" labelPosition="center" />
                              <ColorInput label="Main Color" value={display.progress_color_main} onChange={(v) => updateDisplay('progress_color_main', v)} />
                              <ColorInput label="Warning Color" value={display.progress_color_secondary} onChange={(v) => updateDisplay('progress_color_secondary', v)} />
                              <ColorInput label="Critical Color" value={display.progress_color_tertiary} onChange={(v) => updateDisplay('progress_color_tertiary', v)} />
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="branding">
                          <Accordion.Control icon={<IconPhoto size={18} />}>Branding</Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap="sm">
                              <FileInput
                                label="Logo Image"
                                placeholder="Upload logo"
                                accept="image/*"
                                onChange={(f) => f && handleFileUpload(f, 'logo_image')}
                                clearable
                              />
                              <Box>
                                <Text size="sm" fw={500} mb={4}>Logo Size</Text>
                                <Slider
                                  value={display.logo_size_percent}
                                  onChange={(v) => updateDisplay('logo_size_percent', v)}
                                  min={10}
                                  max={100}
                                  step={5}
                                />
                              </Box>
                              <Select
                                label="Position"
                                data={positionOptions}
                                value={display.logo_position}
                                onChange={(v) => updateDisplay('logo_position', v)}
                              />
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    </Stack>
                  )}

                  {activeTab === 'content' && (
                    <Stack gap="md">
                      <Accordion variant="separated" defaultValue="typography">
                        <Accordion.Item value="typography">
                          <Accordion.Control icon={<IconTextSize size={18} />}>Typography</Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap="sm">
                              <Select
                                label="Header Font"
                                data={fontOptions}
                                value={display.header_font_family}
                                onChange={(v) => updateDisplay('header_font_family', v)}
                              />
                              <Select
                                label="Footer Font"
                                data={fontOptions}
                                value={display.footer_font_family}
                                onChange={(v) => updateDisplay('footer_font_family', v)}
                              />
                              <Select
                                label="Message Font"
                                data={fontOptions}
                                value={display.message_font_family}
                                onChange={(v) => updateDisplay('message_font_family', v)}
                              />
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="layout">
                          <Accordion.Control icon={<IconLayout size={18} />}>Content Layout</Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap="sm">
                              <Select
                                label="Title Position"
                                data={displayLocationOptions}
                                value={display.title_display_location}
                                onChange={(v) => updateDisplay('title_display_location', v)}
                              />
                              <Select
                                label="Speaker Position"
                                data={displayLocationOptions}
                                value={display.speaker_display_location}
                                onChange={(v) => updateDisplay('speaker_display_location', v)}
                              />
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="clock">
                          <Accordion.Control icon={<IconClock size={18} />}>Clock Widget</Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap="sm">
                              <Switch
                                label="Show Clock"
                                checked={display.clock_visible}
                                onChange={(e) => updateDisplay('clock_visible', e.currentTarget.checked)}
                              />
                              {display.clock_visible && (
                                <>
                                  <Select
                                    label="Font"
                                    data={monoFontOptions}
                                    value={display.clock_font_family}
                                    onChange={(v) => updateDisplay('clock_font_family', v)}
                                  />
                                  <ColorInput
                                    label="Color"
                                    value={display.clock_color}
                                    onChange={(v) => updateDisplay('clock_color', v)}
                                  />
                                </>
                              )}
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    </Stack>
                  )}
                </motion.div>
              </AnimatePresence>
            </Box>
          </ScrollArea>
        </Paper>

        {/* Right Preview Panel */}
        <Box
          style={{
            flex: 1,
            backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
            backgroundImage: `radial-gradient(${colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2]} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? theme.spacing.md : theme.spacing.xl,
            position: 'relative',
            overflow: 'hidden',
            height: isMobile ? '50%' : '100%',
          }}
        >
          <Paper
            shadow="xl"
            radius="md"
            style={{
              width: '100%',
              maxWidth: '90%',
              aspectRatio: display.display_ratio.replace(':', '/'),
              backgroundColor: '#000',
              position: 'relative',
              overflow: 'hidden',
              border: `1px solid ${theme.colors.gray[7]}`,
            }}
          >
            <TimerDisplay
              display={display}
              timer={mockTimer}
            />
          </Paper>

          <ActionIcon
            variant="filled"
            color="dark"
            size="lg"
            radius="xl"
            style={{
              position: 'absolute',
              bottom: theme.spacing.xl,
              right: theme.spacing.xl,
              zIndex: 20,
            }}
            onClick={() => setFullscreenPreview(true)}
          >
            <IconMaximize size={20} />
          </ActionIcon>
        </Box>
      </Box>

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
            <IconX size={20} />
          </ActionIcon>
        </Box>
      </Modal>
    </Box>
  );
}
