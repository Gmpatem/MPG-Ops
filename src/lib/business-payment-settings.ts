import { z } from 'zod';
import type { Json } from '@/lib/supabase/database.types';
import {
  getCountryLabel,
  getCountryOptions,
  getSuggestedCurrencyForCountry,
  normalizeCountryCode,
} from '@/lib/countries';

export const BUSINESS_DEFAULT_PAYMENT_METHODS = [
  'gcash_manual',
  'momo_manual',
  'manual',
] as const;
export const DEPOSIT_TYPES = ['fixed', 'full'] as const;

export const businessCountrySchema = z.string().trim().min(2).max(64);
export const businessDefaultPaymentMethodSchema = z.enum(
  BUSINESS_DEFAULT_PAYMENT_METHODS
);
export const depositTypeSchema = z.enum(DEPOSIT_TYPES);

export type BusinessCountry = string;
export type BusinessDefaultPaymentMethod = z.infer<
  typeof businessDefaultPaymentMethodSchema
>;
export type DepositType = z.infer<typeof depositTypeSchema>;
export type BusinessPaymentRegion = 'philippines' | 'cameroon' | 'other';

const gcashSettingsSchema = z.object({
  accountName: z.string().trim().min(1).optional(),
  number: z.string().trim().min(1).optional(),
  qrImageUrl: z.string().trim().url().optional(),
  instructions: z.string().trim().min(1).optional(),
});

const momoSettingsSchema = z.object({
  accountName: z.string().trim().min(1).optional(),
  number: z.string().trim().min(1).optional(),
  instructions: z.string().trim().min(1).optional(),
});

const manualSettingsSchema = z.object({
  instructions: z.string().trim().min(1).optional(),
});

const businessPaymentSettingsSchema = z.object({
  depositRequired: z.boolean().optional(),
  depositType: depositTypeSchema.optional(),
  depositAmount: z.number().min(0).nullable().optional(),
  gcash: gcashSettingsSchema.optional(),
  momo: momoSettingsSchema.optional(),
  manual: manualSettingsSchema.optional(),
});

export interface BusinessPaymentSettings {
  depositRequired: boolean;
  depositType: DepositType;
  depositAmount: number | null;
  gcash?: {
    accountName?: string;
    number?: string;
    qrImageUrl?: string;
    instructions?: string;
  };
  momo?: {
    accountName?: string;
    number?: string;
    instructions?: string;
  };
  manual?: {
    instructions?: string;
  };
}

export interface NormalizedBusinessRegionPaymentConfig {
  country: string;
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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function normalizeString(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readFirstString(
  raw: Record<string, unknown> | null,
  keys: string[]
): string | undefined {
  if (!raw) return undefined;

  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'string') {
      const normalized = normalizeString(value);
      if (normalized) return normalized;
    }
  }

  return undefined;
}

function readFirstBoolean(
  raw: Record<string, unknown> | null,
  keys: string[]
): boolean | undefined {
  if (!raw) return undefined;

  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'boolean') {
      return value;
    }
  }

  return undefined;
}

function readFirstNumber(
  raw: Record<string, unknown> | null,
  keys: string[]
): number | undefined {
  if (!raw) return undefined;

  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

export function getPaymentRegionForCountry(
  countryInput: string | null | undefined
): BusinessPaymentRegion {
  const normalized = normalizeCountryCode(countryInput);
  if (normalized === 'PH') return 'philippines';
  if (normalized === 'CM') return 'cameroon';
  return 'other';
}

export function getSuggestedPaymentMethodForCountry(
  countryInput: string | null | undefined
): BusinessDefaultPaymentMethod {
  const region = getPaymentRegionForCountry(countryInput);
  if (region === 'philippines') return 'gcash_manual';
  if (region === 'cameroon') return 'momo_manual';
  return 'manual';
}

export function getPaymentMethodOptionsForCountry(
  countryInput: string | null | undefined
): BusinessDefaultPaymentMethod[] {
  const region = getPaymentRegionForCountry(countryInput);

  if (region === 'philippines') {
    return ['gcash_manual', 'manual'];
  }

  if (region === 'cameroon') {
    return ['momo_manual', 'manual'];
  }

  return ['manual'];
}

function normalizeCurrencyForCountry(
  country: string,
  currencyInput?: string | null
): string {
  return getSuggestedCurrencyForCountry(country, currencyInput);
}

function normalizeMethodForCountry(
  country: string,
  methodInput?: string | null
): BusinessDefaultPaymentMethod {
  const normalizedMethodInput = normalizeString(methodInput)?.toLowerCase();
  const methodWithAliases =
    normalizedMethodInput === 'gcash'
      ? 'gcash_manual'
      : normalizedMethodInput === 'momo'
      ? 'momo_manual'
      : normalizedMethodInput;

  const parsed = businessDefaultPaymentMethodSchema.safeParse(methodWithAliases);
  if (parsed.success) {
    return parsed.data;
  }

  return getSuggestedPaymentMethodForCountry(country);
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
    gcashInstructions?: string | null;
    momoAccountName?: string | null;
    momoNumber?: string | null;
    momoInstructions?: string | null;
    manualInstructions?: string | null;
  }
): BusinessPaymentSettings {
  const rawRecord = asRecord(raw);
  const parsed = businessPaymentSettingsSchema.safeParse(raw ?? {});
  const existing = parsed.success ? parsed.data : {};
  const legacyDepositRequired = readFirstBoolean(rawRecord, ['depositRequired']);
  const legacyDepositType = readFirstString(rawRecord, ['depositType']);
  const legacyDepositAmount = readFirstNumber(rawRecord, ['depositAmount']);

  const depositRequired =
    input.depositRequired ??
    existing.depositRequired ??
    legacyDepositRequired ??
    false;
  const depositTypeParsed = depositTypeSchema.safeParse(
    input.depositType ?? existing.depositType ?? legacyDepositType
  );
  const depositType = depositTypeParsed.success ? depositTypeParsed.data : 'full';

  const inputDepositAmount =
    input.depositAmount !== null && input.depositAmount !== undefined
      ? input.depositAmount
      : existing.depositAmount ?? legacyDepositAmount;
  const normalizedDepositAmount =
    typeof inputDepositAmount === 'number' && Number.isFinite(inputDepositAmount)
      ? Math.max(0, inputDepositAmount)
      : null;

  const legacyGcashAccountName = readFirstString(rawRecord, [
    'accountName',
    'gcashAccountName',
  ]);
  const legacyGcashNumber = readFirstString(rawRecord, ['number', 'gcashNumber']);
  const legacyGcashQrImageUrl = readFirstString(rawRecord, [
    'qrImageUrl',
    'gcashQrImageUrl',
  ]);
  const legacyGcashInstructions = readFirstString(rawRecord, [
    'instructions',
    'gcashInstructions',
  ]);

  const gcashAccountName =
    normalizeString(input.gcashAccountName) ??
    normalizeString(existing.gcash?.accountName) ??
    legacyGcashAccountName;
  const gcashNumber =
    normalizeString(input.gcashNumber) ??
    normalizeString(existing.gcash?.number) ??
    legacyGcashNumber;
  const gcashQrImageUrl =
    normalizeString(input.gcashQrImageUrl) ??
    normalizeString(existing.gcash?.qrImageUrl) ??
    legacyGcashQrImageUrl;
  const gcashInstructions =
    normalizeString(input.gcashInstructions) ??
    normalizeString(existing.gcash?.instructions) ??
    legacyGcashInstructions;

  const legacyMomoAccountName = readFirstString(rawRecord, ['momoAccountName']);
  const legacyMomoNumber = readFirstString(rawRecord, ['momoNumber']);
  const legacyMomoInstructions = readFirstString(rawRecord, ['momoInstructions']);

  const momoAccountName =
    normalizeString(input.momoAccountName) ??
    normalizeString(existing.momo?.accountName) ??
    legacyMomoAccountName;
  const momoNumber =
    normalizeString(input.momoNumber) ??
    normalizeString(existing.momo?.number) ??
    legacyMomoNumber;
  const momoInstructions =
    normalizeString(input.momoInstructions) ??
    normalizeString(existing.momo?.instructions) ??
    legacyMomoInstructions;

  const legacyManualInstructions = readFirstString(rawRecord, ['manualInstructions']);

  const manualInstructions =
    normalizeString(input.manualInstructions) ??
    normalizeString(existing.manual?.instructions) ??
    legacyManualInstructions;

  const result: BusinessPaymentSettings = {
    depositRequired,
    depositType,
    depositAmount:
      depositRequired && depositType === 'fixed' ? normalizedDepositAmount : null,
  };

  if (gcashAccountName || gcashNumber || gcashQrImageUrl || gcashInstructions) {
    result.gcash = {
      ...(gcashAccountName ? { accountName: gcashAccountName } : {}),
      ...(gcashNumber ? { number: gcashNumber } : {}),
      ...(gcashQrImageUrl ? { qrImageUrl: gcashQrImageUrl } : {}),
      ...(gcashInstructions ? { instructions: gcashInstructions } : {}),
    };
  }

  if (momoAccountName || momoNumber || momoInstructions) {
    result.momo = {
      ...(momoAccountName ? { accountName: momoAccountName } : {}),
      ...(momoNumber ? { number: momoNumber } : {}),
      ...(momoInstructions ? { instructions: momoInstructions } : {}),
    };
  }

  if (manualInstructions) {
    result.manual = { instructions: manualInstructions };
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
  gcashInstructions?: string | null;
  momoAccountName?: string | null;
  momoNumber?: string | null;
  momoInstructions?: string | null;
  manualInstructions?: string | null;
}): NormalizedBusinessRegionPaymentConfig {
  const country = normalizeCountryCode(input.country);

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
    gcashInstructions: input.gcashInstructions,
    momoAccountName: input.momoAccountName,
    momoNumber: input.momoNumber,
    momoInstructions: input.momoInstructions,
    manualInstructions: input.manualInstructions,
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
  const normalized = normalizePaymentSettings(raw ?? {}, {});
  return normalized ?? { ...DEFAULT_PAYMENT_SETTINGS };
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
  const region = getPaymentRegionForCountry(config.country);

  if (config.defaultPaymentMethod === 'gcash_manual') {
    if (config.paymentSettings.depositRequired && amountDue === null) {
      return {
        showPaymentStep: false,
        requiresProof: false,
        amountDue: null,
        provider: 'gcash_manual',
        fallbackMessage:
          'Deposit is enabled but amount is not configured yet. You can continue booking while the business updates payment settings.',
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

    if (amountDue === null) {
      return {
        showPaymentStep: true,
        requiresProof: false,
        amountDue: null,
        provider: 'gcash_manual',
        fallbackMessage: null,
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

  if (config.defaultPaymentMethod === 'momo_manual') {
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

  const hasManualInstructions = Boolean(config.paymentSettings.manual?.instructions);
  if (hasManualInstructions || amountDue !== null || region === 'other') {
    return {
      showPaymentStep: hasManualInstructions || amountDue !== null,
      requiresProof: false,
      amountDue,
      provider: 'manual',
      fallbackMessage: null,
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

export {
  getCountryLabel,
  getCountryOptions,
  normalizeCountryCode,
  getSuggestedCurrencyForCountry,
};
