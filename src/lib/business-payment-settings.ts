import { z } from 'zod';
import type { Json } from '@/lib/supabase/database.types';

export const BUSINESS_COUNTRIES = ['philippines', 'cameroon', 'other'] as const;
export const BUSINESS_DEFAULT_PAYMENT_METHODS = [
  'gcash_manual',
  'momo_manual',
  'manual',
] as const;
export const DEPOSIT_TYPES = ['fixed', 'full'] as const;

export const businessCountrySchema = z.enum(BUSINESS_COUNTRIES);
export const businessDefaultPaymentMethodSchema = z.enum(
  BUSINESS_DEFAULT_PAYMENT_METHODS
);
export const depositTypeSchema = z.enum(DEPOSIT_TYPES);

export type BusinessCountry = z.infer<typeof businessCountrySchema>;
export type BusinessDefaultPaymentMethod = z.infer<
  typeof businessDefaultPaymentMethodSchema
>;
export type DepositType = z.infer<typeof depositTypeSchema>;

const gcashSettingsSchema = z.object({
  accountName: z.string().trim().min(1).optional(),
  number: z.string().trim().min(1).optional(),
  qrImageUrl: z.string().trim().url().optional(),
});

const momoSettingsSchema = z.object({
  accountName: z.string().trim().min(1).optional(),
  number: z.string().trim().min(1).optional(),
  instructions: z.string().trim().min(1).optional(),
});

const businessPaymentSettingsSchema = z.object({
  depositRequired: z.boolean().optional(),
  depositType: depositTypeSchema.optional(),
  depositAmount: z.number().min(0).nullable().optional(),
  gcash: gcashSettingsSchema.optional(),
  momo: momoSettingsSchema.optional(),
});

export interface BusinessPaymentSettings {
  depositRequired: boolean;
  depositType: DepositType;
  depositAmount: number | null;
  gcash?: {
    accountName?: string;
    number?: string;
    qrImageUrl?: string;
  };
  momo?: {
    accountName?: string;
    number?: string;
    instructions?: string;
  };
}

export interface NormalizedBusinessRegionPaymentConfig {
  country: BusinessCountry;
  currency: string;
  defaultPaymentMethod: BusinessDefaultPaymentMethod;
  paymentSettings: BusinessPaymentSettings;
}

export interface PublicManualPaymentState {
  showPaymentStep: boolean;
  requiresProof: boolean;
  amountDue: number | null;
  provider: BusinessDefaultPaymentMethod | null;
  fallbackMessage: string | null;
}

const DEFAULT_PAYMENT_SETTINGS: BusinessPaymentSettings = {
  depositRequired: false,
  depositType: 'full',
  depositAmount: null,
};

function normalizeString(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeCurrencyForCountry(
  country: BusinessCountry,
  currencyInput?: string | null
): string {
  if (country === 'philippines') return 'PHP';
  if (country === 'cameroon') return 'XAF';

  const cleaned = normalizeString(currencyInput)?.toUpperCase();
  return cleaned ?? 'USD';
}

function normalizeMethodForCountry(
  country: BusinessCountry,
  methodInput?: string | null
): BusinessDefaultPaymentMethod {
  if (country === 'philippines') return 'gcash_manual';
  if (country === 'cameroon') return 'momo_manual';

  const parsed = businessDefaultPaymentMethodSchema.safeParse(methodInput);
  return parsed.success ? parsed.data : 'manual';
}

function normalizePaymentSettings(
  raw: unknown,
  input: {
    depositRequired?: boolean;
    depositType?: string | null;
    depositAmount?: number | null;
    gcashAccountName?: string | null;
    gcashNumber?: string | null;
    gcashQrImageUrl?: string | null;
    momoAccountName?: string | null;
    momoNumber?: string | null;
    momoInstructions?: string | null;
  }
): BusinessPaymentSettings {
  const parsed = businessPaymentSettingsSchema.safeParse(raw ?? {});
  const existing = parsed.success ? parsed.data : {};

  const depositRequired = input.depositRequired ?? existing.depositRequired ?? false;
  const depositTypeParsed = depositTypeSchema.safeParse(
    input.depositType ?? existing.depositType
  );
  const depositType = depositTypeParsed.success ? depositTypeParsed.data : 'full';

  const inputDepositAmount =
    input.depositAmount !== null && input.depositAmount !== undefined
      ? input.depositAmount
      : existing.depositAmount;
  const normalizedDepositAmount =
    typeof inputDepositAmount === 'number' && Number.isFinite(inputDepositAmount)
      ? Math.max(0, inputDepositAmount)
      : null;

  const gcashAccountName =
    normalizeString(input.gcashAccountName) ??
    normalizeString(existing.gcash?.accountName);
  const gcashNumber =
    normalizeString(input.gcashNumber) ?? normalizeString(existing.gcash?.number);
  const gcashQrImageUrl =
    normalizeString(input.gcashQrImageUrl) ??
    normalizeString(existing.gcash?.qrImageUrl);

  const momoAccountName =
    normalizeString(input.momoAccountName) ??
    normalizeString(existing.momo?.accountName);
  const momoNumber =
    normalizeString(input.momoNumber) ?? normalizeString(existing.momo?.number);
  const momoInstructions =
    normalizeString(input.momoInstructions) ??
    normalizeString(existing.momo?.instructions);

  const result: BusinessPaymentSettings = {
    depositRequired,
    depositType,
    depositAmount:
      depositRequired && depositType === 'fixed' ? normalizedDepositAmount : null,
  };

  if (gcashAccountName || gcashNumber || gcashQrImageUrl) {
    result.gcash = {
      ...(gcashAccountName ? { accountName: gcashAccountName } : {}),
      ...(gcashNumber ? { number: gcashNumber } : {}),
      ...(gcashQrImageUrl ? { qrImageUrl: gcashQrImageUrl } : {}),
    };
  }

  if (momoAccountName || momoNumber || momoInstructions) {
    result.momo = {
      ...(momoAccountName ? { accountName: momoAccountName } : {}),
      ...(momoNumber ? { number: momoNumber } : {}),
      ...(momoInstructions ? { instructions: momoInstructions } : {}),
    };
  }

  return result;
}

export function normalizeBusinessRegionPaymentConfig(input: {
  country?: string | null;
  currency?: string | null;
  defaultPaymentMethod?: string | null;
  paymentSettingsRaw?: Json | null;
  depositRequired?: boolean;
  depositType?: string | null;
  depositAmount?: number | null;
  gcashAccountName?: string | null;
  gcashNumber?: string | null;
  gcashQrImageUrl?: string | null;
  momoAccountName?: string | null;
  momoNumber?: string | null;
  momoInstructions?: string | null;
}): NormalizedBusinessRegionPaymentConfig {
  const normalizedCountry = businessCountrySchema.safeParse(
    normalizeString(input.country)?.toLowerCase()
  );
  const country = normalizedCountry.success ? normalizedCountry.data : 'other';

  const currency = normalizeCurrencyForCountry(country, input.currency);
  const defaultPaymentMethod = normalizeMethodForCountry(
    country,
    input.defaultPaymentMethod
  );

  const paymentSettings = normalizePaymentSettings(input.paymentSettingsRaw, {
    depositRequired: input.depositRequired,
    depositType: input.depositType,
    depositAmount: input.depositAmount,
    gcashAccountName: input.gcashAccountName,
    gcashNumber: input.gcashNumber,
    gcashQrImageUrl: input.gcashQrImageUrl,
    momoAccountName: input.momoAccountName,
    momoNumber: input.momoNumber,
    momoInstructions: input.momoInstructions,
  });

  return {
    country,
    currency,
    defaultPaymentMethod,
    paymentSettings,
  };
}

export function parseBusinessPaymentSettings(
  raw: Json | null | undefined
): BusinessPaymentSettings {
  const parsed = businessPaymentSettingsSchema.safeParse(raw ?? {});
  if (!parsed.success) {
    return { ...DEFAULT_PAYMENT_SETTINGS };
  }

  const settings = parsed.data;
  return {
    depositRequired: settings.depositRequired ?? false,
    depositType: settings.depositType ?? 'full',
    depositAmount:
      settings.depositRequired && settings.depositType === 'fixed'
        ? settings.depositAmount ?? null
        : null,
    ...(settings.gcash ? { gcash: settings.gcash } : {}),
    ...(settings.momo ? { momo: settings.momo } : {}),
  };
}

export function isPhilippinesGcashComplete(
  settings: BusinessPaymentSettings
): boolean {
  return Boolean(
    settings.gcash?.accountName &&
      settings.gcash?.number &&
      settings.gcash?.qrImageUrl
  );
}

export function computeDepositAmountDue(
  totalAmount: number,
  settings: BusinessPaymentSettings
): number | null {
  if (!settings.depositRequired) return null;
  if (settings.depositType === 'full') return Math.max(0, totalAmount);

  const fixed = settings.depositAmount ?? 0;
  if (fixed <= 0) return null;
  return Math.min(Math.max(0, fixed), Math.max(0, totalAmount));
}

export function buildPublicManualPaymentState(
  config: Pick<
    NormalizedBusinessRegionPaymentConfig,
    'country' | 'defaultPaymentMethod' | 'paymentSettings'
  >,
  totalAmount: number
): PublicManualPaymentState {
  const amountDue = computeDepositAmountDue(totalAmount, config.paymentSettings);

  if (config.country === 'philippines' && config.defaultPaymentMethod === 'gcash_manual') {
    if (!amountDue) {
      return {
        showPaymentStep: false,
        requiresProof: false,
        amountDue: null,
        provider: 'gcash_manual',
        fallbackMessage: null,
      };
    }

    if (!isPhilippinesGcashComplete(config.paymentSettings)) {
      return {
        showPaymentStep: false,
        requiresProof: false,
        amountDue: null,
        provider: 'gcash_manual',
        fallbackMessage:
          'GCash payment is not fully configured yet. You can continue booking without payment proof.',
      };
    }

    return {
      showPaymentStep: true,
      requiresProof: true,
      amountDue,
      provider: 'gcash_manual',
      fallbackMessage: null,
    };
  }

  if (config.country === 'cameroon' && config.defaultPaymentMethod === 'momo_manual') {
    const hasMomoDetails = Boolean(
      config.paymentSettings.momo?.number ||
        config.paymentSettings.momo?.accountName ||
        config.paymentSettings.momo?.instructions
    );

    return {
      showPaymentStep: true,
      requiresProof: false,
      amountDue,
      provider: 'momo_manual',
      fallbackMessage: hasMomoDetails
        ? null
        : 'Manual mobile money setup is still being configured for this business.',
    };
  }

  return {
    showPaymentStep: false,
    requiresProof: false,
    amountDue: null,
    provider: config.defaultPaymentMethod,
    fallbackMessage: null,
  };
}

export function formatCurrencyAmount(
  amount: number,
  currencyInput: string,
  options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const currency = normalizeString(currencyInput)?.toUpperCase() ?? 'PHP';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: options?.minimumFractionDigits ?? 2,
      maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    }).format(safeAmount);
  } catch {
    const symbol = currency === 'PHP' ? '₱' : currency === 'XAF' ? 'FCFA ' : `${currency} `;
    return `${symbol}${safeAmount.toFixed(options?.maximumFractionDigits ?? 2)}`;
  }
}
