'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { paymentSchema } from '@/schemas/payment';

async function getCurrentBusinessId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  
  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', userId)
    .single();
  
  return membership?.business_id || null;
}

export async function recordPayment(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return { error: 'No business found' };
  }

  const data = paymentSchema.parse({
    bookingId: formData.get('bookingId'),
    amount: formData.get('amount'),
    method: formData.get('method'),
    notes: formData.get('notes'),
  });

  // Verify booking belongs to this business
  const { data: booking } = await supabase
    .from('bookings')
    .select('id')
    .eq('id', data.bookingId)
    .eq('business_id', businessId)
    .single();

  if (!booking) {
    return { error: 'Booking not found' };
  }

  const { error } = await supabase
    .from('payments')
    .insert({
      business_id: businessId,
      booking_id: data.bookingId,
      amount: data.amount,
      method: data.method,
      status: 'paid',
      notes: data.notes || null,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/bookings');
  revalidatePath('/payments');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getPaymentByBookingId(bookingId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return null;
  }

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .eq('business_id', businessId)
    .single();

  return payment || null;
}

export async function getDailyRevenue(date: string): Promise<number> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return 0;
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return 0;
  }

  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('business_id', businessId)
    .eq('created_at::date', date);

  return payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
}

export async function getTodayRevenue(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  return getDailyRevenue(today);
}

export async function getTodayPaymentsCount(): Promise<number> {
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
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('created_at::date', today);

  return count || 0;
}

export async function getPayments() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return [];
  }

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      booking:bookings(
        booking_date,
        customer:customers(name),
        service:services(name)
      )
    `)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  return payments || [];
}

export async function getRevenueSummary() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { today: 0, week: 0, month: 0 };
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return { today: 0, week: 0, month: 0 };
  }

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, created_at')
    .eq('business_id', businessId)
    .gte('created_at', monthAgo);

  const todayRevenue = payments
    ?.filter(p => p.created_at?.startsWith(today))
    .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  const weekRevenue = payments
    ?.filter(p => p.created_at && p.created_at >= weekAgo)
    .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  const monthRevenue = payments
    ?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  return {
    today: todayRevenue,
    week: weekRevenue,
    month: monthRevenue,
  };
}
