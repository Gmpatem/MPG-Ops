'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceSchema } from '@/schemas/service';
import { uploadServiceImage, deleteServiceImage } from '@/lib/supabase/storage';
import type { Tables } from '@/lib/supabase/database.types';

async function getCurrentBusinessId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  
  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', userId)
    .single();
  
  return membership?.business_id || null;
}

export async function createService(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return { error: 'No business found' };
  }

  const data = serviceSchema.parse({
    name: formData.get('name'),
    category: formData.get('category'),
    durationMinutes: formData.get('durationMinutes'),
    price: formData.get('price'),
    isActive: formData.get('isActive') === 'true',
  });

  const { data: newService, error: insertError } = await supabase
    .from('services')
    .insert({
      business_id: businessId,
      name: data.name,
      category: data.category || null,
      duration_minutes: data.durationMinutes,
      price: data.price,
      is_active: data.isActive,
    })
    .select('id')
    .single();

  if (insertError || !newService) {
    return { error: insertError?.message ?? 'Failed to create service' };
  }

  // Handle image upload
  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      const publicUrl = await uploadServiceImage(businessId, newService.id, imageFile);
      if (publicUrl) {
        await supabase
          .from('services')
          .update({ image_url: publicUrl })
          .eq('id', newService.id)
          .eq('business_id', businessId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed';
      // We don't fail the whole creation, but we could log this
      console.error('Service image upload failed:', message);
    }
  }

  revalidatePath('/services');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateService(serviceId: string, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return { error: 'No business found' };
  }

  const data = serviceSchema.parse({
    name: formData.get('name'),
    category: formData.get('category'),
    durationMinutes: formData.get('durationMinutes'),
    price: formData.get('price'),
    isActive: formData.get('isActive') === 'true',
  });

  const { error } = await supabase
    .from('services')
    .update({
      name: data.name,
      category: data.category || null,
      duration_minutes: data.durationMinutes,
      price: data.price,
      is_active: data.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', serviceId)
    .eq('business_id', businessId);

  if (error) {
    return { error: error.message };
  }

  // Handle image upload or removal
  const imageFile = formData.get('image') as File | null;
  const shouldRemoveImage = formData.get('removeImage') === 'true';

  if (shouldRemoveImage) {
    const { data: existing } = await supabase
      .from('services')
      .select('image_url')
      .eq('id', serviceId)
      .eq('business_id', businessId)
      .single();
    if (existing?.image_url) {
      await deleteServiceImage(existing.image_url);
      await supabase
        .from('services')
        .update({ image_url: null })
        .eq('id', serviceId)
        .eq('business_id', businessId);
    }
  } else if (imageFile && imageFile.size > 0) {
    try {
      // Delete old image if exists
      const { data: existing } = await supabase
        .from('services')
        .select('image_url')
        .eq('id', serviceId)
        .eq('business_id', businessId)
        .single();
      if (existing?.image_url) {
        await deleteServiceImage(existing.image_url);
      }

      const publicUrl = await uploadServiceImage(businessId, serviceId, imageFile);
      if (publicUrl) {
        await supabase
          .from('services')
          .update({ image_url: publicUrl })
          .eq('id', serviceId)
          .eq('business_id', businessId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed';
      console.error('Service image upload failed:', message);
    }
  }

  revalidatePath('/services');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function toggleServiceStatus(serviceId: string, isActive: boolean) {
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
    .from('services')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', serviceId)
    .eq('business_id', businessId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/services');
  return { success: true };
}

export async function getServices(): Promise<Tables<'services'>[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const businessId = await getCurrentBusinessId(user.id);
  if (!businessId) {
    return [];
  }

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  return services ?? [];
}

export async function getServiceCount(): Promise<number> {
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
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId);

  return count || 0;
}
