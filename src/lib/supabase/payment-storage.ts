'use server';

import { createAdminClient } from '@/lib/supabase/admin';

const PUBLIC_PAYMENT_ASSETS_BUCKET = 'service-images';
const MANUAL_PAYMENT_PROOFS_BUCKET = 'payment-proofs';

const MAX_QR_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_PROOF_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function getSafeExtension(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext && /^[a-z0-9]+$/.test(ext)) return ext;
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

function ensureSupportedImageFile(file: File, maxSize: number) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Please upload a JPG, PNG, or WebP image.');
  }
  if (file.size <= 0 || file.size > maxSize) {
    throw new Error('Image file is too large.');
  }
}

export async function uploadBusinessPaymentQrImage(
  ownerId: string,
  file: File
): Promise<string> {
  ensureSupportedImageFile(file, MAX_QR_IMAGE_SIZE);

  const supabase = createAdminClient();
  const ext = getSafeExtension(file);
  const path = `business-payment/${ownerId}/gcash-qr-${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(PUBLIC_PAYMENT_ASSETS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(PUBLIC_PAYMENT_ASSETS_BUCKET)
    .getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error('Failed to create public QR image URL.');
  }

  return data.publicUrl;
}

export interface UploadedManualPaymentProof {
  path: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export async function uploadManualPaymentProof(
  businessId: string,
  file: File
): Promise<UploadedManualPaymentProof> {
  ensureSupportedImageFile(file, MAX_PROOF_IMAGE_SIZE);

  const supabase = createAdminClient();
  const ext = getSafeExtension(file);
  const path = `${businessId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(MANUAL_PAYMENT_PROOFS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  return {
    path,
    mimeType: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}
