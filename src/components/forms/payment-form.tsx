'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormStatus } from '@/components/form-status';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentFormProps {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  defaultAmount: number;
  bookingId: string;
}

export function PaymentForm({ action, defaultAmount, bookingId }: PaymentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setErrors({});

    // Client-side validation
    const amount = Number(formData.get('amount'));
    const method = formData.get('method') as string;

    const newErrors: Record<string, string> = {};

    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!method) {
      newErrors.method = 'Please select a payment method';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    const result = await action(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5 pt-2">
      <input type="hidden" name="bookingId" value={bookingId} />

      {error && <FormStatus type="error" message={error} />}

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm font-medium">
          Amount *
        </Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min={0}
          step="0.01"
          defaultValue={defaultAmount}
          placeholder="0.00"
          className={`h-12 ${errors.amount ? 'border-red-500' : ''}`}
        />
        {errors.amount && (
          <p className="text-sm text-red-600">{errors.amount}</p>
        )}
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label htmlFor="method" className="text-sm font-medium">
          Payment Method *
        </Label>
        <Select name="method" defaultValue="cash">
          <SelectTrigger className={`h-12 ${errors.method ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="gcash">GCash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.method && (
          <p className="text-sm text-red-600">{errors.method}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">
          Notes
        </Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any additional notes..."
          className="min-h-[80px] resize-none"
        />
      </div>

      {/* Submit Buttons */}
      <div className="pt-4 flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 text-base font-medium"
          disabled={isLoading}
        >
          {isLoading ? 'Recording...' : 'Record Payment'}
        </Button>
      </div>
    </form>
  );
}
