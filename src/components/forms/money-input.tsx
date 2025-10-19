/**
 * Form Money Input - DISABLED
 * Original file required react-imask and dinero.js which were removed to reduce bundle size
 */

import { forwardRef } from 'react';
import { TextInput, TextInputProps } from '@mantine/core';
import { useForm } from './form-provider';

export interface MoneyInputProps
  extends Omit<TextInputProps, 'checked' | 'value' | 'error' | 'onFocus' | 'onBlur'> {
  name: string;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ name, ...props }, ref) => {
    const form = useForm();
    return <TextInput ref={ref} key={form.key(name)} {...props} {...form.getInputProps(name)} placeholder="Amount" />;
  }
);
