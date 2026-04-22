'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { setupBusiness } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OperatingHoursEditor } from '@/components/operating-hours-editor';
import { generateSlug } from '@/lib/slug';
import {
  type BusinessCountry,
  type BusinessDefaultPaymentMethod,
  type DepositType,
  getCountryLabel,
  getCountryOptions,
  getPaymentMethodOptionsForCountry,
  getPaymentRegionForCountry,
  getSuggestedCurrencyForCountry,
  getSuggestedPaymentMethodForCountry,
} from '@/lib/business-payment-settings';
import { ChevronLeft, CreditCard, MapPin, Phone, Store } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-provider';

const businessTypes = [
  { value: 'salon', label: 'Salon', icon: '✂️' },
  { value: 'barbershop', label: 'Barbershop', icon: '💈' },
  { value: 'spa', label: 'Spa', icon: '🧘' },
];

const paymentMethodLabels: Record<BusinessDefaultPaymentMethod, string> = {
  gcash_manual: 'GCash (Manual)',
  momo_manual: 'MoMo (Manual)',
  manual: 'Manual',
};

type Step = 1 | 2 | 3 | 4;

const ONBOARDING_DRAFT_KEY = 'mpg-ops:onboarding:business-setup-draft:v1';
const SUPPORTED_COUNTRIES: BusinessCountry[] = ['PH', 'CM', 'US', 'FR'];
const SUPPORTED_PAYMENT_METHODS: BusinessDefaultPaymentMethod[] = [
  'gcash_manual',
  'momo_manual',
  'manual',
];
const SUPPORTED_DEPOSIT_TYPES: DepositType[] = ['fixed', 'full'];

interface OnboardingDraft {
  step: Step;
  name: string;
  slug: string;
  businessType: string;
  phone: string;
  email: string;
  address: string;
  country: BusinessCountry;
  currency: string;
  defaultPaymentMethod: BusinessDefaultPaymentMethod;
  hasEditedPaymentMethod: boolean;
  gcashAccountName: string;
  gcashNumber: string;
  gcashQrImageUrl: string;
  gcashInstructions: string;
  depositRequired: boolean;
  depositType: DepositType;
  depositAmount: string;
  momoAccountName: string;
  momoNumber: string;
  momoInstructions: string;
  manualInstructions: string;
  hasEditedSlug: boolean;
}

function loadOnboardingDraft(): Partial<OnboardingDraft> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const rawDraft = window.sessionStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!rawDraft) {
      return {};
    }

    const draft = JSON.parse(rawDraft) as Partial<OnboardingDraft>;

    return {
      step:
        draft.step === 1 || draft.step === 2 || draft.step === 3 || draft.step === 4
          ? draft.step
          : 1,
      name: typeof draft.name === 'string' ? draft.name : '',
      slug: typeof draft.slug === 'string' ? draft.slug : '',
      businessType: typeof draft.businessType === 'string' ? draft.businessType : '',
      phone: typeof draft.phone === 'string' ? draft.phone : '',
      email: typeof draft.email === 'string' ? draft.email : '',
      address: typeof draft.address === 'string' ? draft.address : '',
      country:
        draft.country && SUPPORTED_COUNTRIES.includes(draft.country)
          ? draft.country
          : 'PH',
      currency: typeof draft.currency === 'string' ? draft.currency : 'PHP',
      defaultPaymentMethod:
        draft.defaultPaymentMethod &&
        SUPPORTED_PAYMENT_METHODS.includes(draft.defaultPaymentMethod)
          ? draft.defaultPaymentMethod
          : 'gcash_manual',
      hasEditedPaymentMethod:
        typeof draft.hasEditedPaymentMethod === 'boolean'
          ? draft.hasEditedPaymentMethod
          : false,
      gcashAccountName:
        typeof draft.gcashAccountName === 'string' ? draft.gcashAccountName : '',
      gcashNumber: typeof draft.gcashNumber === 'string' ? draft.gcashNumber : '',
      gcashQrImageUrl:
        typeof draft.gcashQrImageUrl === 'string' ? draft.gcashQrImageUrl : '',
      gcashInstructions:
        typeof draft.gcashInstructions === 'string' ? draft.gcashInstructions : '',
      depositRequired:
        typeof draft.depositRequired === 'boolean' ? draft.depositRequired : false,
      depositType:
        draft.depositType && SUPPORTED_DEPOSIT_TYPES.includes(draft.depositType)
          ? draft.depositType
          : 'full',
      depositAmount:
        typeof draft.depositAmount === 'string' ? draft.depositAmount : '',
      momoAccountName:
        typeof draft.momoAccountName === 'string' ? draft.momoAccountName : '',
      momoNumber: typeof draft.momoNumber === 'string' ? draft.momoNumber : '',
      momoInstructions:
        typeof draft.momoInstructions === 'string' ? draft.momoInstructions : '',
      manualInstructions:
        typeof draft.manualInstructions === 'string' ? draft.manualInstructions : '',
      hasEditedSlug:
        typeof draft.hasEditedSlug === 'boolean' ? draft.hasEditedSlug : false,
    };
  } catch {
    return {};
  }
}

export function BusinessSetupForm() {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [initialDraft] = useState<Partial<OnboardingDraft>>(() =>
    loadOnboardingDraft()
  );

  const [step, setStep] = useState<Step>(initialDraft.step ?? 1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Business basics
  const [name, setName] = useState(initialDraft.name ?? '');
  const [slug, setSlug] = useState(initialDraft.slug ?? '');
  const [businessType, setBusinessType] = useState(initialDraft.businessType ?? '');
  const [phone, setPhone] = useState(initialDraft.phone ?? '');
  const [email, setEmail] = useState(initialDraft.email ?? '');
  const [address, setAddress] = useState(initialDraft.address ?? '');

  // Region/payment setup
  const [country, setCountry] = useState<BusinessCountry>(initialDraft.country ?? 'PH');
  const [currency, setCurrency] = useState(initialDraft.currency ?? 'PHP');
  const [defaultPaymentMethod, setDefaultPaymentMethod] =
    useState<BusinessDefaultPaymentMethod>(
      initialDraft.defaultPaymentMethod ?? 'gcash_manual'
    );
  const [hasEditedPaymentMethod, setHasEditedPaymentMethod] = useState(
    initialDraft.hasEditedPaymentMethod ?? false
  );

  const [gcashAccountName, setGcashAccountName] = useState(
    initialDraft.gcashAccountName ?? ''
  );
  const [gcashNumber, setGcashNumber] = useState(initialDraft.gcashNumber ?? '');
  const [gcashQrImageUrl, setGcashQrImageUrl] = useState(
    initialDraft.gcashQrImageUrl ?? ''
  );
  const [gcashInstructions, setGcashInstructions] = useState(
    initialDraft.gcashInstructions ?? ''
  );

  const [depositRequired, setDepositRequired] = useState(
    initialDraft.depositRequired ?? false
  );
  const [depositType, setDepositType] = useState<DepositType>(
    initialDraft.depositType ?? 'full'
  );
  const [depositAmount, setDepositAmount] = useState(
    initialDraft.depositAmount ?? ''
  );

  const [momoAccountName, setMomoAccountName] = useState(
    initialDraft.momoAccountName ?? ''
  );
  const [momoNumber, setMomoNumber] = useState(initialDraft.momoNumber ?? '');
  const [momoInstructions, setMomoInstructions] = useState(
    initialDraft.momoInstructions ?? ''
  );
  const [manualInstructions, setManualInstructions] = useState(
    initialDraft.manualInstructions ?? ''
  );

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [hasEditedSlug, setHasEditedSlug] = useState(
    initialDraft.hasEditedSlug ?? false
  );

  const progressPercent = useMemo(() => {
    const pct: Record<Step, number> = { 1: 25, 2: 50, 3: 75, 4: 100 };
    return pct[step];
  }, [step]);
  const countryOptions = useMemo(() => getCountryOptions(), []);
  const paymentRegion = getPaymentRegionForCountry(country);
  const suggestedPaymentMethod = getSuggestedPaymentMethodForCountry(country);
  const paymentMethodOptions = getPaymentMethodOptionsForCountry(country);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const draft: OnboardingDraft = {
      step,
      name,
      slug,
      businessType,
      phone,
      email,
      address,
      country,
      currency,
      defaultPaymentMethod,
      hasEditedPaymentMethod,
      gcashAccountName,
      gcashNumber,
      gcashQrImageUrl,
      gcashInstructions,
      depositRequired,
      depositType,
      depositAmount,
      momoAccountName,
      momoNumber,
      momoInstructions,
      manualInstructions,
      hasEditedSlug,
    };

    window.sessionStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  }, [
    step,
    name,
    slug,
    businessType,
    phone,
    email,
    address,
    country,
    currency,
    defaultPaymentMethod,
    hasEditedPaymentMethod,
    gcashAccountName,
    gcashNumber,
    gcashQrImageUrl,
    gcashInstructions,
    depositRequired,
    depositType,
    depositAmount,
    momoAccountName,
    momoNumber,
    momoInstructions,
    manualInstructions,
    hasEditedSlug,
  ]);

  function handleCountryChange(nextCountry: BusinessCountry) {
    setCountry(nextCountry);

    const suggestedMethod = getSuggestedPaymentMethodForCountry(nextCountry);
    const methodOptions = getPaymentMethodOptionsForCountry(nextCountry);
    const suggestedCurrency = getSuggestedCurrencyForCountry(nextCountry, currency);

    setCurrency(suggestedCurrency);

    setDefaultPaymentMethod((prev) => {
      if (hasEditedPaymentMethod && methodOptions.includes(prev)) {
        return prev;
      }
      return suggestedMethod;
    });
  }

  function validateStep(current: Step): boolean {
    const errs: Record<string, string> = {};

    if (current === 1) {
      if (!name.trim()) errs.name = t('onboarding.errors.nameRequired');
      if (!businessType) errs.businessType = t('onboarding.errors.typeRequired');
      if (!slug.trim()) errs.slug = t('onboarding.errors.slugRequired');
    }

    if (current === 2) {
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errs.email = t('onboarding.errors.emailInvalid');
      }
    }

    if (current === 4) {
      if (paymentRegion === 'other' && !currency.trim()) {
        errs.currency = 'Please add your currency.';
      }

      if (defaultPaymentMethod === 'gcash_manual') {
        if (!gcashAccountName.trim()) {
          errs.gcashAccountName = 'GCash account name is required.';
        }
        if (!gcashNumber.trim()) {
          errs.gcashNumber = 'GCash number is required.';
        }

        const fileInput = formRef.current?.elements.namedItem(
          'gcashQrFile'
        ) as HTMLInputElement | null;
        const hasQrFile = Boolean(fileInput?.files?.length);
        if (!gcashQrImageUrl.trim() && !hasQrFile) {
          errs.gcashQr = 'Add a GCash QR URL or upload a QR image.';
        }

        if (depositRequired && depositType === 'fixed') {
          const amount = Number(depositAmount);
          if (!Number.isFinite(amount) || amount <= 0) {
            errs.depositAmount = 'Deposit amount must be greater than 0.';
          }
        }
      }
    }

    setStepErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 4) as Step);
    }
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1) as Step);
    setStepErrors({});
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await setupBusiness(formData);

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
      }
    } catch {
      // Redirect-driven success paths can short-circuit promise handling.
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
      }
    }
  }

  const handleNameChange = (value: string) => {
    setName(value);
    if (!hasEditedSlug) {
      setSlug(generateSlug(value));
    }
  };

  const summary = [
    { label: t('common.businessName'), value: name },
    { label: t('onboarding.slug'), value: slug },
    {
      label: t('onboarding.businessType'),
      value:
        businessTypes.find((businessTypeOption) => businessTypeOption.value === businessType)
          ?.label || businessType,
    },
    { label: t('common.phone'), value: phone || '—' },
    { label: t('common.businessEmail'), value: email || '—' },
    { label: t('common.address'), value: address || '—' },
    { label: 'Country', value: getCountryLabel(country) },
    { label: 'Currency', value: currency || '—' },
    {
      label: 'Default payment',
      value: paymentMethodLabels[defaultPaymentMethod],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>{t('onboarding.step', { step })}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-[var(--duration-slow)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form
        ref={formRef}
        action={handleSubmit}
        className="space-y-5"
        onSubmit={(event) => {
          if (step !== 4) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="businessType" value={businessType} />
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="address" value={address} />
        <input type="hidden" name="country" value={country} />
        <input type="hidden" name="currency" value={currency} />
        <input
          type="hidden"
          name="defaultPaymentMethod"
          value={defaultPaymentMethod}
        />
        <input
          type="hidden"
          name="depositRequired"
          value={depositRequired ? 'true' : 'false'}
        />
        <input type="hidden" name="depositType" value={depositType} />
        <input type="hidden" name="depositAmount" value={depositAmount} />
        <input
          type="hidden"
          name="gcashAccountName"
          value={gcashAccountName}
        />
        <input type="hidden" name="gcashNumber" value={gcashNumber} />
        <input
          type="hidden"
          name="gcashQrImageUrl"
          value={gcashQrImageUrl}
        />
        <input
          type="hidden"
          name="gcashInstructions"
          value={gcashInstructions}
        />
        <input type="hidden" name="momoAccountName" value={momoAccountName} />
        <input type="hidden" name="momoNumber" value={momoNumber} />
        <input
          type="hidden"
          name="momoInstructions"
          value={momoInstructions}
        />
        <input
          type="hidden"
          name="manualInstructions"
          value={manualInstructions}
        />

        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('onboarding.businessBasics')}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('onboarding.businessBasicsDesc')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t('common.businessName')}</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Glamour Salon"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
                className={`h-14 text-base ${stepErrors.name ? 'border-destructive' : ''}`}
              />
              {stepErrors.name && (
                <p className="text-sm text-destructive">{stepErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">{t('onboarding.slug')}</Label>
              <Input
                id="slug"
                type="text"
                placeholder="glamour-salon"
                value={slug}
                onChange={(event) => {
                  setSlug(generateSlug(event.target.value));
                  setHasEditedSlug(true);
                }}
                className={`h-14 text-base ${stepErrors.slug ? 'border-destructive' : ''}`}
              />
              <p className="text-xs text-muted-foreground">{t('onboarding.slugDesc')}</p>
              {stepErrors.slug && (
                <p className="text-sm text-destructive">{stepErrors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">{t('onboarding.businessType')}</Label>
              <Select
                value={businessType}
                onValueChange={(value) => setBusinessType(value ?? '')}
              >
                <SelectTrigger
                  className={`h-14 text-base ${stepErrors.businessType ? 'border-destructive' : ''}`}
                >
                  <SelectValue placeholder={t('onboarding.selectBusinessType')} />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((businessTypeOption) => (
                    <SelectItem
                      key={businessTypeOption.value}
                      value={businessTypeOption.value}
                    >
                      <span className="mr-2">{businessTypeOption.icon}</span>
                      {businessTypeOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stepErrors.businessType && (
                <p className="text-sm text-destructive">{stepErrors.businessType}</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('onboarding.contactDetails')}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('onboarding.contactDetailsDesc')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                {t('common.phone')}{' '}
                <span className="font-normal text-muted-foreground">
                  ({t('common.optional')})
                </span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-14 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {t('common.businessEmail')}{' '}
                <span className="font-normal text-muted-foreground">
                  ({t('common.optional')})
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="business@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`h-14 text-base ${stepErrors.email ? 'border-destructive' : ''}`}
              />
              {stepErrors.email && (
                <p className="text-sm text-destructive">{stepErrors.email}</p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('onboarding.locationAndHours')}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('onboarding.locationAndHoursDesc')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                {t('common.address')}{' '}
                <span className="font-normal text-muted-foreground">
                  ({t('common.optional')})
                </span>
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St, City"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="h-14 text-base"
              />
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">
                  {t('common.operatingHours')}{' '}
                  <span className="font-normal text-muted-foreground">
                    ({t('common.optional')})
                  </span>
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('common.operatingHoursDesc')}
                </p>
              </div>
              <OperatingHoursEditor />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Payment setup</h3>
                <p className="text-xs text-muted-foreground">
                  This is shown on your public booking page.
                </p>
              </div>
            </div>

            <div className="divide-y rounded-xl border bg-card">
              {summary.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="max-w-[60%] truncate text-right text-sm font-medium">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Country</Label>
              <Select
                value={country}
                onValueChange={(value) =>
                  handleCountryChange(value as BusinessCountry)
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((countryOption) => (
                    <SelectItem key={countryOption.code} value={countryOption.code}>
                      {countryOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                  readOnly={paymentRegion !== 'other'}
                  className={`h-12 ${stepErrors.currency ? 'border-destructive' : ''}`}
                />
                {stepErrors.currency && (
                  <p className="text-sm text-destructive">{stepErrors.currency}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Default payment method</Label>
                <Select
                  value={defaultPaymentMethod}
                  onValueChange={(value) => {
                    setDefaultPaymentMethod(value as BusinessDefaultPaymentMethod);
                    setHasEditedPaymentMethod(true);
                  }}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map((method) => (
                      <SelectItem key={method} value={method}>
                        {paymentMethodLabels[method]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Suggested: {paymentMethodLabels[suggestedPaymentMethod]}
                </p>
              </div>
            </div>

            {defaultPaymentMethod === 'gcash_manual' && (
              <div className="space-y-4 rounded-xl border p-4">
                <p className="text-sm font-medium">GCash setup</p>
                <p className="text-xs text-muted-foreground">
                  Customers will follow these details before booking is confirmed.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="gcashAccountName">GCash account name</Label>
                  <Input
                    id="gcashAccountName"
                    value={gcashAccountName}
                    onChange={(event) => setGcashAccountName(event.target.value)}
                    className={`h-12 ${stepErrors.gcashAccountName ? 'border-destructive' : ''}`}
                  />
                  {stepErrors.gcashAccountName && (
                    <p className="text-sm text-destructive">
                      {stepErrors.gcashAccountName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gcashNumber">GCash number</Label>
                  <Input
                    id="gcashNumber"
                    value={gcashNumber}
                    onChange={(event) => setGcashNumber(event.target.value)}
                    className={`h-12 ${stepErrors.gcashNumber ? 'border-destructive' : ''}`}
                  />
                  {stepErrors.gcashNumber && (
                    <p className="text-sm text-destructive">{stepErrors.gcashNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gcashQrImageUrl">GCash QR image URL</Label>
                  <Input
                    id="gcashQrImageUrl"
                    type="url"
                    placeholder="https://..."
                    value={gcashQrImageUrl}
                    onChange={(event) => setGcashQrImageUrl(event.target.value)}
                    className={`h-12 ${stepErrors.gcashQr ? 'border-destructive' : ''}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gcashQrFile">Or upload a GCash QR image</Label>
                  <Input
                    id="gcashQrFile"
                    name="gcashQrFile"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={`h-12 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary-foreground ${stepErrors.gcashQr ? 'border-destructive' : ''}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, or WebP up to 2MB.
                  </p>
                  {stepErrors.gcashQr && (
                    <p className="text-sm text-destructive">{stepErrors.gcashQr}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gcashInstructions">Short payment instructions</Label>
                  <Input
                    id="gcashInstructions"
                    value={gcashInstructions}
                    onChange={(event) => setGcashInstructions(event.target.value)}
                    placeholder="Example: Send screenshot after payment"
                    className="h-12"
                  />
                </div>
              </div>
            )}

            {defaultPaymentMethod === 'momo_manual' && (
              <div className="space-y-4 rounded-xl border p-4">
                <p className="text-sm font-medium">Mobile Money setup</p>
                <p className="text-xs text-muted-foreground">
                  Keep this simple for now. You can refine this later for MTN or Orange.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="momoAccountName">Account name</Label>
                  <Input
                    id="momoAccountName"
                    value={momoAccountName}
                    onChange={(event) => setMomoAccountName(event.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="momoNumber">Phone number</Label>
                  <Input
                    id="momoNumber"
                    value={momoNumber}
                    onChange={(event) => setMomoNumber(event.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="momoInstructions">Short instructions</Label>
                  <Input
                    id="momoInstructions"
                    value={momoInstructions}
                    onChange={(event) => setMomoInstructions(event.target.value)}
                    placeholder="Example: Send proof after payment"
                    className="h-12"
                  />
                </div>
              </div>
            )}

            {defaultPaymentMethod === 'manual' && (
              <div className="space-y-4 rounded-xl border p-4">
                <p className="text-sm font-medium">Manual payment fallback</p>
                <p className="text-xs text-muted-foreground">
                  Add a short message so customers know what to do.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="manualInstructions">Manual instructions</Label>
                  <Input
                    id="manualInstructions"
                    value={manualInstructions}
                    onChange={(event) => setManualInstructions(event.target.value)}
                    placeholder="Example: Pay in-store before service starts"
                    className="h-12"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 rounded-xl border p-4">
              <p className="text-sm font-medium">Booking deposit</p>
              <p className="text-xs text-muted-foreground">
                Choose whether customers must pay before confirmation.
              </p>

              <div className="space-y-2">
                <Label>Require deposit?</Label>
                <Select
                  value={depositRequired ? 'yes' : 'no'}
                  onValueChange={(value) => setDepositRequired(value === 'yes')}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {depositRequired && (
                <>
                  <div className="space-y-2">
                    <Label>Deposit type</Label>
                    <Select
                      value={depositType}
                      onValueChange={(value) => setDepositType(value as DepositType)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed amount</SelectItem>
                        <SelectItem value="full">Full service amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {depositType === 'fixed' && (
                    <div className="space-y-2">
                      <Label htmlFor="depositAmount">Deposit amount ({currency})</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        min={0}
                        step="0.01"
                        value={depositAmount}
                        onChange={(event) => setDepositAmount(event.target.value)}
                        className={`h-12 ${stepErrors.depositAmount ? 'border-destructive' : ''}`}
                      />
                      {stepErrors.depositAmount && (
                        <p className="text-sm text-destructive">
                          {stepErrors.depositAmount}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={back}
              className="h-14 flex-1 text-base"
              disabled={isLoading}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t('common.back')}
            </Button>
          )}
          {step < 4 ? (
            <Button type="button" onClick={next} className="h-14 flex-1 text-base font-semibold">
              {t('common.next')}
            </Button>
          ) : (
            <Button
              type="submit"
              className="h-14 flex-1 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? t('onboarding.creating') : t('onboarding.createBusiness')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
