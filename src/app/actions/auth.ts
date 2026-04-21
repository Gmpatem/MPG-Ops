'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { loginSchema, registerSchema, businessSetupSchema } from '@/schemas/auth';
import { generateUniqueSlug } from '@/lib/slug';
import type { Json } from '@/lib/supabase/database.types';
import { normalizeBusinessRegionPaymentConfig } from '@/lib/business-payment-settings';
import { uploadBusinessPaymentQrImage } from '@/lib/supabase/payment-storage';
import { getPostAuthRoute } from '@/lib/auth-routing';
import { computeSetupChecklist, syncSetupState } from '@/lib/onboarding';

export async function login(formData: FormData) {
  const data = loginSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // Check whether the account exists in our app before attempting sign-in
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('id, is_platform_admin')
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  revalidatePath('/', 'layout');
  const route = await getPostAuthRoute(supabase, user!.id, data.email);
  redirect(route);
}

export async function register(formData: FormData) {
  const data = registerSchema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { email: data.email },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: 'Check your email to confirm your account and continue onboarding.',
  };
}

export async function signInWithMagicLink(formData: FormData) {
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      // Creates a new account if the email is not registered yet
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
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
    country: formData.get('country'),
    currency: formData.get('currency'),
    defaultPaymentMethod: formData.get('defaultPaymentMethod'),
    depositRequired: formData.get('depositRequired'),
    depositType: formData.get('depositType'),
    depositAmount: formData.get('depositAmount'),
    gcashAccountName: formData.get('gcashAccountName'),
    gcashNumber: formData.get('gcashNumber'),
    gcashQrImageUrl: formData.get('gcashQrImageUrl'),
    gcashInstructions: formData.get('gcashInstructions'),
    momoAccountName: formData.get('momoAccountName'),
    momoNumber: formData.get('momoNumber'),
    momoInstructions: formData.get('momoInstructions'),
    manualInstructions: formData.get('manualInstructions'),
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

  let uploadedGcashQrImageUrl: string | null = null;
  const maybeGcashQrFile = formData.get('gcashQrFile');
  if (maybeGcashQrFile instanceof File && maybeGcashQrFile.size > 0) {
    try {
      uploadedGcashQrImageUrl = await uploadBusinessPaymentQrImage(
        user.id,
        maybeGcashQrFile
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload GCash QR image';
      return { error: message };
    }
  }

  const normalizedRegionPayment = normalizeBusinessRegionPaymentConfig({
    country: data.country,
    currency: data.currency,
    defaultPaymentMethod: data.defaultPaymentMethod,
    depositRequired: data.depositRequired,
    depositType: data.depositType,
    depositAmount: data.depositAmount,
    gcashAccountName: data.gcashAccountName,
    gcashNumber: data.gcashNumber,
    gcashQrImageUrl: uploadedGcashQrImageUrl ?? data.gcashQrImageUrl,
    gcashInstructions: data.gcashInstructions,
    momoAccountName: data.momoAccountName,
    momoNumber: data.momoNumber,
    momoInstructions: data.momoInstructions,
    manualInstructions: data.manualInstructions,
  });

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

  // Ensure profile row exists; mark onboarding as started
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email || '',
      onboarding_status: 'in_progress',
      onboarding_started_at: new Date().toISOString(),
      last_onboarding_step: 'payment_setup',
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    return { error: profileError.message };
  }

  // Create business with Pro trial
  const trialStartedAt = new Date().toISOString();
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const baseBusinessPayload = {
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
  };

  let business: { id: string } | null = null;
  let businessError: { message: string } | null = null;

  {
    const insertResult = await supabase
      .from('businesses')
      .insert({
        ...baseBusinessPayload,
        country: normalizedRegionPayment.country,
        currency: normalizedRegionPayment.currency,
        default_payment_method: normalizedRegionPayment.defaultPaymentMethod,
        payment_settings:
          normalizedRegionPayment.paymentSettings as unknown as Json,
      })
      .select('id')
      .single();

    business = insertResult.data;
    businessError = insertResult.error
      ? { message: insertResult.error.message }
      : null;
  }

  if (businessError && /column .* does not exist/i.test(businessError.message)) {
    const fallbackInsertResult = await supabase
      .from('businesses')
      .insert(baseBusinessPayload)
      .select('id')
      .single();

    business = fallbackInsertResult.data;
    businessError = fallbackInsertResult.error
      ? { message: fallbackInsertResult.error.message }
      : null;
  }

  if (businessError) {
    return { error: businessError.message };
  }

  if (!business) {
    return { error: 'Failed to create business' };
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

  // Sync onboarding completion state
  // (no services yet right after wizard — first_service will be filled later)
  const checklist = computeSetupChecklist(
    { name: data.name, business_type: data.businessType, phone: data.phone || null },
    false
  );
  await syncSetupState(supabase, user.id, business.id, checklist);

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
