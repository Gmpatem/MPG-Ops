import { z } from 'zod';
import {
  businessCountrySchema,
  businessDefaultPaymentMethodSchema,
  depositTypeSchema,
} from '@/lib/business-payment-settings';

const booleanFromFormSchema = z.preprocess((value) => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
}, z.boolean().optional());

const nonNegativeNumberFromFormSchema = z.preprocess((value) => {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}, z.number().min(0).optional());

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const businessSetupSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  slug: z.string().optional(),
  businessType: z.enum(['salon', 'barbershop', 'spa'], {
    message: 'Please select a business type',
  }),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  address: z.string().optional(),
  country: businessCountrySchema.optional(),
  currency: z.string().trim().max(8).optional().or(z.literal('')),
  defaultPaymentMethod: businessDefaultPaymentMethodSchema.optional(),
  depositRequired: booleanFromFormSchema,
  depositType: depositTypeSchema.optional(),
  depositAmount: nonNegativeNumberFromFormSchema,
  gcashAccountName: z.string().trim().optional(),
  gcashNumber: z.string().trim().optional(),
  gcashQrImageUrl: z.string().trim().url('Please enter a valid QR image URL').optional().or(z.literal('')),
  gcashInstructions: z.string().trim().optional(),
  momoAccountName: z.string().trim().optional(),
  momoNumber: z.string().trim().optional(),
  momoInstructions: z.string().trim().optional(),
  manualInstructions: z.string().trim().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BusinessSetupInput = z.infer<typeof businessSetupSchema>;
