'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  formatCurrencyAmount,
  type BusinessPaymentSettings,
  type PublicManualPaymentState,
} from '@/lib/business-payment-settings';
import { StepShell } from './step-shell';
import type { BookingPaymentChoice } from '../types';
import type { UploadedPublicPaymentProof } from '@/app/actions/public-booking';

export function StepPayment({
  paymentChoice,
  onPaymentChoiceChange,
  currency,
  manualPaymentState,
  paymentSettings,
  manualPaymentProof,
  onUploadPaymentProof,
  onRemovePaymentProof,
  isUploadingPaymentProof,
  onNext,
  onBack,
  isSubmitting,
  error,
}: {
  paymentChoice: BookingPaymentChoice;
  onPaymentChoiceChange: (next: BookingPaymentChoice) => void;
  currency: string;
  manualPaymentState: PublicManualPaymentState;
  paymentSettings: BusinessPaymentSettings;
  manualPaymentProof: UploadedPublicPaymentProof | null;
  onUploadPaymentProof: (
    file: File
  ) => Promise<{ success: true } | { success: false; error: string }>;
  onRemovePaymentProof: () => void;
  isUploadingPaymentProof: boolean;
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const [proofError, setProofError] = useState<string | null>(null);

  const amountDueLabel =
    manualPaymentState.amountDue !== null
      ? formatCurrencyAmount(manualPaymentState.amountDue, currency)
      : '—';
  const uploadedProofName = manualPaymentProof?.path.split('/').pop() ?? null;

  async function handleProofChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProofError(null);
    const result = await onUploadPaymentProof(file);
    event.target.value = '';

    if (!result.success) {
      setProofError(result.error);
    }
  }

  const isContinueDisabled =
    isSubmitting ||
    isUploadingPaymentProof ||
    (paymentChoice === 'pay_now' &&
      manualPaymentState.requiresProof &&
      !manualPaymentProof);

  return (
    <StepShell
      step={6}
      title="Payment"
      subtitle="Choose how you want to pay for this booking"
      onBack={onBack}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onPaymentChoiceChange('pay_now')}
            className={`rounded-2xl border p-4 text-left transition-all ${
              paymentChoice === 'pay_now'
                ? 'border-primary bg-primary/5'
                : 'border-border/60 bg-card hover:bg-muted/30'
            }`}
          >
            <p className="text-sm font-semibold text-foreground">Pay now</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Follow the business payment instructions before confirmation.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onPaymentChoiceChange('pay_on_site')}
            className={`rounded-2xl border p-4 text-left transition-all ${
              paymentChoice === 'pay_on_site'
                ? 'border-primary bg-primary/5'
                : 'border-border/60 bg-card hover:bg-muted/30'
            }`}
          >
            <p className="text-sm font-semibold text-foreground">Pay on site</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Confirm booking first and pay at the business location.
            </p>
          </button>
        </div>

        {paymentChoice === 'pay_now' && (
          <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-[0_2px_20px_rgba(42,36,32,0.06)] space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Selected method
            </p>

            {manualPaymentState.showPaymentStep &&
              manualPaymentState.provider === 'gcash_manual' && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-3">
                    <p className="text-sm font-semibold text-foreground">
                      Step 1: Send{' '}
                      {manualPaymentState.amountDue !== null
                        ? amountDueLabel
                        : 'payment'}{' '}
                      to this GCash QR
                    </p>
                    {paymentSettings.gcash?.qrImageUrl ? (
                      <img
                        src={paymentSettings.gcash.qrImageUrl}
                        alt="GCash QR"
                        className="mt-3 h-44 w-full rounded-lg border object-contain bg-white p-2"
                      />
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        QR image is not available yet.
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Account: {paymentSettings.gcash?.accountName ?? 'Not set'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Number: {paymentSettings.gcash?.number ?? 'Not set'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Amount due:{' '}
                      {manualPaymentState.amountDue !== null
                        ? amountDueLabel
                        : 'No upfront payment required'}
                    </p>
                    {paymentSettings.gcash?.instructions && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {paymentSettings.gcash.instructions}
                      </p>
                    )}
                  </div>

                  {manualPaymentState.requiresProof && (
                    <div className="space-y-2">
                      <Label htmlFor="manualPaymentProof">Step 2: Upload screenshot</Label>
                      <Input
                        id="manualPaymentProof"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleProofChange}
                        disabled={isUploadingPaymentProof || isSubmitting}
                        className="h-12 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary-foreground"
                      />
                      {manualPaymentProof && (
                        <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs flex items-center justify-between gap-2">
                          <span className="text-success font-medium">
                            Uploaded: {uploadedProofName ?? 'payment-proof'}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onRemovePaymentProof}
                            className="h-7 px-2 text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                      {proofError && (
                        <p className="text-xs text-destructive">{proofError}</p>
                      )}
                    </div>
                  )}

                  {manualPaymentState.requiresProof ? (
                    <p className="text-xs text-muted-foreground">
                      Step 3: Continue to review. The business confirms your booking after checking proof.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No upfront payment required. Continue to review your booking details.
                    </p>
                  )}
                </div>
              )}

            {manualPaymentState.showPaymentStep &&
              manualPaymentState.provider === 'momo_manual' && (
                <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-3 space-y-2">
                  <p className="text-sm font-semibold">Manual Mobile Money</p>
                  {manualPaymentState.amountDue !== null && (
                    <p className="text-xs text-muted-foreground">
                      Step 1: Send {amountDueLabel}
                    </p>
                  )}
                  {manualPaymentState.amountDue === null && (
                    <p className="text-xs text-muted-foreground">
                      No upfront payment required. Follow business instructions if needed.
                    </p>
                  )}
                  {paymentSettings.momo?.accountName && (
                    <p className="text-xs text-muted-foreground">
                      Account: {paymentSettings.momo.accountName}
                    </p>
                  )}
                  {paymentSettings.momo?.number && (
                    <p className="text-xs text-muted-foreground">
                      Number: {paymentSettings.momo.number}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {paymentSettings.momo?.instructions ??
                      'Mobile money confirmation is handled manually by this business.'}
                  </p>
                </div>
              )}

            {manualPaymentState.showPaymentStep &&
              manualPaymentState.provider === 'manual' && (
                <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-3 space-y-2">
                  <p className="text-sm font-semibold">Manual Payment</p>
                  {manualPaymentState.amountDue !== null && (
                    <p className="text-xs text-muted-foreground">
                      Amount due: {amountDueLabel}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {paymentSettings.manual?.instructions ??
                      'The business will share manual payment instructions after booking.'}
                  </p>
                </div>
              )}

            {!manualPaymentState.showPaymentStep && (
              <div className="rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-3 text-xs text-amber-900">
                {manualPaymentState.fallbackMessage ??
                  'Payment details are not configured yet. You can continue and pay on site.'}
              </div>
            )}

            {manualPaymentState.showPaymentStep && manualPaymentState.fallbackMessage && (
              <div className="rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-3 text-xs text-amber-900">
                {manualPaymentState.fallbackMessage}
              </div>
            )}
          </div>
        )}

        {paymentChoice === 'pay_on_site' && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
            Pay on site selected. Continue to review and confirm your booking.
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium px-4 py-3.5">
            {error}
          </div>
        )}

        <Button
          onClick={onNext}
          disabled={isContinueDisabled}
          className="w-full h-14 text-[15px] font-semibold rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-[0_4px_20px_rgba(42,36,32,0.2)] hover:shadow-[0_8px_32px_rgba(139,110,78,0.2)] hover:-translate-y-px active:scale-95 transition-all disabled:shadow-none disabled:hover:translate-y-0"
        >
          Continue to Review
        </Button>
      </div>
    </StepShell>
  );
}
