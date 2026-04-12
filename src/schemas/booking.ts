import { z } from 'zod';

export const bookingStatusSchema = z.enum(['scheduled', 'completed', 'cancelled']);

export const bookingSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  serviceId: z.string().min(1, 'Service is required'),
  bookingDate: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  notes: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type BookingStatus = z.infer<typeof bookingStatusSchema>;
