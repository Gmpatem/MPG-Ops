'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/error-state';
import { FormStatus } from '@/components/form-status';
import { OperatingHoursEditor } from '@/components/operating-hours-editor';
import { getCurrentBusiness, updateBusiness } from '@/app/actions/business';
import { useToast } from '@/components/ui/toast';
import { Copy, Check, ExternalLink, Paintbrush, CreditCard } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher/language-switcher';
import { useI18n } from '@/lib/i18n/i18n-provider';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  normalizeBusinessRegionPaymentConfig,
  type BusinessCountry,
  type BusinessDefaultPaymentMethod,
  type DepositType,
} from '@/lib/business-payment-settings';
import type { Json, Tables } from '@/lib/supabase/database.types';

const paymentMethodLabels: Record<BusinessDefaultPaymentMethod, string> = {
  gcash_manual: 'GCash (Manual)',
  momo_manual: 'Mobile Money (Manual)',
  manual: 'Manual',
};

function PublicSiteCard({ businessId }: { businessId: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const bookingUrl = `${origin}/book/${businessId}`;

  function handleCopy() {
    navigator.clipboard.writeText(bookingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold text-sm">{t('common.publicBookingSite')}</h3>
        <Link
          href="/settings/public-site"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Paintbrush className="w-3 h-3" />
          {t('common.customize')}
        </Link>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {t('common.publicBookingSiteDesc')}
      </p>
      <div className="flex items-center gap-2">
        <Input
          readOnly
          value={bookingUrl}
          className="h-10 text-xs bg-muted font-mono"
          onFocus={(e) => e.target.select()}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-10 shrink-0"
          title={t('common.copyLink')}
        >
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
        <a
          href={`/book/${businessId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 shrink-0 inline-flex items-center px-3 rounded-md border text-sm hover:bg-muted transition-colors"
          title={t('common.preview')}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [business, setBusiness] = useState<Tables<'businesses'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [country, setCountry] = useState<BusinessCountry>('other');
  const [currency, setCurrency] = useState('USD');
  const [defaultPaymentMethod, setDefaultPaymentMethod] =
    useState<BusinessDefaultPaymentMethod>('manual');
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositType, setDepositType] = useState<DepositType>('full');
  const [depositAmount, setDepositAmount] = useState('');
  const [gcashAccountName, setGcashAccountName] = useState('');
  const [gcashNumber, setGcashNumber] = useState('');
  const [gcashQrImageUrl, setGcashQrImageUrl] = useState('');
  const [momoAccountName, setMomoAccountName] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoInstructions, setMomoInstructions] = useState('');

  useEffect(() => {
    async function loadBusiness() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCurrentBusiness();
        setBusiness(data);
      } catch {
        setError(t('settings.subtitle'));
      } finally {
        setIsLoading(false);
      }
    }
    loadBusiness();
  }, [t]);

  useEffect(() => {
    if (!business) return;

    const normalized = normalizeBusinessRegionPaymentConfig({
      country: business.country,
      currency: business.currency,
      defaultPaymentMethod: business.default_payment_method,
      paymentSettingsRaw: business.payment_settings as Json | null,
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
    setMomoAccountName(normalized.paymentSettings.momo?.accountName ?? '');
    setMomoNumber(normalized.paymentSettings.momo?.number ?? '');
    setMomoInstructions(normalized.paymentSettings.momo?.instructions ?? '');
  }, [business]);

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

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await updateBusiness(formData);

      if (result.success) {
        setMessage({ type: 'success', text: t('common.saveChanges') });
        toast({ title: t('common.saveChanges') });
        const data = await getCurrentBusiness();
        setBusiness(data);
      } else {
        setMessage({ type: 'error', text: result.error || t('settings.subtitle') });
      }
    } catch {
      setMessage({ type: 'error', text: t('auth.resetPassword.error') });
    }

    setIsSaving(false);
  }

  const handleRetry = () => {
    async function loadBusiness() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCurrentBusiness();
        setBusiness(data);
      } catch {
        setError(t('settings.subtitle'));
      } finally {
        setIsLoading(false);
      }
    }
    loadBusiness();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Card className="p-6 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-11 w-32" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('settings.subtitle')}
          </p>
        </div>
        <Card className="p-8">
          <ErrorState
            title={t('settings.title')}
            message={error}
            onRetry={handleRetry}
          />
        </Card>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('settings.subtitle')}
          </p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{t('settings.noBusiness')}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('settings.noBusinessDesc')}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Public Booking Site */}
      <PublicSiteCard businessId={business.id} />

      {/* Billing */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-sm">{t('common.billing')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('settings.billingDesc')}
            </p>
          </div>
          <Link
            href="/settings/billing"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <CreditCard className="w-3 h-3" />
            {t('common.manage')}
          </Link>
        </div>
      </Card>

      {/* Language */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm">{t('common.language')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose your preferred language for the app.
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </Card>

      {/* Settings Form */}
      <Card className="p-6">
        <form action={handleSubmit} className="space-y-5">
          <input type="hidden" name="country" value={country} />
          <input type="hidden" name="defaultPaymentMethod" value={defaultPaymentMethod} />
          <input type="hidden" name="depositRequired" value={depositRequired ? 'true' : 'false'} />
          <input type="hidden" name="depositType" value={depositType} />

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              {t('common.businessName')}
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={business.name}
              required
              className="h-12"
            />
          </div>

          {/* Business Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {t('common.businessEmail')}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={business.email || ''}
              placeholder="business@example.com"
              className="h-12"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              {t('common.phone')}
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={business.phone || ''}
              placeholder="+1 234 567 8900"
              className="h-12"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              {t('common.address')}
            </Label>
            <Input
              id="address"
              name="address"
              type="text"
              defaultValue={business.address || ''}
              placeholder="123 Main St, City"
              className="h-12"
            />
          </div>

          {/* Operating Hours */}
          <div className="space-y-3 pt-2">
            <div className="border-t pt-4">
              <Label className="text-sm font-medium">{t('common.operatingHours')}</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                {t('common.operatingHoursDesc')}
              </p>
              <OperatingHoursEditor initialHours={business.operating_hours as Record<string, { isOpen: boolean; open: string; close: string }> | null} />
            </div>
          </div>

          {/* Region & Payments */}
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label className="text-sm font-medium">Region & payments</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Controls how payment instructions show during public booking.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Country</Label>
              <Select
                value={country}
                onValueChange={(value) => handleCountryChange(value as BusinessCountry)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="philippines">Philippines</SelectItem>
                  <SelectItem value="cameroon">Cameroon</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  name="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  readOnly={country !== 'other'}
                  className="h-12"
                />
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

                <div className="space-y-2">
                  <Label htmlFor="gcashAccountName">GCash account name</Label>
                  <Input
                    id="gcashAccountName"
                    name="gcashAccountName"
                    value={gcashAccountName}
                    onChange={(e) => setGcashAccountName(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gcashNumber">GCash number</Label>
                  <Input
                    id="gcashNumber"
                    name="gcashNumber"
                    value={gcashNumber}
                    onChange={(e) => setGcashNumber(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gcashQrImageUrl">GCash QR image URL</Label>
                  <Input
                    id="gcashQrImageUrl"
                    name="gcashQrImageUrl"
                    type="url"
                    value={gcashQrImageUrl}
                    onChange={(e) => setGcashQrImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gcashQrFile">Or upload a new GCash QR image</Label>
                  <Input
                    id="gcashQrFile"
                    name="gcashQrFile"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="h-12 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary-foreground"
                  />
                  <p className="text-xs text-muted-foreground">JPG, PNG, or WebP up to 2MB.</p>
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
                          name="depositAmount"
                          type="number"
                          min={0}
                          step="0.01"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="h-12"
                        />
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
                  Simple placeholder for now. This can evolve into MTN/Orange flows.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="momoAccountName">Account name</Label>
                  <Input
                    id="momoAccountName"
                    name="momoAccountName"
                    value={momoAccountName}
                    onChange={(e) => setMomoAccountName(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="momoNumber">Phone number</Label>
                  <Input
                    id="momoNumber"
                    name="momoNumber"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="momoInstructions">Short instructions</Label>
                  <Input
                    id="momoInstructions"
                    name="momoInstructions"
                    value={momoInstructions}
                    onChange={(e) => setMomoInstructions(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            )}

            {country === 'other' && (
              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Manual payment fallback is enabled for this business.
                </p>
              </div>
            )}
          </div>

          {/* Message */}
          {message && (
            <FormStatus type={message.type} message={message.text} />
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              className="h-11 px-6"
              disabled={isSaving}
            >
              {isSaving ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
