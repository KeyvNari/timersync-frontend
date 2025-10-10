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
  FileInput,
  Button,
  Divider,
  Grid,
  Text,
  ActionIcon,
} from '@mantine/core';
import {
  IconUpload,
  IconPhoto,
  IconPalette,
  IconTypography,
  IconLayout,
  IconDeviceFloppy,
  IconX,
} from '@tabler/icons-react';
import TimerDisplay from '@/components/timer-display';

// Main Editor Component
interface TimerDisplayEditorProps {
  initialDisplay?: any;
  displays?: any[];
  onSave?: (display: any) => void;
  onCancel?: () => void;
}

export default function TimerDisplayEditor({
  initialDisplay,
  displays = [],
  onSave,
  onCancel
}: TimerDisplayEditorProps) {
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
  };

  const [display, setDisplay] = useState(initialDisplay || defaultDisplay);
  const [selectedDisplayId, setSelectedDisplayId] = useState<string | number>(initialDisplay?.id || 'new');
  const [isCreatingNew, setIsCreatingNew] = useState(!initialDisplay?.id);

  const handleDisplaySelection = (value: string | null) => {
    if (!value) return;

    if (value === 'new') {
      // Create a new display cloned from the current settings (if editing) or defaults
      const baseDisplay = initialDisplay ? { ...display } : { ...defaultDisplay };
      delete baseDisplay.id; // Remove ID for new display
      // Reset name for new displays
      const newDisplayName = initialDisplay ? `${baseDisplay.name} (Copy)` : 'New Display';
      const newDisplay = { ...baseDisplay, name: newDisplayName };
      setDisplay(newDisplay);
      setSelectedDisplayId('new');
      setIsCreatingNew(true);
    } else {
      // Load existing display
      const selectedDisplay = displays.find(d => d.id.toString() === value);
      if (selectedDisplay) {
        setDisplay({ ...selectedDisplay });
        setSelectedDisplayId(selectedDisplay.id);
        setIsCreatingNew(false);
      }
    }
  };

  // Create display options for the select
  const displayOptions = [
    { value: 'new', label: '+ Create New Display' },
    ...displays.map(display => ({
      value: display.id.toString(),
      label: display.name || `Display ${display.id}`
    }))
  ];

  // Mock timer for preview - matches the format expected by TimerDisplay
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
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, lg: 5 }}>
        <Paper withBorder p="md" style={{ height: '100%', overflow: 'auto' }}>
          <Stack gap="md">
            <Title order={3}>Display Settings</Title>
            
            <Select
              label="Select Display Configuration"
              placeholder="Choose a display to edit or create new"
              data={displayOptions}
              value={selectedDisplayId.toString()}
              onChange={handleDisplaySelection}
              searchable
              clearable={false}
            />

            <TextInput
              label="Display Name"
              value={display.name}
              onChange={(e) => updateDisplay('name', e.currentTarget.value)}
              disabled={!isCreatingNew}
            />

            <Tabs defaultValue="general">
              <Tabs.List>
                <Tabs.Tab value="general" leftSection={<IconLayout size={16} />}>
                  General
                </Tabs.Tab>
                <Tabs.Tab value="branding" leftSection={<IconPhoto size={16} />}>
                  Branding
                </Tabs.Tab>
                <Tabs.Tab value="timer" leftSection={<IconTypography size={16} />}>
                  Timer
                </Tabs.Tab>
                <Tabs.Tab value="colors" leftSection={<IconPalette size={16} />}>
                  Colors
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="general" pt="md">
                <Stack gap="sm">
                  <Select
                    label="Display Ratio"
                    data={aspectRatioOptions}
                    value={display.display_ratio}
                    onChange={(value) => updateDisplay('display_ratio', value)}
                  />

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
                      swatches={['#000000', '#ffffff', '#1a1b1e', '#2C2E33', '#25262B', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                    />
                  )}

                  {display.background_type === 'image' && (
                    <Stack gap="xs">
                      <FileInput
                        label="Background Image"
                        placeholder="Upload image"
                        leftSection={<IconUpload size={16} />}
                        onChange={(file) => handleFileUpload(file, 'background_image')}
                      />
                      {display.background_image && (
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">Image uploaded</Text>
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

                  <Select
                    label="Progress Bar Style"
                    data={progressStyleOptions}
                    value={display.progress_style}
                    onChange={(value) => updateDisplay('progress_style', value)}
                  />
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="branding" pt="md">
                <Stack gap="sm">
                  <FileInput
                    label="Logo Image"
                    placeholder="Upload logo"
                    leftSection={<IconUpload size={16} />}
                    onChange={(file) => handleFileUpload(file, 'logo_image')}
                  />
                  
                  {display.logo_image && (
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">Logo uploaded</Text>
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
                    label="Logo Size (px)"
                    value={display.logo_size_percent}
                    onChange={(value) => updateDisplay('logo_size_percent', value)}
                    min={20}
                    max={200}
                  />

                  <Select
                    label="Logo Position"
                    data={positionOptions}
                    value={display.logo_position}
                    onChange={(value) => updateDisplay('logo_position', value)}
                  />
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="timer" pt="md">
                <Stack gap="sm">
                  <Select
                    label="Timer Format"
                    data={[
                      { value: 'mm:ss', label: 'MM:SS' },
                      { value: 'hh:mm:ss', label: 'HH:MM:SS' },
                    ]}
                    value={display.timer_format}
                    onChange={(value) => updateDisplay('timer_format', value)}
                  />

                  <Select
                    label="Timer Font"
                    data={monoFontOptions}
                    value={display.timer_font_family}
                    onChange={(value) => updateDisplay('timer_font_family', value)}
                  />

                  <NumberInput
                    label="Timer Size (%)"
                    value={display.timer_size_percent}
                    onChange={(value) => updateDisplay('timer_size_percent', value)}
                    min={50}
                    max={200}
                  />

                  <Select
                    label="Timer Position"
                    data={timerPositionOptions}
                    value={display.timer_position}
                    onChange={(value) => updateDisplay('timer_position', value)}
                  />

                  <Divider label="Clock Settings" />

                  <Switch
                    label="Show Clock"
                    checked={display.clock_visible}
                    onChange={(e) => updateDisplay('clock_visible', e.currentTarget.checked)}
                  />

                  <Select
                    label="Clock Font"
                    data={monoFontOptions}
                    value={display.clock_font_family}
                    onChange={(value) => updateDisplay('clock_font_family', value)}
                  />

                  <Divider label="Text Layout" />

                  <Select
                    label="Title Location"
                    data={displayLocationOptions}
                    value={display.title_display_location}
                    onChange={(value) => updateDisplay('title_display_location', value)}
                  />

                  <Select
                    label="Speaker Location"
                    data={displayLocationOptions}
                    value={display.speaker_display_location}
                    onChange={(value) => updateDisplay('speaker_display_location', value)}
                  />

                  <Divider label="Font Families" />

                  <Select
                    label="Header Font"
                    data={fontOptions}
                    value={display.header_font_family}
                    onChange={(value) => updateDisplay('header_font_family', value)}
                  />

                  <Select
                    label="Footer Font"
                    data={fontOptions}
                    value={display.footer_font_family}
                    onChange={(value) => updateDisplay('footer_font_family', value)}
                  />

                  <Select
                    label="Message Font"
                    data={fontOptions}
                    value={display.message_font_family}
                    onChange={(value) => updateDisplay('message_font_family', value)}
                  />
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="colors" pt="md">
                <Stack gap="sm">
                  <ColorInput
                    label="Timer Color"
                    value={display.timer_color}
                    onChange={(value) => updateDisplay('timer_color', value)}
                    withEyeDropper={true}
                    swatches={['#ffffff', '#000000', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                  />

                  <ColorInput
                    label="Clock Color"
                    value={display.clock_color}
                    onChange={(value) => updateDisplay('clock_color', value)}
                    withEyeDropper={true}
                    swatches={['#ffffff', '#000000', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                  />

                  <ColorInput
                    label="Header Text Color"
                    value={display.header_color}
                    onChange={(value) => updateDisplay('header_color', value)}
                    withEyeDropper={true}
                    swatches={['#ffffff', '#000000', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                  />

                  <ColorInput
                    label="Footer Text Color"
                    value={display.footer_color}
                    onChange={(value) => updateDisplay('footer_color', value)}
                    withEyeDropper={true}
                    swatches={['#ffffff', '#000000', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                  />

                  <ColorInput
                    label="Message Color"
                    value={display.message_color}
                    onChange={(value) => updateDisplay('message_color', value)}
                    withEyeDropper={true}
                    swatches={['#ffffff', '#000000', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                  />

                  <Divider label="Progress Colors" />

                  <ColorInput
                    label="Normal State"
                    value={display.progress_color_main}
                    onChange={(value) => updateDisplay('progress_color_main', value)}
                    withEyeDropper={true}
                    swatches={['#40c057', '#12b886', '#15aabf', '#228be6', '#4c6ef5', '#7950f2', '#be4bdb', '#e64980', '#fa5252', '#fd7e14', '#fab005', '#82c91e']}
                  />

                  <ColorInput
                    label="Warning State"
                    value={display.progress_color_secondary}
                    onChange={(value) => updateDisplay('progress_color_secondary', value)}
                    withEyeDropper={true}
                    swatches={['#fab005', '#fd7e14', '#82c91e', '#40c057', '#12b886', '#15aabf', '#228be6', '#4c6ef5', '#7950f2', '#be4bdb', '#e64980', '#fa5252']}
                  />

                  <ColorInput
                    label="Critical State"
                    value={display.progress_color_tertiary}
                    onChange={(value) => updateDisplay('progress_color_tertiary', value)}
                    withEyeDropper={true}
                    swatches={['#fa5252', '#e64980', '#fd7e14', '#fab005', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e']}
                  />
                </Stack>
              </Tabs.Panel>
            </Tabs>

            <Group justify="flex-end" gap="sm" mt="md">
              {onCancel && (
                <Button variant="light" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={() => onSave?.(display)}
              >
                Save Display
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 7 }}>
        <Paper withBorder p="md" style={{ position: 'sticky', top: '1rem' }}>
          <Stack gap="md">
            <Title order={3}>Live Preview</Title>
            <Text size="sm" c="dimmed">
              Changes are reflected in real-time
            </Text>
            {/* Using the existing TimerDisplay component for preview */}
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
