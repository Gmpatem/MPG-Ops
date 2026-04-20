'use client';

import { useState } from 'react';
import { MessageSquareHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitBusinessFeedback } from '@/app/actions/feedback';

export function BusinessFeedbackForm({
  businessId,
  initialName,
}: {
  businessId: string;
  initialName?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);
    const result = await submitBusinessFeedback(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setMessageType('error');
      setMessage(result.error);
      return;
    }

    setMessageType('success');
    setMessage('Thanks for your feedback.');
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-4 mt-8 shadow-[0_2px_20px_rgba(42,36,32,0.06)] animate-fade-up">
      <div className="flex items-center gap-2">
        <MessageSquareHeart className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">Leave feedback</p>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Tell us how your booking experience went.
      </p>

      <form action={handleSubmit} className="mt-4 space-y-3">
        <input type="hidden" name="businessId" value={businessId} />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerName">Name (optional)</Label>
            <Input
              id="customerName"
              name="customerName"
              defaultValue={initialName ?? ''}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email (optional)</Label>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating (optional)</Label>
          <select
            id="rating"
            name="rating"
            defaultValue=""
            className="h-11 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Select a rating</option>
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Okay</option>
            <option value="2">2 - Needs improvement</option>
            <option value="1">1 - Poor</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">Comment</Label>
          <Textarea
            id="comment"
            name="comment"
            required
            minLength={4}
            maxLength={2000}
            placeholder="Share your feedback"
            className="min-h-24"
          />
        </div>

        {message && (
          <div
            className={`rounded-lg border px-3 py-2 text-xs ${
              messageType === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-destructive/30 bg-destructive/10 text-destructive'
            }`}
          >
            {message}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="h-11">
          {isSubmitting ? 'Sending...' : 'Submit Feedback'}
        </Button>
      </form>
    </div>
  );
}
