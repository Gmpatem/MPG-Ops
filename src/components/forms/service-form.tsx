'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FormStatus } from '@/components/form-status';

interface ServiceFormProps {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  initialData?: {
    name: string;
    category: string;
    durationMinutes: number;
    price: number;
    isActive: boolean;
  };
}

export function ServiceForm({ action, initialData }: ServiceFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setErrors({});

    // Client-side validation
    const name = formData.get('name') as string;
    const durationMinutes = Number(formData.get('durationMinutes'));
    const price = Number(formData.get('price'));

    const newErrors: Record<string, string> = {};

    if (!name || name.trim() === '') {
      newErrors.name = 'Service name is required';
    }

    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      newErrors.durationMinutes = 'Duration must be greater than 0';
    }

    if (isNaN(price) || price < 0) {
      newErrors.price = 'Price cannot be negative';
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
      {error && <FormStatus type="error" message={error} />}

      {/* Service Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Service name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Haircut"
          defaultValue={initialData?.name ?? ''}
          className={`h-12 ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium">
          Category
        </Label>
        <Input
          id="category"
          name="category"
          type="text"
          placeholder="e.g. Hair, Beard, Massage, Facial"
          defaultValue={initialData?.category ?? ''}
          className="h-12"
        />
      </div>

      {/* Duration and Price - Side by side on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="durationMinutes" className="text-sm font-medium">
            Duration (minutes)
          </Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={1}
            placeholder="30"
            defaultValue={initialData?.durationMinutes ?? 30}
            className={`h-12 ${errors.durationMinutes ? 'border-red-500' : ''}`}
          />
          {errors.durationMinutes && (
            <p className="text-sm text-red-600">{errors.durationMinutes}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium">
            Price
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step="1"
            placeholder="500"
            defaultValue={initialData?.price ?? 0}
            className={`h-12 ${errors.price ? 'border-red-500' : ''}`}
          />
          {errors.price && (
            <p className="text-sm text-red-600">{errors.price}</p>
          )}
        </div>
      </div>

      {/* Active Status - Edit mode only */}
      {initialData && (
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label htmlFor="isActive" className="text-sm font-medium">
              Active
            </Label>
            <p className="text-xs text-muted-foreground">
              Show this service on booking form
            </p>
          </div>
          <Switch
            id="isActive"
            name="isActive"
            defaultChecked={initialData?.isActive ?? true}
            value="true"
          />
        </div>
      )}

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
            ? 'Update Service'
            : 'Save Service'}
        </Button>
      </div>
    </form>
  );
}
