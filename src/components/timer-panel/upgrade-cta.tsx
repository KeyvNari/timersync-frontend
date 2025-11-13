import { Group, Button, Text, Box } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import classes from './timers.module.css';

interface UpgradeCtaProps {
  current: number;
  limit: number;
  featureLabel?: string;
  onUpgradeClick?: () => void;
}

export function UpgradeCta({ current, limit, featureLabel = 'items', onUpgradeClick }: UpgradeCtaProps) {
  return (
    <Box className={classes.upgradeCta} style={{ width: '100%' }}>
      <Group justify="space-between" align="center" wrap="nowrap" style={{ width: '100%' }}>
        <Text size="sm" c="dimmed">
          Upgrade to add more {featureLabel}.
        </Text>
        <Button
          variant="default"
          size="sm"
          leftSection={<IconSparkles size={16} />}
          onClick={onUpgradeClick}
        >
          Upgrade
        </Button>
      </Group>
    </Box>
  );
}
