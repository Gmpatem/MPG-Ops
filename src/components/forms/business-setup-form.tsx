'use client';

import { useMemo, useRef, useState } from 'react';
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
} from '@/lib/business-payment-settings';
import { ChevronLeft, CreditCard, MapPin, Phone, Store } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-provider';

const businessTypes = [
  { value: 'salon', label: 'Salon', icon: '✂️' },
  { value: 'barbershop', label: 'Barbershop', icon: '💈' },
  { value: 'spa', label: 'Spa', icon: '🧘' },
];

const countryLabels: Record<BusinessCountry, string> = {
  philippines: 'Philippines',
  cameroon: 'Cameroon',
  other: 'Other',
};

const paymentMethodLabels: Record<BusinessDefaultPaymentMethod, string> = {
  gcash_manual: 'GCash (Manual)',
  momo_manual: 'Mobile Money (Manual)',
  manual: 'Manual',
};

type Step = 1 | 2 | 3 | 4;

export function BusinessSetupForm() {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement | null>(null);

  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Business basics
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Region/payment setup
  const [country, setCountry] = useState<BusinessCountry>('philippines');
  const [currency, setCurrency] = useState('PHP');
  const [defaultPaymentMethod, setDefaultPaymentMethod] =
    useState<BusinessDefaultPaymentMethod>('gcash_manual');

  const [gcashAccountName, setGcashAccountName] = useState('');
  const [gcashNumber, setGcashNumber] = useState('');
  const [gcashQrImageUrl, setGcashQrImageUrl] = useState('');

  const [depositRequired, setDepositRequired] = useState(false);
  const [depositType, setDepositType] = useState<DepositType>('full');
  const [depositAmount, setDepositAmount] = useState('');

  const [momoAccountName, setMomoAccountName] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoInstructions, setMomoInstructions] = useState('');

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [hasEditedSlug, setHasEditedSlug] = useState(false);

  const progressPercent = useMemo(() => {
    const pct: Record<Step, number> = { 1: 25, 2: 50, 3: 75, 4: 100 };
    return pct[step];
  }, [step]);

  function handleCountryChange(nextCountry: BusinessCountry) {
    setCountry(nextCountry);
    if (nextCountry === 'philippines') {
      setCurrency('PHP');
      setDefaultPaymentMethod('gcash_manual');
      return;
    }
    if (nextCountry === 'cameroon') {
      setCurrency('XAF');
      setDefaultPaymentMethod('momo_manual');
      return;
    }
    setDefaultPaymentMethod('manual');
    setCurrency((prev) => (prev.trim() ? prev : 'USD'));
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
      if (country === 'other' && !currency.trim()) {
        errs.currency = 'Please add your currency.';
      }

      if (country === 'philippines') {
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

    const result = await setupBusiness(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
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
    { label: 'Country', value: countryLabels[country] },
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
        <input type="hidden" name="momoAccountName" value={momoAccountName} />
        <input type="hidden" name="momoNumber" value={momoNumber} />
        <input
          type="hidden"
          name="momoInstructions"
          value={momoInstructions}
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
                autoFocus
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
                  <SelectItem value="philippines">Philippines</SelectItem>
                  <SelectItem value="cameroon">Cameroon</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
                  readOnly={country !== 'other'}
                  className={`h-12 ${stepErrors.currency ? 'border-destructive' : ''}`}
                />
                {stepErrors.currency && (
                  <p className="text-sm text-destructive">{stepErrors.currency}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Default method</Label>
                <Input
                  value={paymentMethodLabels[defaultPaymentMethod]}
                  readOnly
                  className="h-12"
                />
              </div>
            </div>

            {country === 'philippines' && (
              <div className="space-y-4 rounded-xl border p-4">
                <p className="text-sm font-medium">GCash setup</p>
                <p className="text-xs text-muted-foreground">
                  Customers will follow these details when paying a deposit.
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
                        <Label htmlFor="depositAmount">Deposit amount (PHP)</Label>
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
            )}

            {country === 'cameroon' && (
              <div className="space-y-4 rounded-xl border p-4">
                <p className="text-sm font-medium">Mobile Money setup</p>
                <p className="text-xs text-muted-foreground">
                  Keep this simple for now. You can refine this later.
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

            {country === 'other' && (
              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Manual payment fallback is enabled. You can customize this later in
                  settings.
                </p>
              </div>
            )}
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
