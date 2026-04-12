'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/error-state';
import { FormStatus } from '@/components/form-status';
import { getCurrentBusiness, updateBusiness } from '@/app/actions/business';

export default function SettingsPage() {
  const [business, setBusiness] = useState<{
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    business_type: string;
  } | null>(null);
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
      } catch (err) {
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
        // Refresh business data
        const data = await getCurrentBusiness();
        setBusiness(data);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save settings.' });
      }
    } catch (err) {
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
      } catch (err) {
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
        {/* Page Header */}
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>

        {/* Settings Form */}
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
            Please complete the onboarding process first.
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
