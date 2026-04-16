'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { bookingSchema } from '@/schemas/booking';

async function getCurrentBusinessId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  
  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', userId)
    .single();
  
  return membership?.business_id || null;
}

export async function createBooking(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return { error: 'No business found' };
  }

  const data = bookingSchema.parse({
    customerId: formData.get('customerId'),
    serviceId: formData.get('serviceId'),
    bookingDate: formData.get('bookingDate'),
    startTime: formData.get('startTime'),
    notes: formData.get('notes'),
  });

  // Get service duration to calculate end time
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', data.serviceId)
    .eq('business_id', businessId)
    .single();

  if (!service) {
    return { error: 'Service not found' };
  }

  // Calculate end time
  const [hours, minutes] = data.startTime.split(':').map(Number);
  const startDateTime = new Date();
  startDateTime.setHours(hours, minutes, 0, 0);
  const endDateTime = new Date(startDateTime.getTime() + service.duration_minutes * 60000);
  const endTime = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`;

  const { error } = await supabase
    .from('bookings')
    .insert({
      business_id: businessId,
      customer_id: data.customerId,
      service_id: data.serviceId,
      booking_date: data.bookingDate,
      start_time: data.startTime,
      end_time: endTime,
      status: 'scheduled',
      notes: data.notes || null,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/bookings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateBookingStatus(bookingId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'no_show') {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return { error: 'No business found' };
  }

  const { error } = await supabase
    .from('bookings')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .eq('business_id', businessId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/bookings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getBookingsByDate(date: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return [];
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(name),
      service:services(name, duration_minutes, price)
    `)
    .eq('business_id', businessId)
    .eq('booking_date', date)
    .order('start_time', { ascending: true });

  return bookings || [];
}

export async function getTodayBookingsCount(): Promise<number> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return 0;
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return 0;
  }

  const today = new Date().toISOString().split('T')[0];

  const { count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('booking_date', today);

  return count || 0;
}

export async function updateBooking(bookingId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return { error: 'No business found' };
  }

  const data = bookingSchema.parse({
    customerId: formData.get('customerId'),
    serviceId: formData.get('serviceId'),
    bookingDate: formData.get('bookingDate'),
    startTime: formData.get('startTime'),
    notes: formData.get('notes'),
  });

  // Get service duration to calculate end time
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', data.serviceId)
    .eq('business_id', businessId)
    .single();

  if (!service) {
    return { error: 'Service not found' };
  }

  // Calculate end time
  const [hours, minutes] = data.startTime.split(':').map(Number);
  const startDateTime = new Date();
  startDateTime.setHours(hours, minutes, 0, 0);
  const endDateTime = new Date(startDateTime.getTime() + service.duration_minutes * 60000);
  const endTime = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`;

  const { error } = await supabase
    .from('bookings')
    .update({
      customer_id: data.customerId,
      service_id: data.serviceId,
      booking_date: data.bookingDate,
      start_time: data.startTime,
      end_time: endTime,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .eq('business_id', businessId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/bookings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getBookingsByCustomer(customerId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return [];
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_date,
      start_time,
      status,
      service:services(name, price),
      payment:payments(amount, status)
    `)
    .eq('business_id', businessId)
    .eq('customer_id', customerId)
    .order('booking_date', { ascending: false });

  return bookings || [];
}

export async function getTodayCompletedCount(): Promise<number> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return 0;
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return 0;
  }

  const today = new Date().toISOString().split('T')[0];

  const { count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('booking_date', today)
    .eq('status', 'completed');

  return count || 0;
}
