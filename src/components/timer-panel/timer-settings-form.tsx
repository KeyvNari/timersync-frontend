import { Stack, Paper, Title, TextInput, Textarea, NumberInput, Select, Checkbox, Divider, Group, Button, Text, ScrollArea } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconLayoutDashboard, IconBell, IconCalendarTime, IconAdjustments, IconDeviceDesktop } from '@tabler/icons-react';
import { useState } from 'react';
import classes from './timers.module.css';
import cx from 'clsx';

interface TimerSettingsFormProps {
    form: any;
    onSubmit: (values: any) => void;
    onClose: () => void;
    displays: any[];
}

export function TimerSettingsForm({ form, onSubmit, onClose, displays }: TimerSettingsFormProps) {
    const [activeTab, setActiveTab] = useState('basic');

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: IconLayoutDashboard },
        { id: 'config', label: 'Configuration', icon: IconAdjustments },
        { id: 'schedule', label: 'Scheduling', icon: IconCalendarTime },
        { id: 'alerts', label: 'Alerts', icon: IconBell },
        { id: 'display', label: 'Display', icon: IconDeviceDesktop },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'basic':
                return (
                    <Stack gap="md">
                        <div className={classes.sectionTitle}>
                            <IconLayoutDashboard size={20} />
                            <Text>Basic Information</Text>
                        </div>
                        <TextInput
                            label="Title"
                            placeholder="Enter timer title"
                            classNames={{ input: classes.inputField }}
                            {...form.getInputProps('title')}
                        />
                        <TextInput
                            label="Speaker"
                            placeholder="Enter speaker name (optional)"
                            classNames={{ input: classes.inputField }}
                            {...form.getInputProps('speaker')}
                        />
                        <Textarea
                            label="Notes"
                            placeholder="Add any additional notes"
                            rows={4}
                            classNames={{ input: classes.inputField }}
                            {...form.getInputProps('notes')}
                        />
                    </Stack>
                );
            case 'config':
                return (
                    <Stack gap="md">
                        <div className={classes.sectionTitle}>
                            <IconAdjustments size={20} />
                            <Text>Configuration</Text>
                        </div>
                        <NumberInput
                            label="Duration (seconds)"
                            placeholder="Enter duration in seconds"
                            min={1}
                            classNames={{ input: classes.inputField }}
                            {...form.getInputProps('duration_seconds')}
                        />
                        <Select
                            label="Timer Format"
                            placeholder="Select timer display format"
                            data={[
                                { value: 'mm:ss', label: 'MM:SS (minutes:seconds)' },
                                { value: 'h:mm:ss', label: 'H:MM:SS (hours:minutes:seconds)' },
                                { value: 'hh:mm:ss', label: 'HH:MM:SS (zero-padded hours)' },
                            ]}
                            classNames={{ input: classes.inputField }}
                            {...form.getInputProps('timer_format')}
                        />
                        <Select
                            label="Display Configuration"
                            placeholder="Select display configuration"
                            clearable
                            data={displays.map(display => ({
                                value: display.id.toString(),
                                label: display.name
                            }))}
                            classNames={{ input: classes.inputField }}
                            {...form.getInputProps('display_id')}
                        />
                    </Stack>
                );
            case 'schedule':
                return (
                    <Stack gap="md">
                        <div className={classes.sectionTitle}>
                            <IconCalendarTime size={20} />
                            <Text>Scheduling</Text>
                        </div>
                        <DateTimePicker
                            label="Scheduled Start Time"
                            placeholder="Pick date and time"
                            clearable
                            withSeconds={false}
                            classNames={{ input: classes.inputField }}
                            {...form.getInputProps('scheduled_start_time')}
                        />
                        <Paper p="md" withBorder bg="var(--mantine-color-gray-0)">
                            <Checkbox
                                label="Auto Start"
                                description="Automatically start the timer at the scheduled time"
                                {...form.getInputProps('is_manual_start', { type: 'checkbox' })}
                            />
                        </Paper>
                    </Stack>
                );
            case 'alerts':
                return (
                    <Stack gap="md">
                        <div className={classes.sectionTitle}>
                            <IconBell size={20} />
                            <Text>Alerts & Warnings</Text>
                        </div>
                        <NumberInput
                            label="Warning Time (seconds)"
                            description="Time remaining when the timer turns orange"
                            placeholder="e.g. 60"
                            min={0}
                            classNames={{ input: classes.inputField }}
                            {...form.getInputProps('warning_time')}
                        />
                        <NumberInput
                            label="Critical Time (seconds)"
                            description="Time remaining when the timer turns red"
                            placeholder="e.g. 30"
                            min={0}
                            classNames={{ input: classes.inputField }}
                            {...form.getInputProps('critical_time')}
                        />
                    </Stack>
                );
            case 'display':
                return (
                    <Stack gap="md">
                        <div className={classes.sectionTitle}>
                            <IconDeviceDesktop size={20} />
                            <Text>Display Options</Text>
                        </div>
                        <Stack gap="xs">
                            <Paper p="sm" withBorder className={classes.inputField}>
                                <Checkbox
                                    label="Show Title"
                                    description="Display the timer title on the viewer screen"
                                    {...form.getInputProps('show_title', { type: 'checkbox' })}
                                />
                            </Paper>
                            <Paper p="sm" withBorder className={classes.inputField}>
                                <Checkbox
                                    label="Show Speaker"
                                    description="Display the speaker name on the viewer screen"
                                    {...form.getInputProps('show_speaker', { type: 'checkbox' })}
                                />
                            </Paper>
                            <Paper p="sm" withBorder className={classes.inputField}>
                                <Checkbox
                                    label="Show Notes"
                                    description="Display notes on the viewer screen"
                                    {...form.getInputProps('show_notes', { type: 'checkbox' })}
                                />
                            </Paper>
                        </Stack>
                    </Stack>
                );
            default:
                return null;
        }
    };

    return (
        <form onSubmit={form.onSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                {/* Sidebar */}
                <div className={classes.sidebar}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            className={cx(classes.tabButton, { [classes.tabButtonActive]: activeTab === tab.id })}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className={classes.contentArea}>
                    <ScrollArea h="100%" type="auto" offsetScrollbars>
                        {renderContent()}
                    </ScrollArea>
                </div>
            </div>

            {/* Footer */}
            <div className={classes.footer}>
                <Button variant="subtle" color="gray" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit">
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
