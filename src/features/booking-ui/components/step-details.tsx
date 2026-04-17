'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StepShell } from './step-shell';

export function StepDetails({
  name,
  phone,
  email,
  notes,
  onChange,
  onNext,
  onBack,
}: {
  name: string;
  phone: string;
  email: string;
  notes: string;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleNext() {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onNext();
  }

  return (
    <StepShell
      step={5}
      title="Your details"
      subtitle="We need a few details to confirm your booking"
      onBack={onBack}
    >
      <div className="space-y-5 mb-8">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-bold text-foreground">
            Full name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. Maria Santos"
            value={name}
            onChange={(e) => onChange('name', e.target.value)}
            className={`h-12 text-base rounded-xl bg-card border-border/60 focus:border-primary transition-colors ${errors.name ? 'border-destructive' : ''}`}
          />
          {errors.name && (
            <p className="text-sm text-destructive font-medium flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-destructive" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-bold text-foreground">
            Phone number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g. 09171234567"
            value={phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`h-12 text-base rounded-xl bg-card border-border/60 focus:border-primary transition-colors ${errors.phone ? 'border-destructive' : ''}`}
          />
          {errors.phone && (
            <p className="text-sm text-destructive font-medium flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-destructive" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-bold text-foreground">
            Email{' '}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onChange('email', e.target.value)}
            className="h-12 text-base rounded-xl bg-card border-border/60 focus:border-primary transition-colors"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-bold text-foreground">
            Notes{' '}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            placeholder="Any special requests or notes..."
            value={notes}
            onChange={(e) => onChange('notes', e.target.value)}
            className="min-h-24 resize-none text-base rounded-xl bg-card border-border/60 focus:border-primary transition-colors"
          />
        </div>
      </div>

      <Button
        onClick={handleNext}
        className="w-full h-14 text-[15px] font-semibold rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-[0_4px_20px_rgba(42,36,32,0.2)] hover:shadow-[0_8px_32px_rgba(139,110,78,0.2)] hover:-translate-y-px active:scale-95 transition-all"
      >
        Review Booking
      </Button>
    </StepShell>
  );
}
