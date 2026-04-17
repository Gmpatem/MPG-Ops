'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FormStatus } from '@/components/form-status';
import { ImagePlus, X } from 'lucide-react';

interface ServiceFormProps {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  initialData?: {
    name: string;
    category: string;
    durationMinutes: number;
    price: number;
    isActive: boolean;
    imageUrl?: string | null;
  };
}

export function ServiceForm({ action, initialData }: ServiceFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
  }

  function handleRemoveImage() {
    setPreviewUrl(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 px-5 pt-2 pb-6">
      {error && <FormStatus type="error" message={error} />}

      {/* Image Upload */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Service image</Label>
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-4">
            {previewUrl ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                <Image
                  src={previewUrl}
                  alt="Service preview"
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 p-1.5 rounded-full bg-foreground/60 text-background hover:bg-foreground/80 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/50 shrink-0">
                <ImagePlus className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  handleFileChange(e);
                  setRemoveImage(false);
                }}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                JPG, PNG or WebP up to 2MB
              </p>
            </div>
          </div>
        </div>
        {removeImage && <input type="hidden" name="removeImage" value="true" />}
      </div>

      {/* Service Name */}
      <div className="space-y-3">
        <Label htmlFor="name" className="text-sm font-medium">
          Service name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Haircut"
          defaultValue={initialData?.name ?? ''}
          className={`h-12 ${errors.name ? 'border-destructive' : ''}`}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-3">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-3">
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
            className={`h-12 ${errors.durationMinutes ? 'border-destructive' : ''}`}
          />
          {errors.durationMinutes && (
            <p className="text-sm text-destructive">{errors.durationMinutes}</p>
          )}
        </div>

        <div className="space-y-3">
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
            className={`h-12 ${errors.price ? 'border-destructive' : ''}`}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price}</p>
          )}
        </div>
      </div>

      {/* Active Status - Edit mode only */}
      {initialData && (
        <div className="flex items-center justify-between rounded-xl border bg-muted/20 p-4">
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
      <div className="pt-2">
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
