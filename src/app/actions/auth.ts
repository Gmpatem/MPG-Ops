'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { loginSchema, registerSchema, businessSetupSchema } from '@/schemas/auth';
import { generateUniqueSlug } from '@/lib/slug';
import type { Json } from '@/lib/supabase/database.types';

export async function login(formData: FormData) {
  const data = loginSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // Check whether the account exists in our app before attempting sign-in
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', data.email)
    .maybeSingle();

  if (!profile) {
    return {
      error: 'Business account not found. Please register instead.',
      code: 'account_not_found' as const,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return {
      error: 'Wrong password.',
      code: 'wrong_password' as const,
    };
  }

  revalidatePath('/', 'layout');
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
    slug: formData.get('slug'),
    businessType: formData.get('businessType'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
  });

  // Parse operating hours if provided
  let operatingHours: Record<string, unknown> = {};
  const rawHours = formData.get('operating_hours');
  if (rawHours && typeof rawHours === 'string') {
    try {
      operatingHours = JSON.parse(rawHours);
    } catch {
      // ignore malformed JSON
    }
  }

  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Generate unique slug
  const slugBase = (data.slug ?? data.name).trim();
  const slug = await generateUniqueSlug(slugBase, async (candidate) => {
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    return !!existing;
  });

  // Create or update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email || '',
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    return { error: profileError.message };
  }

  // Create business with Pro trial
  const trialStartedAt = new Date().toISOString();
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      name: data.name,
      slug,
      business_type: data.businessType,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      operating_hours: operatingHours as Json,
      plan_tier: 'pro',
      trial_started_at: trialStartedAt,
      trial_ends_at: trialEndsAt.toISOString(),
      subscription_status: 'trialing',
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

export async function forgotPassword(formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  if (!email) {
    return { error: 'Email is required' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords don't match" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}
