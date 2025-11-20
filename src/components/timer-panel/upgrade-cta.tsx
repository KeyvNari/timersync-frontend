import { Group, Button, Text, Box, Paper, ThemeIcon } from '@mantine/core';
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
    <Paper
      p="xs"
      radius="md"
      className={classes.upgradeCta}
      style={{ width: '100%', overflow: 'hidden' }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="xs" align="center" style={{ flex: 1, minWidth: 0 }}>
          <ThemeIcon
            size="md"
            radius="xl"
            variant="light"
            color="yellow"
            style={{ flexShrink: 0 }}
          >
            <IconBolt size={16} />
          </ThemeIcon>
          <Box style={{ minWidth: 0 }}>
            <Text size="xs" fw={700} c="bright" truncate="end" style={{ lineHeight: 1.2 }}>
              Premium Feature
            </Text>
            <Text size="xs" c="dimmed" truncate="end" style={{ lineHeight: 1.2 }}>
              {message || `Upgrade for more ${featureLabel}`}
            </Text>
          </Box>
        </Group>
        <Button
          variant="white"
          size="xs"
          radius="xl"
          color="dark"
          onClick={onUpgradeClick}
          style={{
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flexShrink: 0,
            fontWeight: 600
          }}
        >
          Upgrade
        </Button>
      </Group>
    </Paper>
  );
}
