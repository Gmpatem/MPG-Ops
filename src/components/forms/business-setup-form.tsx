'use client';

import { useState, useMemo } from 'react';
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
import { ChevronLeft, Store, Phone, MapPin, CheckCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-provider';

const businessTypes = [
  { value: 'salon', label: 'Salon', icon: '✂️' },
  { value: 'barbershop', label: 'Barbershop', icon: '💈' },
  { value: 'spa', label: 'Spa', icon: '🧘' },
];

type Step = 1 | 2 | 3 | 4;

export function BusinessSetupForm() {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const progressPercent = useMemo(() => {
    const pct: Record<Step, number> = { 1: 25, 2: 50, 3: 75, 4: 100 };
    return pct[step];
  }, [step]);

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

  // Auto-generate slug from name when name changes and user hasn't manually edited slug
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const handleNameChange = (value: string) => {
    setName(value);
    if (!hasEditedSlug) {
      setSlug(generateSlug(value));
    }
  };

  const summary = [
    { label: t('common.businessName'), value: name },
    { label: t('onboarding.slug'), value: slug },
    { label: t('onboarding.businessType'), value: businessTypes.find((t) => t.value === businessType)?.label || businessType },
    { label: t('common.phone'), value: phone || '—' },
    { label: t('common.businessEmail'), value: email || '—' },
    { label: t('common.address'), value: address || '—' },
  ];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>{t('onboarding.step', { step })}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-[var(--duration-slow)]"
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
        action={handleSubmit}
        className="space-y-5"
        onSubmit={(e) => {
          if (step !== 4) {
            e.preventDefault();
          }
        }}
      >
        {/* Hidden inputs for all fields so server action receives them on final submit */}
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="businessType" value={businessType} />
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="address" value={address} />

        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('onboarding.businessBasics')}</h3>
                <p className="text-xs text-muted-foreground">{t('onboarding.businessBasicsDesc')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t('common.businessName')}</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Glamour Salon"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`h-14 text-base ${stepErrors.name ? 'border-destructive' : ''}`}
                autoFocus
              />
              {stepErrors.name && <p className="text-sm text-destructive">{stepErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">{t('onboarding.slug')}</Label>
              <Input
                id="slug"
                type="text"
                placeholder="glamour-salon"
                value={slug}
                onChange={(e) => {
                  setSlug(generateSlug(e.target.value));
                  setHasEditedSlug(true);
                }}
                className={`h-14 text-base ${stepErrors.slug ? 'border-destructive' : ''}`}
              />
              <p className="text-xs text-muted-foreground">{t('onboarding.slugDesc')}</p>
              {stepErrors.slug && <p className="text-sm text-destructive">{stepErrors.slug}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">{t('onboarding.businessType')}</Label>
              <Select
                value={businessType}
                onValueChange={(value) => setBusinessType(value ?? '')}
              >
                <SelectTrigger className={`h-14 text-base ${stepErrors.businessType ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder={t('onboarding.selectBusinessType')} />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stepErrors.businessType && <p className="text-sm text-destructive">{stepErrors.businessType}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('onboarding.contactDetails')}</h3>
                <p className="text-xs text-muted-foreground">{t('onboarding.contactDetailsDesc')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('common.phone')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-14 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('common.businessEmail')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="business@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-14 text-base ${stepErrors.email ? 'border-destructive' : ''}`}
              />
              {stepErrors.email && <p className="text-sm text-destructive">{stepErrors.email}</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('onboarding.locationAndHours')}</h3>
                <p className="text-xs text-muted-foreground">{t('onboarding.locationAndHoursDesc')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t('common.address')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span></Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-14 text-base"
              />
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">{t('common.operatingHours')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span></Label>
                <p className="text-xs text-muted-foreground mt-0.5">
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
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('onboarding.reviewAndCreate')}</h3>
                <p className="text-xs text-muted-foreground">{t('onboarding.reviewAndCreateDesc')}</p>
              </div>
            </div>

            <div className="rounded-xl border bg-card divide-y">
              {summary.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-right max-w-[60%] truncate">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-2 flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={back}
              className="flex-1 h-14 text-base"
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t('common.back')}
            </Button>
          )}
          {step < 4 ? (
            <Button
              type="button"
              onClick={next}
              className="flex-1 h-14 text-base font-semibold"
            >
              {t('common.next')}
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1 h-14 text-base font-semibold"
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
