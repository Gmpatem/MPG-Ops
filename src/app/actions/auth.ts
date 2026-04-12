'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema, businessSetupSchema } from '@/schemas/auth';

export async function login(formData: FormData) {
  const data = loginSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  
  // Check if user has a business
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();
    
    if (!business) {
      redirect('/onboarding');
    }
  }
  
  redirect('/dashboard');
}

export async function register(formData: FormData) {
  const data = registerSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        email: data.email,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/onboarding');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function setupBusiness(formData: FormData) {
  const data = businessSetupSchema.parse({
    name: formData.get('name'),
    businessType: formData.get('businessType'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
  });

  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Create or update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    return { error: profileError.message };
  }

  // Create business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      name: data.name,
      business_type: data.businessType,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
    })
    .select('id')
    .single();

  if (businessError) {
    return { error: businessError.message };
  }

  // Create business membership (owner role)
  const { error: memberError } = await supabase
    .from('business_members')
    .insert({
      business_id: business.id,
      user_id: user.id,
      role: 'owner',
    });

  if (memberError) {
    return { error: memberError.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
