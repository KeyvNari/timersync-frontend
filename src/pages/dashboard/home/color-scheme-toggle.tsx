import { ActionIcon, Group, useMantineColorScheme, Tooltip } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const isDark = colorScheme === 'dark';

  const handleToggle = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <Tooltip label={isDark ? 'Light mode' : 'Dark mode'} position="bottom" withArrow>
      <ActionIcon
        onClick={handleToggle}
        variant="default"
        size="lg"
        aria-label="Toggle color scheme"
      >
        {isDark ? <IconSun size={20} stroke={1.5} /> : <IconMoon size={20} stroke={1.5} />}
      </ActionIcon>
    </Tooltip>
  );
}
