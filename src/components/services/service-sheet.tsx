'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ServiceForm } from '@/components/forms/service-form';

import type { Tables } from '@/lib/supabase/database.types';

interface ServiceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Tables<'services'> | null;
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

export function ServiceSheet({ isOpen, onClose, service, onSubmit }: ServiceSheetProps) {
  const isEditMode = !!service;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">
            {isEditMode ? 'Edit Service' : 'Add Service'}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Update your service details below.'
              : 'Fill in the details to add a new service.'}
          </SheetDescription>
        </SheetHeader>
        <ServiceForm
          key={service?.id ?? 'new-service'}
          action={async (formData) => {
            const result = await onSubmit(formData);
            if (result.success) {
              onClose();
            }
            return result;
          }}
          initialData={
            service
              ? {
                  name: service.name,
                  category: service.category || '',
                  durationMinutes: service.duration_minutes,
                  price: service.price,
                  isActive: service.is_active,
                  imageUrl: service.image_url,
                }
              : undefined
          }
        />
      </SheetContent>
    </Sheet>
  );
}
