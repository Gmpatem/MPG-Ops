'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CustomerFormProps {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  initialData?: {
    name: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
  } | null;
}

export function CustomerForm({ action, initialData }: CustomerFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setErrors({});

    // Client-side validation
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    const newErrors: Record<string, string> = {};

    if (!name || name.trim() === '') {
      newErrors.name = 'Customer name is required';
    }

    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
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
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Customer Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Name *
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. John Doe"
          defaultValue={initialData?.name}
          className={`h-12 ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name}</p>
        )}
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
          placeholder="e.g. +1 234 567 8900"
          defaultValue={initialData?.phone || ''}
          className="h-12"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="e.g. john@example.com"
          defaultValue={initialData?.email || ''}
          className={`h-12 ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email}</p>
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
          placeholder="Any additional information about the customer..."
          defaultValue={initialData?.notes || ''}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          disabled={isLoading}
        >
          {isLoading
            ? 'Saving...'
            : initialData
            ? 'Update Customer'
            : 'Save Customer'}
        </Button>
      </div>
    </form>
  );
}
