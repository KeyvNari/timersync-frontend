import { Group, Button, Text, Box, ActionIcon } from '@mantine/core';
import { IconBolt, IconLock } from '@tabler/icons-react';
import classes from './timers.module.css';

interface UpgradeCtaProps {
  current: number;
  limit: number;
  featureLabel?: string;
  message?: string;
  onUpgradeClick?: () => void;
}

export function UpgradeCta({ current, limit, featureLabel = 'items', message, onUpgradeClick }: UpgradeCtaProps) {
  return (
    <Group justify="space-between" align="center" wrap="nowrap" className={classes.upgradeCta} style={{ width: '100%' }}>
      <Group gap="xs" align="center">
        <ActionIcon size="sm" variant="subtle" c="dimmed">
          <IconLock size={14} />
        </ActionIcon>
        <Text size="xs" c="dimmed">
          {message || `Upgrade for more ${featureLabel}`}
        </Text>
      </Group>
      <Button
        variant="default"
        size="xs"
        leftSection={<IconBolt size={14} />}
        onClick={onUpgradeClick}
      >
        Upgrade
      </Button>
    </Group>
  );
}
