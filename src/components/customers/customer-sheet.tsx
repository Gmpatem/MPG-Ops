'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CustomerForm } from '@/components/forms/customer-form';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

interface CustomerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

export function CustomerSheet({ isOpen, onClose, customer, onSubmit }: CustomerSheetProps) {
  const isEditMode = !!customer;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">
            {isEditMode ? 'Edit Customer' : 'Add Customer'}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Update customer details below.'
              : 'Fill in the details to add a new customer.'}
          </SheetDescription>
        </SheetHeader>
        <CustomerForm
          action={async (formData) => {
            const result = await onSubmit(formData);
            if (result.success) {
              onClose();
            }
            return result;
          }}
          initialData={customer}
        />
      </SheetContent>
    </Sheet>
  );
}
