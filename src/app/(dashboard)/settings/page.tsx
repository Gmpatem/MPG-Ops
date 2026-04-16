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
import { Copy, Check, ExternalLink, Paintbrush } from 'lucide-react';
import Link from 'next/link';
import type { Tables } from '@/lib/supabase/database.types';

function PublicSiteCard({ businessId }: { businessId: string }) {
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
        <h3 className="font-semibold text-sm">Public Booking Site</h3>
        <Link
          href="/settings/public-site"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Paintbrush className="w-3 h-3" />
          Customize
        </Link>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Share this link with customers so they can book online. Customize the look and content in the Public Site settings.
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
          title="Copy booking link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
        <a
          href={`/book/${businessId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 shrink-0 inline-flex items-center px-3 rounded-md border text-sm hover:bg-muted transition-colors"
          title="Preview public site"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [business, setBusiness] = useState<Tables<'businesses'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadBusiness() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCurrentBusiness();
        setBusiness(data);
      } catch {
        setError('Failed to load business settings');
      } finally {
        setIsLoading(false);
      }
    }
    loadBusiness();
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await updateBusiness(formData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully.' });
        toast({ title: 'Settings saved successfully' });
        const data = await getCurrentBusiness();
        setBusiness(data);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save settings.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
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
        setError('Failed to load business settings');
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
          <h1 className="text-2xl font-bold tracking-tight">Business Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update your business information.
          </p>
        </div>
        <Card className="p-8">
          <ErrorState
            title="Failed to load settings"
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
          <h1 className="text-2xl font-bold tracking-tight">Business Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update your business information.
          </p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No business found.</p>
          <p className="text-sm text-muted-foreground mt-2">
            We couldn&apos;t find a business associated with your account.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update your business information.
        </p>
      </div>

      {/* Public Booking Site */}
      <PublicSiteCard businessId={business.id} />

      {/* Settings Form */}
      <Card className="p-6">
        <form action={handleSubmit} className="space-y-5">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Business name
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
              Business email
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
              Phone
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
              Address
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
              <Label className="text-sm font-medium">Operating Hours</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                Set your weekly schedule for each day.
              </p>
              <OperatingHoursEditor initialHours={business.operating_hours as Record<string, { isOpen: boolean; open: string; close: string }> | null} />
            </div>
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
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
