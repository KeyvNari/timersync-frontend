import { Group, Button, Text, Box } from '@mantine/core';
import { IconBolt } from '@tabler/icons-react';
import classes from './timers.module.css';

interface UpgradeCtaProps {
  current: number;
  limit: number;
  featureLabel?: string;
  onUpgradeClick?: () => void;
}

export function UpgradeCta({ current, limit, featureLabel = 'items', onUpgradeClick }: UpgradeCtaProps) {
  return (
    <Group justify="space-between" align="center" wrap="nowrap" className={classes.upgradeCta} style={{ width: '100%' }}>
      <Text size="xs" c="dimmed">
        Upgrade for more {featureLabel}
      </Text>
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
