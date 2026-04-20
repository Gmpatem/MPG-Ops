'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LifeBuoy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  createSupportRequest,
  getMySupportRequests,
  type SupportRequestRow,
} from '@/app/actions/support-requests';

const categoryOptions = [
  { value: 'general', label: 'General help' },
  { value: 'payment_issue', label: 'Payment issue' },
  { value: 'configuration', label: 'Configuration fix' },
  { value: 'booking', label: 'Booking issue' },
  { value: 'account', label: 'Account concern' },
] as const;

const statusStyles: Record<string, string> = {
  open: 'bg-amber-100 text-amber-900',
  in_progress: 'bg-blue-100 text-blue-900',
  resolved: 'bg-emerald-100 text-emerald-900',
  closed: 'bg-slate-200 text-slate-900',
};

export default function SettingsSupportPage() {
  const [requests, setRequests] = useState<SupportRequestRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  async function loadRequests() {
    setIsLoading(true);
    const rows = await getMySupportRequests(30);
    setRequests(rows);
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    getMySupportRequests(30).then((rows) => {
      if (cancelled) return;
      setRequests(rows);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setMessage(null);
    const result = await createSupportRequest(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setMessageType('error');
      setMessage(result.error);
      return;
    }

    setMessageType('success');
    setMessage('Support request sent. Our platform team will review it.');
    await loadRequests();
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <Link href="/settings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to settings
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ask for help, report payment issues, or request configuration fixes.
        </p>
      </div>

      <Card className="p-5">
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              className="h-12 w-full rounded-md border bg-background px-3 text-sm"
              defaultValue="general"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              name="subject"
              required
              maxLength={120}
              placeholder="Short summary of your issue"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              required
              minLength={10}
              maxLength={2000}
              placeholder="Describe what you need help with"
              className="min-h-28"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact email (optional)</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              placeholder="you@example.com"
              className="h-12"
            />
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

          <Button type="submit" disabled={isSubmitting} className="h-11">
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <LifeBuoy className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Recent Requests</h2>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have not submitted any support requests yet.
          </p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{request.subject}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusStyles[request.status] ?? 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(request.created_at).toLocaleString('en-CA')}
                </p>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {request.message}
                </p>
                {request.admin_notes && (
                  <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
                    Admin note: {request.admin_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
