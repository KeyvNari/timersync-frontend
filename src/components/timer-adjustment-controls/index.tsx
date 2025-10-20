import { useState } from 'react';
import { Group, Button, NumberInput, Box, Tooltip } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';

interface TimerAdjustmentControlsProps {
  timerId: number;
  currentTimeSeconds: number;
  isActive: boolean;
  isPaused: boolean;
  isFinished: boolean;
  isStopped: boolean;
  onAdjustTime: (timerId: number, newTimeSeconds: number) => void;
  isAdjusting?: boolean;
}

export function TimerAdjustmentControls({
  timerId,
  currentTimeSeconds,
  isActive,
  isPaused,
  isFinished,
  isStopped,
  onAdjustTime,
  isAdjusting = false,
}: TimerAdjustmentControlsProps) {
  const [customValue, setCustomValue] = useState<number>(60); // Default 60 seconds (1 minute)

  // Timer is running only when it's active and not paused
  const isTimerRunning = isActive && !isPaused && !isFinished && !isStopped;

  // Disable controls when timer is not running OR when an adjustment is pending
  const controlsDisabled = !isTimerRunning || isAdjusting;
  const tooltipLabel = !isTimerRunning
    ? 'Timer must be running to adjust time'
    : isAdjusting
    ? 'Adjustment in progress...'
    : '';

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
        <Tooltip label={tooltipLabel} disabled={!controlsDisabled}>
          <Button
            variant="light"
            color="red"
            // leftSection={<IconMinus size={16} />}
            onClick={() => handleAdjust(-customValue)}
            size="sm"
            disabled={controlsDisabled}
          >
            -{Math.abs(customValue)}s
          </Button>
        </Tooltip>

        {/* -2min Button */}
        <Tooltip label={tooltipLabel} disabled={!controlsDisabled}>
          <Button
            variant="light"
            color="orange"
            // leftSection={<IconMinus size={16} />}
            onClick={() => handleAdjust(-120)}
            size="sm"
            disabled={controlsDisabled}
          >
            -2m
          </Button>
        </Tooltip>

        {/* Middle Spacer / Custom Value Input */}
        <Tooltip label={tooltipLabel} disabled={!controlsDisabled}>
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
            disabled={controlsDisabled}
            styles={{
              input: { textAlign: 'center' }
            }}
          />
        </Tooltip>

        {/* +2min Button */}
        <Tooltip label={tooltipLabel} disabled={!controlsDisabled}>
          <Button
            variant="light"
            color="teal"
            // rightSection={<IconPlus size={16} />}
            onClick={() => handleAdjust(120)}
            size="sm"
            disabled={controlsDisabled}
          >
            +2m
          </Button>
        </Tooltip>

        {/* +Custom Button */}
        <Tooltip label={tooltipLabel} disabled={!controlsDisabled}>
          <Button
            variant="light"
            color="green"
            rightSection={<IconPlus size={16} />}
            onClick={() => handleAdjust(customValue)}
            size="sm"
            disabled={controlsDisabled}
          >
            {customValue}s
          </Button>
        </Tooltip>
      </Group>
    </Box>
  );
}

export default TimerAdjustmentControls;
