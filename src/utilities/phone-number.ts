/**
 * Phone number utilities - DISABLED
 * Original file required libphonenumber-js which was removed to reduce bundle size
 * To re-enable, install libphonenumber-js and restore from phone-number.ts.disabled
 */

import { z } from 'zod';

export const formatPhoneNumber = (phone: string) => phone;
export const isValidPhoneNumber = (phone: string) => true;
export const phoneNumberSchema = z.string().optional();
