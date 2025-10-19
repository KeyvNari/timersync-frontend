/**
 * Money Input Component - DISABLED
 * Original file required react-imask and dinero.js which were removed to reduce bundle size
 * To re-enable, install react-imask and dinero.js, and restore from money-input.tsx.disabled
 */

import { TextInput } from '@mantine/core';

export function MoneyInput(props: any) {
  return <TextInput {...props} placeholder="Amount" />;
}

export default MoneyInput;
