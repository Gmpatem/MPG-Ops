'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getCountryOptions,
  getPaymentMethodOptionsForCountry,
  getPaymentRegionForCountry,
  getSuggestedCurrencyForCountry,
  getSuggestedPaymentMethodForCountry,
  normalizeBusinessRegionPaymentConfig,
  type BusinessCountry,
  type BusinessDefaultPaymentMethod,
  type DepositType,
} from '@/lib/business-payment-settings';
import {
  updateBusinessPaymentConfigByAdmin,
  type PlatformBusinessPaymentRow,
} from '@/app/actions/platform-payments';
import type { Json } from '@/lib/supabase/database.types';

const paymentMethodLabels: Record<BusinessDefaultPaymentMethod, string> = {
  gcash_manual: 'GCash (Manual)',
  momo_manual: 'MoMo (Manual)',
  manual: 'Manual',
};

export function PaymentsAdminWorkspace({
  businesses,
}: {
  businesses: PlatformBusinessPaymentRow[];
}) {
  const [businessRows, setBusinessRows] = useState<PlatformBusinessPaymentRow[]>(businesses);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    businesses[0]?.id ?? null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [country, setCountry] = useState<BusinessCountry>('OTHER');
  const [currency, setCurrency] = useState('USD');
  const [defaultPaymentMethod, setDefaultPaymentMethod] =
    useState<BusinessDefaultPaymentMethod>('manual');
  const [hasEditedPaymentMethod, setHasEditedPaymentMethod] = useState(false);
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositType, setDepositType] = useState<DepositType>('full');
  const [depositAmount, setDepositAmount] = useState('');
  const [gcashAccountName, setGcashAccountName] = useState('');
  const [gcashNumber, setGcashNumber] = useState('');
  const [gcashQrImageUrl, setGcashQrImageUrl] = useState('');
  const [gcashInstructions, setGcashInstructions] = useState('');
  const [momoAccountName, setMomoAccountName] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoInstructions, setMomoInstructions] = useState('');
  const [manualInstructions, setManualInstructions] = useState('');

  const selectedBusiness = useMemo(
    () => businessRows.find((business) => business.id === selectedBusinessId) ?? null,
    [businessRows, selectedBusinessId]
  );

  const countryOptions = useMemo(() => getCountryOptions(), []);
  const paymentRegion = getPaymentRegionForCountry(country);
  const suggestedPaymentMethod = getSuggestedPaymentMethodForCountry(country);
  const paymentMethodOptions = getPaymentMethodOptionsForCountry(country);

  useEffect(() => {
    if (!selectedBusiness) return;

    const normalized = normalizeBusinessRegionPaymentConfig({
      country: selectedBusiness.country,
      currency: selectedBusiness.currency,
      defaultPaymentMethod: selectedBusiness.default_payment_method,
      paymentSettingsRaw: selectedBusiness.payment_settings as Json,
    });

    setCountry(normalized.country);
    setCurrency(normalized.currency);
    setDefaultPaymentMethod(normalized.defaultPaymentMethod);
    setDepositRequired(normalized.paymentSettings.depositRequired);
    setDepositType(normalized.paymentSettings.depositType);
    setDepositAmount(
      normalized.paymentSettings.depositAmount !== null
        ? String(normalized.paymentSettings.depositAmount)
        : ''
    );
    setGcashAccountName(normalized.paymentSettings.gcash?.accountName ?? '');
    setGcashNumber(normalized.paymentSettings.gcash?.number ?? '');
    setGcashQrImageUrl(normalized.paymentSettings.gcash?.qrImageUrl ?? '');
    setGcashInstructions(normalized.paymentSettings.gcash?.instructions ?? '');
    setMomoAccountName(normalized.paymentSettings.momo?.accountName ?? '');
    setMomoNumber(normalized.paymentSettings.momo?.number ?? '');
    setMomoInstructions(normalized.paymentSettings.momo?.instructions ?? '');
    setManualInstructions(normalized.paymentSettings.manual?.instructions ?? '');
    setHasEditedPaymentMethod(false);
    setMessage(null);
  }, [selectedBusiness]);

  function handleCountryChange(nextCountry: BusinessCountry) {
    setCountry(nextCountry);
    const methodOptions = getPaymentMethodOptionsForCountry(nextCountry);
    const suggestedMethod = getSuggestedPaymentMethodForCountry(nextCountry);
    const suggestedCurrency = getSuggestedCurrencyForCountry(nextCountry, currency);

    setCurrency(suggestedCurrency);
    setDefaultPaymentMethod((prev) => {
      if (hasEditedPaymentMethod && methodOptions.includes(prev)) {
        return prev;
      }
      return suggestedMethod;
    });
  }

  async function handleSave() {
    if (!selectedBusiness) return;

    const formData = new FormData();
    formData.set('businessId', selectedBusiness.id);
    formData.set('country', country);
    formData.set('currency', currency);
    formData.set('defaultPaymentMethod', defaultPaymentMethod);
    formData.set('depositRequired', depositRequired ? 'true' : 'false');
    formData.set('depositType', depositType);
    formData.set('depositAmount', depositAmount);
    formData.set('gcashAccountName', gcashAccountName);
    formData.set('gcashNumber', gcashNumber);
    formData.set('gcashQrImageUrl', gcashQrImageUrl);
    formData.set('gcashInstructions', gcashInstructions);
    formData.set('momoAccountName', momoAccountName);
    formData.set('momoNumber', momoNumber);
    formData.set('momoInstructions', momoInstructions);
    formData.set('manualInstructions', manualInstructions);

    setIsSaving(true);
    setMessage(null);
    const result = await updateBusinessPaymentConfigByAdmin(formData);
    setIsSaving(false);

    if (!result.success) {
      setMessageType('error');
      setMessage(result.error);
      return;
    }

    setMessageType('success');
    setMessage('Payment configuration updated.');
    setBusinessRows((current) =>
      current.map((row) =>
        row.id === selectedBusiness.id
          ? {
              ...row,
              country,
              currency,
              default_payment_method: defaultPaymentMethod,
              payment_settings: {
                depositRequired,
                depositType,
                depositAmount:
                  depositRequired && depositType === 'fixed'
                    ? Number(depositAmount || 0)
                    : null,
                gcash: {
                  accountName: gcashAccountName || undefined,
                  number: gcashNumber || undefined,
                  qrImageUrl: gcashQrImageUrl || undefined,
                  instructions: gcashInstructions || undefined,
                },
                momo: {
                  accountName: momoAccountName || undefined,
                  number: momoNumber || undefined,
                  instructions: momoInstructions || undefined,
                },
                manual: {
                  instructions: manualInstructions || undefined,
                },
              } as Json,
            }
          : row
      )
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-5">
        <h2 className="text-sm font-semibold mb-3">Businesses</h2>
        {businessRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No businesses found.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {businessRows.map((business) => (
              <button
                key={business.id}
                type="button"
                onClick={() => setSelectedBusinessId(business.id)}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  selectedBusinessId === business.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/40'
                }`}
              >
                <p className="text-sm font-semibold">{business.name}</p>
                <p className="text-xs text-muted-foreground">
                  {business.owner?.email ?? 'No owner email'}
                </p>
              </button>
            ))}
          </div>
        )}
      </Card>

      {selectedBusiness && (
        <Card className="p-4 md:p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold">Edit Payment Setup</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedBusiness.name} · {selectedBusiness.owner?.email ?? 'No owner email'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <select
              value={country}
              onChange={(event) => handleCountryChange(event.target.value)}
              className="h-12 w-full rounded-md border bg-background px-3 text-sm"
            >
              {countryOptions.map((countryOption) => (
                <option key={countryOption.code} value={countryOption.code}>
                  {countryOption.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                value={currency}
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                readOnly={paymentRegion !== 'other'}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Default payment method</Label>
              <select
                value={defaultPaymentMethod}
                onChange={(event) => {
                  setDefaultPaymentMethod(
                    event.target.value as BusinessDefaultPaymentMethod
                  );
                  setHasEditedPaymentMethod(true);
                }}
                className="h-12 w-full rounded-md border bg-background px-3 text-sm"
              >
                {paymentMethodOptions.map((method) => (
                  <option key={method} value={method}>
                    {paymentMethodLabels[method]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Suggested: {paymentMethodLabels[suggestedPaymentMethod]}
              </p>
            </div>
          </div>

          {defaultPaymentMethod === 'gcash_manual' && (
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">GCash details</p>
              <Input
                value={gcashAccountName}
                onChange={(event) => setGcashAccountName(event.target.value)}
                placeholder="GCash account name"
                className="h-11"
              />
              <Input
                value={gcashNumber}
                onChange={(event) => setGcashNumber(event.target.value)}
                placeholder="GCash number"
                className="h-11"
              />
              <Input
                type="url"
                value={gcashQrImageUrl}
                onChange={(event) => setGcashQrImageUrl(event.target.value)}
                placeholder="GCash QR URL"
                className="h-11"
              />
              <Input
                value={gcashInstructions}
                onChange={(event) => setGcashInstructions(event.target.value)}
                placeholder="Short payment instructions"
                className="h-11"
              />
            </div>
          )}

          {defaultPaymentMethod === 'momo_manual' && (
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">MoMo details</p>
              <Input
                value={momoAccountName}
                onChange={(event) => setMomoAccountName(event.target.value)}
                placeholder="Account name"
                className="h-11"
              />
              <Input
                value={momoNumber}
                onChange={(event) => setMomoNumber(event.target.value)}
                placeholder="Phone number"
                className="h-11"
              />
              <Input
                value={momoInstructions}
                onChange={(event) => setMomoInstructions(event.target.value)}
                placeholder="Short payment instructions"
                className="h-11"
              />
            </div>
          )}

          {defaultPaymentMethod === 'manual' && (
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">Manual instructions</p>
              <Input
                value={manualInstructions}
                onChange={(event) => setManualInstructions(event.target.value)}
                placeholder="Manual payment guidance"
                className="h-11"
              />
            </div>
          )}

          <div className="space-y-3 rounded-lg border p-3">
            <p className="text-sm font-medium">Deposit settings</p>
            <select
              value={depositRequired ? 'yes' : 'no'}
              onChange={(event) => setDepositRequired(event.target.value === 'yes')}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="yes">Deposit required</option>
              <option value="no">No deposit required</option>
            </select>

            {depositRequired && (
              <>
                <select
                  value={depositType}
                  onChange={(event) => setDepositType(event.target.value as DepositType)}
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="fixed">Fixed amount</option>
                  <option value="full">Full service amount</option>
                </select>
                {depositType === 'fixed' && (
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={depositAmount}
                    onChange={(event) => setDepositAmount(event.target.value)}
                    placeholder={`Deposit amount (${currency})`}
                    className="h-11"
                  />
                )}
              </>
            )}
          </div>

          {message && (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                messageType === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-destructive/30 bg-destructive/10 text-destructive'
              }`}
            >
              {message}
            </div>
          )}

          <Button onClick={handleSave} disabled={isSaving} className="h-11">
            {isSaving ? 'Saving...' : 'Save Payment Setup'}
          </Button>
        </Card>
      )}
    </div>
  );
}
