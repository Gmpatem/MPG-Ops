'use server';

import { createClient } from './server';

const BUCKET_NAME = 'service-images';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function isValidImageFile(file: File): boolean {
  if (!file.type.startsWith('image/')) return false;
  if (file.size > MAX_FILE_SIZE) return false;
  return true;
}

/**
 * Upload a service image to Supabase Storage.
 * Returns the public URL on success, or null if no valid file provided.
 * Throws on error.
 */
export async function uploadServiceImage(
  businessId: string,
  serviceId: string,
  file: File
): Promise<string | null> {
  if (!isValidImageFile(file)) return null;

  const supabase = await createClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const path = `${businessId}/${serviceId}-${timestamp}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
}

/**
 * Delete a service image from Supabase Storage given its public URL.
 * Best-effort: does not throw on failure.
 */
export async function deleteServiceImage(imageUrl: string): Promise<void> {
  try {
    const supabase = await createClient();
    const url = new URL(imageUrl);
    // Path looks like /storage/v1/object/public/service-images/{businessId}/{fileName}
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.indexOf('public');
    if (bucketIndex === -1 || bucketIndex + 1 >= pathParts.length) return;
    const path = pathParts.slice(bucketIndex + 2).join('/'); // skip 'public' and bucket name
    if (!path) return;

    await supabase.storage.from(BUCKET_NAME).remove([path]);
  } catch {
    // Best-effort deletion
  }
}
