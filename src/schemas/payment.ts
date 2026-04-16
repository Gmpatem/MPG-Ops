import { z } from 'zod';

export const paymentMethodSchema = z.enum(['cash', 'card', 'mobile_money']);

export const paymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking is required'),
  amount: z.coerce.number().min(0, 'Amount cannot be negative'),
  method: paymentMethodSchema,
  notes: z.string().optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
