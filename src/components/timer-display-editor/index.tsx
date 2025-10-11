import { useState } from 'react';
import {
  Paper,
  Title,
  Tabs,
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
  Card,
  rem,
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
} from '@tabler/icons-react';
import TimerDisplay from '@/components/timer-display';
import { useWebSocketContext } from '@/providers/websocket-provider';

// Main Editor Component
interface TimerDisplayEditorProps {
  initialDisplay?: any;
  displays?: any[];
  onSave?: (display: any) => void;
  onCancel?: () => void;
  nameError?: string | null;
  defaultDisplayId?: number | null;
}

export default function TimerDisplayEditor({
  initialDisplay,
  displays = [],
  onSave,
  onCancel,
  nameError,
  defaultDisplayId
}: TimerDisplayEditorProps) {
  const { setDefaultDisplay } = useWebSocketContext();

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
    } else {
      const selectedDisplay = displays.find(d => d.id.toString() === value);
      if (selectedDisplay) {
        setDisplay({
          ...selectedDisplay,
          is_default: selectedDisplay.id === defaultDisplayId
        });
        setSelectedDisplayId(selectedDisplay.id);
        setIsCreatingNew(false);
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

  const updateDisplay = (key, value) => {
    setDisplay(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (file, key) => {
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

            <Tabs defaultValue="layout" variant="pills">
              <Tabs.List grow>
                <Tabs.Tab value="layout" leftSection={<IconLayout size={18} />}>
                  Layout
                </Tabs.Tab>
                <Tabs.Tab value="branding" leftSection={<IconPhoto size={18} />}>
                  Brand
                </Tabs.Tab>
                <Tabs.Tab value="timer" leftSection={<IconClock size={18} />}>
                  Timer
                </Tabs.Tab>
                <Tabs.Tab value="content" leftSection={<IconTextSize size={18} />}>
                  Content
                </Tabs.Tab>
                <Tabs.Tab value="colors" leftSection={<IconPalette size={18} />}>
                  Colors
                </Tabs.Tab>
              </Tabs.List>

              {/* Layout & Background Tab */}
              <Tabs.Panel value="layout" pt="lg">
                <Stack gap="lg">
                  <Card withBorder radius="md" p="md">
                    <Stack gap="sm">
                      <Group gap="xs">
                        <IconLayout size={20} />
                        <Text fw={600} size="sm">Display Dimensions</Text>
                      </Group>
                      <Text size="xs" c="dimmed" mb="xs">
                        Choose the aspect ratio for your timer display
                      </Text>
                      <Select
                        label="Aspect Ratio"
                        data={aspectRatioOptions}
                        value={display.display_ratio}
                        onChange={(value) => updateDisplay('display_ratio', value)}
                      />
                    </Stack>
                  </Card>

                  <Card withBorder radius="md" p="md">
                    <Stack gap="sm">
                      <Group gap="xs">
                        <IconSparkles size={20} />
                        <Text fw={600} size="sm">Background</Text>
                      </Group>
                      <Text size="xs" c="dimmed" mb="xs">
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
                          swatches={['#000000', '#1a1b1e', '#2C2E33', '#25262B', '#ffffff', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                        />
                      )}

                      {display.background_type === 'image' && (
                        <Stack gap="xs">
                          <FileInput
                            label="Background Image"
                            placeholder="Click to upload image"
                            leftSection={<IconUpload size={16} />}
                            onChange={(file) => handleFileUpload(file, 'background_image')}
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
                  </Card>

                  <Card withBorder radius="md" p="md">
                    <Stack gap="sm">
                      <Text fw={600} size="sm">Progress Indicator</Text>
                      <Text size="xs" c="dimmed" mb="xs">
                        Visual indicator showing timer progress
                      </Text>
                      <Select
                        label="Progress Style"
                        data={progressStyleOptions}
                        value={display.progress_style}
                        onChange={(value) => updateDisplay('progress_style', value)}
                      />
                    </Stack>
                  </Card>
                </Stack>
              </Tabs.Panel>

              {/* Branding Tab */}
              <Tabs.Panel value="branding" pt="lg">
                <Stack gap="lg">
                  <Card withBorder radius="md" p="md">
                    <Stack gap="sm">
                      <Group gap="xs">
                        <IconPhoto size={20} />
                        <Text fw={600} size="sm">Logo Settings</Text>
                      </Group>
                      <Text size="xs" c="dimmed" mb="xs">
                        Add your organization's logo to the display
                      </Text>
                      
                      <FileInput
                        label="Logo Image"
                        description="Upload a PNG or JPG file"
                        placeholder="Click to upload logo"
                        leftSection={<IconUpload size={16} />}
                        onChange={(file) => handleFileUpload(file, 'logo_image')}
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
                  </Card>
                </Stack>
              </Tabs.Panel>

              {/* Timer & Clock Tab */}
              <Tabs.Panel value="timer" pt="lg">
                <Stack gap="lg">
                  <Card withBorder radius="md" p="md">
                    <Stack gap="sm">
                      <Group gap="xs">
                        <IconClock size={20} />
                        <Text fw={600} size="sm">Timer Configuration</Text>
                      </Group>
                      <Text size="xs" c="dimmed" mb="xs">
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
                        description="Monospace fonts recommended for timers"
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
                  </Card>

                  <Card withBorder radius="md" p="md">
                    <Stack gap="sm">
                      <Text fw={600} size="sm">Clock Display</Text>
                      <Text size="xs" c="dimmed" mb="xs">
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
                  </Card>
                </Stack>
              </Tabs.Panel>

              {/* Content Layout Tab */}
              <Tabs.Panel value="content" pt="lg">
                <Stack gap="lg">
                  <Card withBorder radius="md" p="md">
                    <Stack gap="sm">
                      <Group gap="xs">
                        <IconTextSize size={20} />
                        <Text fw={600} size="sm">Content Placement</Text>
                      </Group>
                      <Text size="xs" c="dimmed" mb="xs">
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
                  </Card>

                  <Card withBorder radius="md" p="md">
                    <Stack gap="sm">
                      <Group gap="xs">
                        <IconTypography size={20} />
                        <Text fw={600} size="sm">Typography</Text>
                      </Group>
                      <Text size="xs" c="dimmed" mb="xs">
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
                  </Card>
                </Stack>
              </Tabs.Panel>

              {/* Colors & Theme Tab */}
              <Tabs.Panel value="colors" pt="lg">
                <Stack gap="lg">
                  <Card withBorder radius="md" p="md">
                    <Stack gap="sm">
                      <Group gap="xs">
                        <IconPalette size={20} />
                        <Text fw={600} size="sm">Timer & Clock Colors</Text>
                      </Group>
                      <Text size="xs" c="dimmed" mb="xs">
                        Colors for time display elements
                      </Text>

                      <ColorInput
                        label="Timer Color"
                        description="Main timer text color"
                        value={display.timer_color}
                        onChange={(value) => updateDisplay('timer_color', value)}
                        withEyeDropper={true}
                        swatches={['#ffffff', '#000000', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                      />

                      <ColorInput
                        label="Clock Color"
                        description="Current time display color"
                        value={display.clock_color}
                        onChange={(value) => updateDisplay('clock_color', value)}
                        withEyeDropper={true}
                        swatches={['#ffffff', '#000000', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                      />
                    </Stack>
                  </Card>

                  <Card withBorder radius="md" p="md">
                    <Stack gap="sm">
                      <Text fw={600} size="sm">Content Text Colors</Text>
                      <Text size="xs" c="dimmed" mb="xs">
                        Colors for titles, speakers, and messages
                      </Text>

                      <ColorInput
                        label="Header Text Color"
                        description="Color for header content"
                        value={display.header_color}
                        onChange={(value) => updateDisplay('header_color', value)}
                        withEyeDropper={true}
                        swatches={['#ffffff', '#000000', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                      />

                      <ColorInput
                        label="Footer Text Color"
                        description="Color for footer content"
                        value={display.footer_color}
                        onChange={(value) => updateDisplay('footer_color', value)}
                        withEyeDropper={true}
                        swatches={['#ffffff', '#000000', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                      />

                      <ColorInput
                        label="Message Color"
                        description="Color for message text"
                        value={display.message_color}
                        onChange={(value) => updateDisplay('message_color', value)}
                        withEyeDropper={true}
                        swatches={['#ffffff', '#000000', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                      />
                    </Stack>
                  </Card>

                  <Card withBorder radius="md" p="md">
                    <Stack gap="sm">
                      <Text fw={600} size="sm">Progress Indicator Colors</Text>
                      <Text size="xs" c="dimmed" mb="xs">
                        Colors for different timer states
                      </Text>

                      <ColorInput
                        label="Normal State"
                        description="Color when timer is running normally"
                        value={display.progress_color_main}
                        onChange={(value) => updateDisplay('progress_color_main', value)}
                        withEyeDropper={true}
                        swatches={['#40c057', '#12b886', '#15aabf', '#228be6', '#4c6ef5', '#7950f2', '#be4bdb', '#e64980', '#fa5252', '#fd7e14', '#fab005', '#82c91e']}
                      />

                      <ColorInput
                        label="Warning State"
                        description="Color when approaching time limit"
                        value={display.progress_color_secondary}
                        onChange={(value) => updateDisplay('progress_color_secondary', value)}
                        withEyeDropper={true}
                        swatches={['#fab005', '#fd7e14', '#82c91e', '#40c057', '#12b886', '#15aabf', '#228be6', '#4c6ef5', '#7950f2', '#be4bdb', '#e64980', '#fa5252']}
                      />

                      <ColorInput
                        label="Critical State"
                        description="Color when time is almost up"
                        value={display.progress_color_tertiary}
                        onChange={(value) => updateDisplay('progress_color_tertiary', value)}
                        withEyeDropper={true}
                        swatches={['#fa5252', '#e64980', '#fd7e14', '#fab005', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e']}
                      />
                    </Stack>
                  </Card>
                </Stack>
              </Tabs.Panel>
            </Tabs>

            <Divider />

            <Group justify="flex-end" gap="sm">
              {onCancel && (
                <Button variant="default" onClick={onCancel} size="md">
                  Cancel
                </Button>
              )}
              <Button
                leftSection={<IconDeviceFloppy size={18} />}
                onClick={() => {
                  // Remove client-side only properties before saving
                  const { is_default, ...displayToSave } = display;
                  onSave?.(displayToSave);
                  if (display.is_default && display.id) {
                    setDefaultDisplay(display.id);
                  }
                }}
                size="md"
              >
                Save Display
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 7 }}>
        <Paper withBorder p="xl" radius="md" style={{ position: 'sticky', top: '1rem' }}>
          <Stack gap="md">
            <div>
              <Group justify="space-between" align="center">
                <Title order={2}>Live Preview</Title>
                <Badge color="green" variant="dot">Real-time</Badge>
              </Group>
              <Text size="sm" c="dimmed" mt="xs">
                Changes are reflected instantly as you adjust settings
              </Text>
            </div>
            <TimerDisplay 
              display={display} 
              timer={mockTimer}
            />
          </Stack>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
