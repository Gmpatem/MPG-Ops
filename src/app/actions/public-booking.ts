'use server';

import { cache } from 'react';
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
  serviceIds: z.array(z.string().uuid('Invalid service')).min(1, 'Select at least one service'),
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
  totalDurationMinutes: number;
  totalPrice: number;
  allServiceNames: string[];
}

/**
 * Fetch public-safe business data (no auth required).
 * Returns null if business not found.
 * Gracefully falls back to base fields if public_site_settings column
 * does not yet exist (i.e. migration 001 not yet applied).
 */
export const getPublicBusiness = cache(async function getPublicBusiness(
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
});

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
 * Fetch existing bookings for a business on a specific date.
 * Used for public slot conflict detection.
 */
export async function getPublicBookingsForDate(
  businessId: string,
  date: string
): Promise<{ start_time: string; end_time: string }[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('business_id', businessId)
      .eq('booking_date', date)
      .in('status', ['scheduled', 'completed']);

    if (error || !data) return [];
    return data.map((b) => ({ start_time: b.start_time, end_time: b.end_time }));
  } catch {
    return [];
  }
}

/**
 * Submit a public booking. No auth required.
 * Supports multi-service bookings by storing the primary service in service_id
 * and additional services in source_meta. The end_time reflects total duration.
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

    // 2. Verify all services are active and belong to this business
    const { data: services, error: svcError } = await supabase
      .from('services')
      .select('id, name, duration_minutes, price')
      .in('id', data.serviceIds)
      .eq('business_id', data.businessId)
      .eq('is_active', true);

    if (svcError || !services || services.length !== data.serviceIds.length) {
      return { success: false, error: 'One or more services are unavailable' };
    }

    const primaryService = services[0];
    const totalDurationMinutes = services.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const totalPrice = services.reduce((sum, s) => sum + (s.price || 0), 0);
    const allServiceNames = services.map((s) => s.name);

    // 3. Find existing customer by phone in this business
    let customerId: string;

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('business_id', data.businessId)
      .eq('phone', data.customerPhone.trim())
      .single();

    if (existingCustomer) {
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

    // 4. Calculate end time from total duration
    const [h, m] = data.startTime.split(':').map(Number);
    const startMin = h * 60 + m;
    const endMin = startMin + totalDurationMinutes;
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

    // 5. Double-booking protection: re-check conflicts server-side before insert
    const { data: existingBookings, error: conflictError } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('business_id', data.businessId)
      .eq('booking_date', data.bookingDate)
      .in('status', ['scheduled', 'completed']);

    if (conflictError) {
      console.error('Conflict check error:', conflictError.message);
      return { success: false, error: 'Unable to verify availability. Please try again.' };
    }

    const hasConflict = (existingBookings || []).some((b) => {
      const bStart = parseInt(b.start_time.split(':')[0], 10) * 60 + parseInt(b.start_time.split(':')[1], 10);
      const bEnd = parseInt(b.end_time.split(':')[0], 10) * 60 + parseInt(b.end_time.split(':')[1], 10);
      return startMin < bEnd && endMin > bStart;
    });

    if (hasConflict) {
      return { success: false, error: 'This time slot is no longer available. Please choose another time.' };
    }

    // 6. Create booking (primary service in service_id, extras in source_meta)
    const sourceMeta = {
      additional_services: services.slice(1).map((s) => ({
        id: s.id,
        name: s.name,
        duration_minutes: s.duration_minutes,
        price: s.price,
      })),
      total_duration_minutes: totalDurationMinutes,
      total_price: totalPrice,
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        business_id: data.businessId,
        customer_id: customerId,
        service_id: primaryService.id,
        booking_date: data.bookingDate,
        start_time: data.startTime,
        end_time: endTime,
        status: 'scheduled',
        notes: data.notes?.trim() || null,
        source: 'public_booking',
        source_meta: sourceMeta as import('@/lib/supabase/database.types').Json,
      })
      .select('id')
      .single();

    if (bookingError || !booking) {
      console.error('Booking insert error:', bookingError?.message);
      return { success: false, error: bookingError?.message ?? 'Failed to create booking. Please try again.' };
    }

    // 7. Insert booking_services join rows for all selected services
    const bookingServicesPayload = data.serviceIds.map((serviceId) => ({
      booking_id: booking.id,
      service_id: serviceId,
    }));

    const { error: joinError } = await supabase
      .from('booking_services')
      .insert(bookingServicesPayload);

    if (joinError) {
      console.error('booking_services insert error:', joinError.message);
      // Best-effort rollback: delete the orphaned booking
      await supabase.from('bookings').delete().eq('id', booking.id);
      return { success: false, error: joinError.message };
    }

    // Revalidate internal pages so the booking appears immediately
    revalidatePath('/bookings');
    revalidatePath('/dashboard');

    return {
      success: true,
      confirmation: {
        bookingId: booking.id,
        businessName: business.name,
        serviceName: primaryService.name,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime,
        customerName: data.customerName.trim(),
        totalDurationMinutes,
        totalPrice,
        allServiceNames,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, error: message };
  }
}
