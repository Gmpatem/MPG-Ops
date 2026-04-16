/**
 * Generate a URL-safe slug from a raw string.
 * Rules:
 * - lowercase
 * - trim spaces
 * - replace invalid chars with hyphens
 * - collapse repeated hyphens
 * - remove leading/trailing hyphens
 * - ensure non-empty
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug for a business name.
 * If the base slug is taken, appends a short numeric suffix.
 */
export async function generateUniqueSlug(
  name: string,
  existsFn: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = generateSlug(name) || 'business';
  if (!(await existsFn(base))) {
    return base;
  }

  for (let i = 2; i <= 100; i++) {
    const candidate = `${base}-${i}`;
    if (!(await existsFn(candidate))) {
      return candidate;
    }
  }

  // Fallback with timestamp if all simple suffixes exhausted
  return `${base}-${Date.now()}`;
}
