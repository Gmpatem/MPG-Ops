import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  category: z.string().optional(),
  durationMinutes: z.coerce.number().int().min(1, 'Duration must be greater than 0'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
