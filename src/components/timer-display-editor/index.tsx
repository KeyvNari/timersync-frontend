import { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Title,
  Accordion,
  Stack,
  Group,
  TextInput,
  Select,
  ColorInput,
  NumberInput,
  Switch,
  Checkbox,
  FileInput,
  Button,
  Divider,
  Grid,
  Text,
  ActionIcon,
  Badge,
  Modal,
  Tooltip,
  Alert,
  Box,
} from '@mantine/core';
import {
  IconUpload,
  IconPhoto,
  IconPalette,
  IconTypography,
  IconLayout,
  IconDeviceFloppy,
  IconX,
  IconClock,
  IconTextSize,
  IconSparkles,
  IconStar,
  IconTrash,
  IconAlertCircle,
  IconChevronDown,
  IconMaximize,
} from '@tabler/icons-react';
import TimerDisplay from '@/components/timer-display';
import { useWebSocketContext } from '@/providers/websocket-provider';

// Main Editor Component
interface TimerDisplayEditorProps {
  initialDisplay?: any;
  displays?: any[];
  onSave?: (display: any) => void;
  onCancel?: () => void;
  onDelete?: (displayId: number) => void;
  nameError?: string | null;
  defaultDisplayId?: number | null;
}

export default function TimerDisplayEditor({
  initialDisplay,
  displays = [],
  onSave,
  onCancel,
  onDelete,
  nameError,
  defaultDisplayId
}: TimerDisplayEditorProps) {
  const { setDefaultDisplay, lastError, lastSuccess } = useWebSocketContext();

  const defaultDisplay = {
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

  const initialDisplayWithIsDefault = initialDisplay ? {
    ...initialDisplay,
    is_default: initialDisplay.id === defaultDisplayId
  } : { ...defaultDisplay, is_default: false };

  const [display, setDisplay] = useState(initialDisplayWithIsDefault);
  const [selectedDisplayId, setSelectedDisplayId] = useState<string | number>(initialDisplay?.id || 'new');
  const [isCreatingNew, setIsCreatingNew] = useState(!initialDisplay?.id);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const initialDisplayRef = useRef(initialDisplayWithIsDefault);

  const handleDisplaySelection = (value: string | null) => {
    if (!value) return;

    if (value === 'new') {
      const baseDisplay = initialDisplay ? { ...display } : { ...defaultDisplay };
      delete baseDisplay.id;
      const newDisplayName = initialDisplay ? `${baseDisplay.name} (Copy)` : 'New Display';
      const newDisplay = { ...baseDisplay, name: newDisplayName };
      setDisplay(newDisplay);
      setSelectedDisplayId('new');
      setIsCreatingNew(true);
      initialDisplayRef.current = newDisplay;
      setHasUnsavedChanges(false);
    } else {
      const selectedDisplay = displays.find(d => d.id.toString() === value);
      if (selectedDisplay) {
        const displayWithDefault = {
          ...selectedDisplay,
          is_default: selectedDisplay.id === defaultDisplayId
        };
        setDisplay(displayWithDefault);
        setSelectedDisplayId(selectedDisplay.id);
        setIsCreatingNew(false);
        initialDisplayRef.current = displayWithDefault;
        setHasUnsavedChanges(false);
      }
    }
  };

  const displayOptions = [
    { value: 'new', label: '+ Create New Display' },
    ...displays.map(display => ({
      value: display.id.toString(),
      label: display.name || `Display ${display.id}`
    }))
  ];

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
    is_active: true,
    is_paused: false,
    is_finished: false,
    is_stopped: false,
    warning_time: 90,
    critical_time: 30,
  };

  const updateDisplay = (key: string, value: any) => {
    setDisplay((prev: any) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(display) !== JSON.stringify(initialDisplayRef.current);
    setHasUnsavedChanges(hasChanges);
  }, [display]);

  // Watch for errors from WebSocket and capture display deletion errors
  useEffect(() => {
    if (lastError && deleteConfirmOpened) {
      // Check if it's a display-related error
      if (lastError.includes('Cannot delete display')) {
        // Simplify the error message for timer assignments
        let errorMessage = lastError;
        if (lastError.includes('assigned to') && lastError.includes('timer')) {
          errorMessage = 'Cannot delete display: it is being used by one or more timers. Please unassign it from these timers first.';
        }
        setDeleteError(errorMessage);
      }
    }
  }, [lastError, deleteConfirmOpened]);

  // Watch for successful deletion and close modal/editor
  useEffect(() => {
    if (lastSuccess && deleteConfirmOpened && lastSuccess.includes('deleted successfully')) {
      // Close the confirmation modal
      setDeleteConfirmOpened(false);
      setDeleteError(null);

      // Close the editor after successful deletion
      if (onCancel) {
        setTimeout(() => {
          onCancel();
        }, 100);
      }
    }
  }, [lastSuccess, deleteConfirmOpened, onCancel]);

  const handleDeleteDisplay = () => {
    if (!display.id || !onDelete) return;

    // Clear any previous error
    setDeleteError(null);

    // Validate that we're not deleting the last display
    if (displays.length <= 1) {
      setDeleteError('Cannot delete the last display. At least one display must exist.');
      return;
    }

    // Call the delete callback
    onDelete(display.id);

    // Note: We don't close the modal here anymore - we wait for success or error
    // If successful, the display will be removed from the list and the editor will close
    // If error, the error message will be shown in the modal
  };

  const handleFileUpload = (file: File, key: string) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateDisplay(key, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const monoFontOptions = [
    'Roboto Mono',
    'Courier New',
    'monospace',
  ];

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

  const aspectRatioOptions = [
    { value: '16:9', label: '16:9 (Widescreen)' },
    { value: '4:3', label: '4:3 (Standard)' },
    { value: '21:9', label: '21:9 (Ultrawide)' },
    { value: '1:1', label: '1:1 (Square)' },
  ];

  return (
    <Grid gutter="lg">
      <Grid.Col span={{ base: 12, lg: 5 }}>
        <Paper withBorder p="xl" radius="md" style={{ height: '100%', overflow: 'auto' }}>
          <Stack gap="lg">
            <div>
              <Group justify="space-between" mb="xs">
                <Title order={2}>Display Settings</Title>
                {isCreatingNew && <Badge color="blue" variant="light">New</Badge>}
              </Group>
              <Text size="sm" c="dimmed">
                Configure your timer display appearance and behavior
              </Text>
            </div>
            
            <Select
              label="Display Configuration"
              description="Select an existing display to edit or create a new one"
              placeholder="Choose a display"
              data={displayOptions}
              value={selectedDisplayId.toString()}
              onChange={handleDisplaySelection}
              searchable
              clearable={false}
              size="md"
            />

            <TextInput
              label="Display Name"
              description={isCreatingNew ? "Give your display a unique name" : "Display name (read-only)"}
              value={display.name}
              onChange={(e) => updateDisplay('name', e.currentTarget.value)}
              disabled={!isCreatingNew}
              error={nameError}
              size="md"
            />

            <Checkbox
              label={
                <Group gap="xs">
                  <IconStar size={20} style={{ color: 'var(--mantine-color-yellow-filled)' }} />
                  <Text fw={500}>Set as default display</Text>
                </Group>
              }
              description="Use this display configuration as the default for new timers"
              checked={display.is_default}
              onChange={(e) => updateDisplay('is_default', e.currentTarget.checked)}
              size="md"
            />

            {hasUnsavedChanges && (
              <Alert icon={<IconAlertCircle size={16} />} color="yellow" variant="light" radius="md">
                <Text size="sm" fw={500}>You have unsaved changes</Text>
              </Alert>
            )}

            <Accordion variant="separated" defaultValue="layout" chevronPosition="right" radius="md">
              {/* Layout & Background Section */}
              <Accordion.Item value="layout">
                <Accordion.Control icon={<IconLayout size={20} />}>
                  <Text fw={600}>Layout & Background</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="lg">
                    <Stack gap="sm">
                      <Text fw={600} size="sm">Display Dimensions</Text>
                      <Text size="xs" c="dimmed">
                        Choose the aspect ratio for your timer display
                      </Text>
                      <Select
                        label="Aspect Ratio"
                        data={aspectRatioOptions}
                        value={display.display_ratio}
                        onChange={(value) => updateDisplay('display_ratio', value)}
                      />
                    </Stack>

                    <Divider />

                    <Stack gap="sm">
                      <Text fw={600} size="sm">Background</Text>
                      <Text size="xs" c="dimmed">
                        Set the background style for your display
                      </Text>

                      <Select
                        label="Background Type"
                        data={[
                          { value: 'color', label: 'Solid Color' },
                          { value: 'image', label: 'Image' },
                          { value: 'transparent', label: 'Transparent' },
                        ]}
                        value={display.background_type}
                        onChange={(value) => updateDisplay('background_type', value)}
                      />

                      {display.background_type === 'color' && (
                        <ColorInput
                          label="Background Color"
                          value={display.background_color}
                          onChange={(value) => updateDisplay('background_color', value)}
                          withEyeDropper={false}
                          swatches={['#000000', '#1a1b1e', '#2C2E33', '#25262B', '#ffffff']}
                        />
                      )}

                      {display.background_type === 'image' && (
                        <Stack gap="xs">
                          <FileInput
                            label="Background Image"
                            placeholder="Click to upload image"
                            leftSection={<IconUpload size={16} />}
                            onChange={(file) => file && handleFileUpload(file, 'background_image')}
                          />
                          {display.background_image && (
                            <Group gap="xs" p="xs" style={{ background: 'var(--mantine-color-green-light)', borderRadius: '4px' }}>
                              <Text size="xs" c="green" fw={500}>✓ Image uploaded</Text>
                              <ActionIcon
                                size="sm"
                                color="red"
                                variant="subtle"
                                onClick={() => updateDisplay('background_image', null)}
                              >
                                <IconX size={14} />
                              </ActionIcon>
                            </Group>
                          )}
                        </Stack>
                      )}
                    </Stack>

                    <Divider />

                    <Stack gap="sm">
                      <Text fw={600} size="sm">Progress Indicator</Text>
                      <Text size="xs" c="dimmed">
                        Visual indicator showing timer progress
                      </Text>
                      <Select
                        label="Progress Style"
                        data={progressStyleOptions}
                        value={display.progress_style}
                        onChange={(value) => updateDisplay('progress_style', value)}
                      />
                    </Stack>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              {/* Branding Section */}
              <Accordion.Item value="branding">
                <Accordion.Control icon={<IconPhoto size={20} />}>
                  <Text fw={600}>Logo & Branding</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="sm">
                    <Text size="xs" c="dimmed">
                      Add your organization's logo to the display
                    </Text>

                    <FileInput
                      label="Logo Image"
                      description="Upload a PNG or JPG file"
                      placeholder="Click to upload logo"
                      leftSection={<IconUpload size={16} />}
                      onChange={(file) => file && handleFileUpload(file, 'logo_image')}
                    />

                    {display.logo_image && (
                      <Group gap="xs" p="xs" style={{ background: 'var(--mantine-color-green-light)', borderRadius: '4px' }}>
                        <Text size="xs" c="green" fw={500}>✓ Logo uploaded</Text>
                        <ActionIcon
                          size="sm"
                          color="red"
                          variant="subtle"
                          onClick={() => updateDisplay('logo_image', null)}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      </Group>
                    )}

                    <NumberInput
                      label="Logo Size"
                      description="Size in pixels"
                      value={display.logo_size_percent}
                      onChange={(value) => updateDisplay('logo_size_percent', value)}
                      min={20}
                      max={200}
                      suffix=" px"
                    />

                    <Select
                      label="Logo Position"
                      description="Where to place the logo on screen"
                      data={positionOptions}
                      value={display.logo_position}
                      onChange={(value) => updateDisplay('logo_position', value)}
                    />
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              {/* Timer & Clock Section */}
              <Accordion.Item value="timer">
                <Accordion.Control icon={<IconClock size={20} />}>
                  <Text fw={600}>Timer & Clock</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="lg">
                    <Stack gap="sm">
                      <Text fw={600} size="sm">Timer Configuration</Text>
                      <Text size="xs" c="dimmed">
                        Customize how the timer appears
                      </Text>

                      <Select
                        label="Timer Format"
                        description="Time display format"
                        data={[
                          { value: 'mm:ss', label: 'MM:SS (Minutes:Seconds)' },
                          { value: 'hh:mm:ss', label: 'HH:MM:SS (Hours:Minutes:Seconds)' },
                        ]}
                        value={display.timer_format}
                        onChange={(value) => updateDisplay('timer_format', value)}
                      />

                      <Select
                        label="Timer Font"
                        description="Monospace fonts recommended"
                        data={monoFontOptions}
                        value={display.timer_font_family}
                        onChange={(value) => updateDisplay('timer_font_family', value)}
                      />

                      <NumberInput
                        label="Timer Size"
                        description="Percentage of default size"
                        value={display.timer_size_percent}
                        onChange={(value) => updateDisplay('timer_size_percent', value)}
                        min={50}
                        max={200}
                        suffix="%"
                      />

                      <Select
                        label="Timer Position"
                        description="Vertical placement on screen"
                        data={timerPositionOptions}
                        value={display.timer_position}
                        onChange={(value) => updateDisplay('timer_position', value)}
                      />
                    </Stack>

                    <Divider />

                    <Stack gap="sm">
                      <Text fw={600} size="sm">Clock Display</Text>
                      <Text size="xs" c="dimmed">
                        Show current time alongside the timer
                      </Text>

                      <Switch
                        label="Show Clock"
                        description="Display current time on screen"
                        checked={display.clock_visible}
                        onChange={(e) => updateDisplay('clock_visible', e.currentTarget.checked)}
                      />

                      {display.clock_visible && (
                        <Select
                          label="Clock Font"
                          data={monoFontOptions}
                          value={display.clock_font_family}
                          onChange={(value) => updateDisplay('clock_font_family', value)}
                        />
                      )}
                    </Stack>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              {/* Content Layout Section */}
              <Accordion.Item value="content">
                <Accordion.Control icon={<IconTextSize size={20} />}>
                  <Text fw={600}>Content & Typography</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="lg">
                    <Stack gap="sm">
                      <Text fw={600} size="sm">Content Placement</Text>
                      <Text size="xs" c="dimmed">
                        Choose where to display title and speaker information
                      </Text>

                      <Select
                        label="Title Location"
                        description="Where to show the timer title"
                        data={displayLocationOptions}
                        value={display.title_display_location}
                        onChange={(value) => updateDisplay('title_display_location', value)}
                      />

                      <Select
                        label="Speaker Location"
                        description="Where to show the speaker name"
                        data={displayLocationOptions}
                        value={display.speaker_display_location}
                        onChange={(value) => updateDisplay('speaker_display_location', value)}
                      />
                    </Stack>

                    <Divider />

                    <Stack gap="sm">
                      <Text fw={600} size="sm">Typography</Text>
                      <Text size="xs" c="dimmed">
                        Font families for different text elements
                      </Text>

                      <Select
                        label="Header Font"
                        description="Font for header text"
                        data={fontOptions}
                        value={display.header_font_family}
                        onChange={(value) => updateDisplay('header_font_family', value)}
                      />

                      <Select
                        label="Footer Font"
                        description="Font for footer text"
                        data={fontOptions}
                        value={display.footer_font_family}
                        onChange={(value) => updateDisplay('footer_font_family', value)}
                      />

                      <Select
                        label="Message Font"
                        description="Font for message text"
                        data={fontOptions}
                        value={display.message_font_family}
                        onChange={(value) => updateDisplay('message_font_family', value)}
                      />
                    </Stack>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              {/* Colors & Theme Section */}
              <Accordion.Item value="colors">
                <Accordion.Control icon={<IconPalette size={20} />}>
                  <Text fw={600}>Colors & Theme</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="lg">
                    <Stack gap="sm">
                      <Text fw={600} size="sm">Timer & Clock Colors</Text>
                      <Text size="xs" c="dimmed">
                        Colors for time display elements
                      </Text>

                      <ColorInput
                        label="Timer Color"
                        description="Main timer text color"
                        value={display.timer_color}
                        onChange={(value) => updateDisplay('timer_color', value)}
                        withEyeDropper={true}
                        swatches={['#ffffff', '#000000', '#868e96']}
                      />

                      <ColorInput
                        label="Clock Color"
                        description="Current time display color"
                        value={display.clock_color}
                        onChange={(value) => updateDisplay('clock_color', value)}
                        withEyeDropper={true}
                        swatches={['#ffffff', '#000000', '#868e96']}
                      />
                    </Stack>

                    <Divider />

                    <Stack gap="sm">
                      <Text fw={600} size="sm">Content Text Colors</Text>
                      <Text size="xs" c="dimmed">
                        Colors for titles, speakers, and messages
                      </Text>

                      <ColorInput
                        label="Header Text Color"
                        description="Color for header content"
                        value={display.header_color}
                        onChange={(value) => updateDisplay('header_color', value)}
                        withEyeDropper={true}
                        swatches={['#ffffff', '#000000', '#868e96']}
                      />

                      <ColorInput
                        label="Footer Text Color"
                        description="Color for footer content"
                        value={display.footer_color}
                        onChange={(value) => updateDisplay('footer_color', value)}
                        withEyeDropper={true}
                        swatches={['#ffffff', '#000000', '#868e96']}
                      />

                      <ColorInput
                        label="Message Color"
                        description="Color for message text"
                        value={display.message_color}
                        onChange={(value) => updateDisplay('message_color', value)}
                        withEyeDropper={true}
                        swatches={['#ffffff', '#000000', '#868e96']}
                      />
                    </Stack>

                    <Divider />

                    <Stack gap="sm">
                      <Text fw={600} size="sm">Progress Indicator Colors</Text>
                      <Text size="xs" c="dimmed">
                        Colors for different timer states
                      </Text>

                      <ColorInput
                        label="Normal State"
                        description="Color when timer is running normally"
                        value={display.progress_color_main}
                        onChange={(value) => updateDisplay('progress_color_main', value)}
                        withEyeDropper={true}
                        swatches={['#40c057', '#12b886', '#15aabf', '#228be6']}
                      />

                      <ColorInput
                        label="Warning State"
                        description="Color when approaching time limit"
                        value={display.progress_color_secondary}
                        onChange={(value) => updateDisplay('progress_color_secondary', value)}
                        withEyeDropper={true}
                        swatches={['#fab005', '#fd7e14', '#82c91e', '#40c057']}
                      />

                      <ColorInput
                        label="Critical State"
                        description="Color when time is almost up"
                        value={display.progress_color_tertiary}
                        onChange={(value) => updateDisplay('progress_color_tertiary', value)}
                        withEyeDropper={true}
                        swatches={['#fa5252', '#e64980', '#fd7e14', '#fab005']}
                      />
                    </Stack>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>

            <Divider />

            <Group justify="space-between" gap="sm">
              <div>
                {!isCreatingNew && onDelete && displays.length > 1 && (
                  <Tooltip label="Delete this display configuration">
                    <Button
                      leftSection={<IconTrash size={18} />}
                      color="red"
                      variant="light"
                      onClick={() => setDeleteConfirmOpened(true)}
                      size="md"
                    >
                      Delete Display
                    </Button>
                  </Tooltip>
                )}
              </div>
              <Group gap="sm">
                {onCancel && (
                  <Tooltip label={hasUnsavedChanges ? "Discard unsaved changes" : "Close editor"}>
                    <Button variant="default" onClick={onCancel} size="md">
                      Cancel
                    </Button>
                  </Tooltip>
                )}
                <Tooltip label={!hasUnsavedChanges ? "No changes to save" : isCreatingNew ? "Create new display" : "Save changes to display"}>
                  <Button
                    leftSection={<IconDeviceFloppy size={18} />}
                    onClick={() => {
                      // Remove client-side only properties before saving
                      const { is_default, ...displayToSave } = display;
                      onSave?.(displayToSave);
                      if (display.is_default && display.id) {
                        setDefaultDisplay(display.id);
                      }
                      // Reset unsaved changes after save
                      initialDisplayRef.current = display;
                      setHasUnsavedChanges(false);
                    }}
                    size="md"
                    disabled={!hasUnsavedChanges || (isCreatingNew && !display.name.trim())}
                  >
                    {isCreatingNew ? 'Create Display' : 'Save Changes'}
                  </Button>
                </Tooltip>
              </Group>
            </Group>
          </Stack>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 7 }}>
        <Paper withBorder p="xl" radius="md" style={{ position: 'sticky', top: '1rem' }}>
          <Stack gap="md">
            <div>
              <Group justify="space-between" align="center">
                <div>
                  <Title order={2}>Live Preview</Title>
                  <Text size="sm" c="dimmed" mt="xs">
                    Changes are reflected instantly as you adjust settings
                  </Text>
                </div>
                {/* <Group gap="xs">
                  <Badge color="green" variant="dot">Real-time</Badge>
                  <Tooltip label="Fullscreen Preview">
                    <Button
                      variant="light"
                      size="sm"
                      leftSection={<IconMaximize size={16} />}
                      onClick={() => setFullscreenPreview(true)}
                    >
                      Fullscreen
                    </Button>
                  </Tooltip>
                </Group> */}
              </Group>
            </div>
            <TimerDisplay
              display={display}
              timer={mockTimer}
            />
          </Stack>
        </Paper>
      </Grid.Col>

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
            Are you sure you want to delete the display "{display.name}"? This action cannot be undone.
          </Text>

          {display.is_default && !deleteError && (
            <Text c="orange" fw={500}>
              Warning: This is your default display. You'll need to set a new default after deletion.
            </Text>
          )}

          {deleteError && (
            <Text c="red" fw={500} style={{
              padding: '12px',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              borderRadius: '4px',
              border: '1px solid rgba(255, 107, 107, 0.3)'
            }}>
              {deleteError}
            </Text>
          )}

          <Group justify="flex-end" gap="sm" mt="md">
            <Button
              variant="default"
              onClick={() => {
                setDeleteConfirmOpened(false);
                setDeleteError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteDisplay}
              disabled={!!deleteError && deleteError.includes('Cannot delete')}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Fullscreen Preview Modal */}
      <Modal
        opened={fullscreenPreview}
        onClose={() => setFullscreenPreview(false)}
        fullScreen
        padding={0}
        withCloseButton={false}
        styles={{
          body: {
            padding: 0,
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
          },
          content: {
            backgroundColor: '#000',
          }
        }}
      >
        <Box
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TimerDisplay
            display={display}
            timer={mockTimer}
            in_view_mode={true}
          />
        </Box>
      </Modal>
    </Grid>
  );
}
