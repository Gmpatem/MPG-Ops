export interface CountryOption {
  code: string;
  label: string;
}

const LEGACY_COUNTRY_TO_CODE: Record<string, string> = {
  philippines: 'PH',
  cameroon: 'CM',
  other: 'OTHER',
};

const PRIMARY_CURRENCY_BY_COUNTRY: Record<string, string> = {
  PH: 'PHP',
  CM: 'XAF',
};

let cachedCountryOptions: CountryOption[] | null = null;

function buildCountryOptions(): CountryOption[] {
  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  const intlWithSupportedValues = Intl as unknown as {
    supportedValuesOf?: (key: string) => string[];
  };
  const regionCodes =
    typeof intlWithSupportedValues.supportedValuesOf === 'function'
      ? intlWithSupportedValues.supportedValuesOf('region')
      : [];

  const options = regionCodes
    .filter((code) => /^[A-Z]{2}$/.test(code))
    .map((code) => ({
      code,
      label: displayNames.of(code) ?? code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return [{ code: 'OTHER', label: 'Other' }, ...options];
}

export function getCountryOptions(): CountryOption[] {
  if (!cachedCountryOptions) {
    cachedCountryOptions = buildCountryOptions();
  }
  return cachedCountryOptions;
}

export function getCountryLabel(countryCode: string | null | undefined): string {
  const normalizedCode = normalizeCountryCode(countryCode);
  if (normalizedCode === 'OTHER') return 'Other';

  const option = getCountryOptions().find((item) => item.code === normalizedCode);
  return option?.label ?? normalizedCode;
}

export function normalizeCountryCode(
  countryInput: string | null | undefined
): string {
  if (!countryInput) return 'OTHER';

  const trimmed = countryInput.trim();
  if (!trimmed) return 'OTHER';

  const normalizedUpper = trimmed.toUpperCase();
  if (normalizedUpper === 'OTHER') return 'OTHER';
  if (/^[A-Z]{2}$/.test(normalizedUpper)) return normalizedUpper;

  const legacyCode = LEGACY_COUNTRY_TO_CODE[trimmed.toLowerCase()];
  if (legacyCode) return legacyCode;

  const option = getCountryOptions().find(
    (item) => item.label.toLowerCase() === trimmed.toLowerCase()
  );
  return option?.code ?? 'OTHER';
}

export function getSuggestedCurrencyForCountry(
  countryCode: string,
  fallbackCurrency?: string | null
): string {
  const normalized = normalizeCountryCode(countryCode);
  const knownCurrency = PRIMARY_CURRENCY_BY_COUNTRY[normalized];
  if (knownCurrency) return knownCurrency;

  const cleanedFallback = fallbackCurrency?.trim().toUpperCase();
  return cleanedFallback || 'USD';
}
