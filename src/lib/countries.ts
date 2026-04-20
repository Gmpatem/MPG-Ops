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

const ISO_COUNTRY_CODES_FALLBACK = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU',
  'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL',
  'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC',
  'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV',
  'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG',
  'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD',
  'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT',
  'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM',
  'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH',
  'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK',
  'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH',
  'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW',
  'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR',
  'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR',
  'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC',
  'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL',
  'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY',
  'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA',
  'ZM', 'ZW',
] as const;

let cachedCountryOptions: CountryOption[] | null = null;

function buildCountryOptions(): CountryOption[] {
  const sourceCodes = [...ISO_COUNTRY_CODES_FALLBACK];

  let displayNames: Intl.DisplayNames | null = null;
  try {
    displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  } catch {
    displayNames = null;
  }

  const options = sourceCodes
    .map((code) => ({
      code,
      label: displayNames?.of(code) ?? code,
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
