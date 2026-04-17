'use server';

import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { customerSchema } from '@/schemas/customer';
import type { Tables } from '@/lib/supabase/database.types';

const getCurrentBusinessId = cache(async function getCurrentBusinessId(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', userId)
    .single();

  return membership?.business_id || null;
});

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return { error: 'No business found' };
  }

  const data = customerSchema.parse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    notes: formData.get('notes'),
  });

  const { error } = await supabase
    .from('customers')
    .insert({
      business_id: businessId,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      notes: data.notes || null,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/customers');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return { error: 'No business found' };
  }

  const data = customerSchema.parse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    notes: formData.get('notes'),
  });

  const { error } = await supabase
    .from('customers')
    .update({
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)
    .eq('business_id', businessId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/customers');
  revalidatePath('/dashboard');
  return { success: true };
}

export const getCustomers = cache(async function getCustomers() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return [];
  }

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  return customers || [];
});

const DEFAULT_CUSTOMERS_PAGE_SIZE = 20;

export interface CustomersPageResult {
  items: Tables<'customers'>[];
  hasMore: boolean;
}

export const getCustomersPage = cache(async function getCustomersPage(
  limit = DEFAULT_CUSTOMERS_PAGE_SIZE,
  offset = 0
): Promise<CustomersPageResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { items: [], hasMore: false };
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return { items: [], hasMore: false };
  }

  const safeLimit = Math.max(1, Math.min(limit, 100));
  const safeOffset = Math.max(0, offset);

  const { data } = await supabase
    .from('customers')
    .select('id, name, phone, email, notes, created_at, updated_at, business_id')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .range(safeOffset, safeOffset + safeLimit);

  const items = data ?? [];
  const hasMore = items.length > safeLimit;

  return {
    items: hasMore ? items.slice(0, safeLimit) : items,
    hasMore,
  };
});

export const getCustomerCount = cache(async function getCustomerCount(): Promise<number> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return 0;
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return 0;
  }

  const { count } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId);

  return count || 0;
});
