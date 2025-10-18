import { useState } from 'react';
import { Group, Button, NumberInput, Box } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';

interface TimerAdjustmentControlsProps {
  timerId: number;
  currentTimeSeconds: number;
  isActive: boolean;
  isPaused: boolean;
  isFinished: boolean;
  isStopped: boolean;
  onAdjustTime: (timerId: number, newTimeSeconds: number) => void;
}

export function TimerAdjustmentControls({
  timerId,
  currentTimeSeconds,
  isActive,
  isPaused,
  isFinished,
  isStopped,
  onAdjustTime,
}: TimerAdjustmentControlsProps) {
  const [customValue, setCustomValue] = useState<number>(60); // Default 60 seconds (1 minute)

  // Always show controls as long as there's a timer (allow adjustments even when paused/stopped)

  const handleAdjust = (adjustmentSeconds: number) => {
    const newTime = currentTimeSeconds + adjustmentSeconds;
    console.log('🎛️ Timer adjustment:', {
      timerId,
      currentTime: currentTimeSeconds,
      adjustment: adjustmentSeconds,
      newTime
    });
    onAdjustTime(timerId, newTime);
  };

  return (
    <Box>
      <Group justify="center" gap="xs" wrap="nowrap">
        {/* -Custom Button */}
        <Button
          variant="light"
          color="red"
          leftSection={<IconMinus size={16} />}
          onClick={() => handleAdjust(-customValue)}
          size="sm"
        >
          {Math.abs(customValue)}s
        </Button>

        {/* -2min Button */}
        <Button
          variant="light"
          color="orange"
          leftSection={<IconMinus size={16} />}
          onClick={() => handleAdjust(-120)}
          size="sm"
        >
          2min
        </Button>

        {/* Middle Spacer / Custom Value Input */}
        <NumberInput
          value={customValue}
          onChange={(val) => setCustomValue(typeof val === 'number' ? val : 60)}
          min={1}
          max={3600}
          step={5}
          size="sm"
          w={100}
          suffix="s"
          hideControls={false}
          styles={{
            input: { textAlign: 'center' }
          }}
        />

        {/* +2min Button */}
        <Button
          variant="light"
          color="teal"
          rightSection={<IconPlus size={16} />}
          onClick={() => handleAdjust(120)}
          size="sm"
        >
          2min
        </Button>

        {/* +Custom Button */}
        <Button
          variant="light"
          color="green"
          rightSection={<IconPlus size={16} />}
          onClick={() => handleAdjust(customValue)}
          size="sm"
        >
          {customValue}s
        </Button>
      </Group>
    </Box>
  );
}

export default TimerAdjustmentControls;
