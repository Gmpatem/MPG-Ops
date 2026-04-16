'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export interface PublicSiteSettings {
  headline?: string;
  subtitle?: string;
  instructions?: string;
  accent?: 'default' | 'blue' | 'green' | 'purple' | 'rose';
}

export interface PublicBusiness {
  id: string;
  name: string;
  business_type: string;
  operating_hours: Record<string, { isOpen: boolean; open: string; close: string }> | null;
  public_site_settings?: PublicSiteSettings | null;
}

export interface PublicService {
  id: string;
  name: string;
  // Public title override — falls back to name if null
  public_title: string | null;
  description: string | null;
  // Public description override — falls back to description if null
  public_description: string | null;
  price: number;
  duration_minutes: number;
  // Presentation fields (require migration 002)
  is_featured: boolean;
  promo_badge: string | null;
  promo_text: string | null;
  display_order: number;
  image_url: string | null;
}

const submitBookingSchema = z.object({
  businessId: z.string().uuid('Invalid business'),
  serviceId: z.string().uuid('Invalid service'),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time'),
  customerName: z.string().min(1, 'Name is required'),
  customerPhone: z.string().min(1, 'Phone is required'),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type SubmitBookingInput = z.infer<typeof submitBookingSchema>;

export interface BookingConfirmation {
  bookingId: string;
  businessName: string;
  serviceName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  customerName: string;
}

/**
 * Fetch public-safe business data (no auth required).
 * Returns null if business not found.
 * Gracefully falls back to base fields if public_site_settings column
 * does not yet exist (i.e. migration 001 not yet applied).
 */
export async function getPublicBusiness(
  businessId: string
): Promise<PublicBusiness | null> {
  try {
    const supabase = createAdminClient();

    // Attempt full query including public_site_settings
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, business_type, operating_hours, public_site_settings')
      .eq('id', businessId)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        business_type: data.business_type,
        operating_hours: data.operating_hours as PublicBusiness['operating_hours'],
        public_site_settings:
          (data.public_site_settings as PublicSiteSettings | null) ?? null,
      };
    }

    // Graceful fallback — column may not exist yet (pre-migration)
    if (error) {
      const { data: fallback, error: fallbackErr } = await supabase
        .from('businesses')
        .select('id, name, business_type, operating_hours')
        .eq('id', businessId)
        .single();
      if (!fallbackErr && fallback) {
        return {
          id: fallback.id,
          name: fallback.name,
          business_type: fallback.business_type,
          operating_hours: fallback.operating_hours as PublicBusiness['operating_hours'],
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch public-visible services for a business (no auth required).
 * Returns only is_active = true AND show_on_public_booking = true services,
 * sorted by display_order ASC then name ASC.
 * Gracefully falls back to basic fields if migration 002 has not been applied.
 */
export async function getPublicServices(
  businessId: string
): Promise<PublicService[]> {
  try {
    const supabase = createAdminClient();

    // Full query with all public presentation fields
    const { data, error } = await supabase
      .from('services')
      .select('id, name, public_title, description, public_description, price, duration_minutes, is_featured, promo_badge, promo_text, display_order, image_url')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .eq('show_on_public_booking', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (!error && data) {
      return data.map((row): PublicService => ({
        id: row.id,
        name: row.name,
        public_title: row.public_title ?? null,
        description: row.description ?? null,
        public_description: row.public_description ?? null,
        price: row.price,
        duration_minutes: row.duration_minutes,
        is_featured: row.is_featured ?? false,
        promo_badge: row.promo_badge ?? null,
        promo_text: row.promo_text ?? null,
        display_order: row.display_order ?? 0,
        image_url: row.image_url ?? null,
      }));
    }

    // Graceful fallback for pre-migration databases
    const { data: fallback } = await supabase
      .from('services')
      .select('id, name, description, price, duration_minutes')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (!fallback) return [];

    return fallback.map((row): PublicService => ({
      id: row.id,
      name: row.name,
      public_title: null,
      description: row.description ?? null,
      public_description: null,
      price: row.price,
      duration_minutes: row.duration_minutes,
      is_featured: false,
      promo_badge: null,
      promo_text: null,
      display_order: 0,
      image_url: null,
    }));
  } catch {
    return [];
  }
}

/**
 * Submit a public booking. No auth required.
 * - Looks up or creates customer by phone
 * - Creates booking with status 'scheduled'
 * - Returns a booking confirmation summary
 */
export async function submitPublicBooking(
  input: SubmitBookingInput
): Promise<{ success: true; confirmation: BookingConfirmation } | { success: false; error: string }> {
  // Validate input
  const parsed = submitBookingSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Invalid input';
    return { success: false, error: msg };
  }

  const data = parsed.data;

  try {
    const supabase = createAdminClient();

    // 1. Verify business exists
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', data.businessId)
      .single();

    if (bizError || !business) {
      return { success: false, error: 'Business not found' };
    }

    // 2. Verify service is active and belongs to this business
    const { data: service, error: svcError } = await supabase
      .from('services')
      .select('id, name, duration_minutes')
      .eq('id', data.serviceId)
      .eq('business_id', data.businessId)
      .eq('is_active', true)
      .single();

    if (svcError || !service) {
      return { success: false, error: 'Service not found or unavailable' };
    }

    // 3. Find existing customer by phone in this business
    let customerId: string;

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('business_id', data.businessId)
      .eq('phone', data.customerPhone.trim())
      .single();

    if (existingCustomer) {
      // Reuse existing customer; optionally update name/email
      customerId = existingCustomer.id;
      await supabase
        .from('customers')
        .update({
          name: data.customerName.trim(),
          email: data.customerEmail?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId);
    } else {
      // Create new customer
      const { data: newCustomer, error: custError } = await supabase
        .from('customers')
        .insert({
          business_id: data.businessId,
          name: data.customerName.trim(),
          phone: data.customerPhone.trim(),
          email: data.customerEmail?.trim() || null,
          notes: null,
        })
        .select('id')
        .single();

      if (custError || !newCustomer) {
        return { success: false, error: 'Failed to create customer record' };
      }
      customerId = newCustomer.id;
    }

    // 4. Calculate end time from service duration
    const [h, m] = data.startTime.split(':').map(Number);
    const startMin = h * 60 + m;
    const endMin = startMin + service.duration_minutes;
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

    // 5. Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        business_id: data.businessId,
        customer_id: customerId,
        service_id: data.serviceId,
        booking_date: data.bookingDate,
        start_time: data.startTime,
        end_time: endTime,
        status: 'scheduled',
        notes: data.notes?.trim() || null,
      })
      .select('id')
      .single();

    if (bookingError || !booking) {
      return { success: false, error: 'Failed to create booking. Please try again.' };
    }

    // Revalidate internal pages so the booking appears immediately
    revalidatePath('/bookings');
    revalidatePath('/dashboard');

    return {
      success: true,
      confirmation: {
        bookingId: booking.id,
        businessName: business.name,
        serviceName: service.name,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime,
        customerName: data.customerName.trim(),
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, error: message };
  }
}
