import { createTheme } from '@mantine/core';

import components from './overrides';

export const theme = createTheme({
  components,
  cursorType: 'pointer',
  fontFamily: 'Inter, sans-serif',
  fontFamilyMonospace: 'Roboto Mono, ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  breakpoints: {
    xs: '30em',
    sm: '40em',
    md: '48em',
    lg: '64em',
    xl: '80em',
    '2xl': '96em',
    '3xl': '120em',
    '4xl': '160em',
  },
  primaryColor: 'blue',
});
