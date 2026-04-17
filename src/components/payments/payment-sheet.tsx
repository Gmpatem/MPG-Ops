'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { PaymentForm } from '@/components/forms/payment-form';

interface PaymentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  defaultAmount: number;
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

export function PaymentSheet({ isOpen, onClose, bookingId, defaultAmount, onSubmit }: PaymentSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="responsive" className="overflow-y-auto md:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl">Record Payment</SheetTitle>
          <SheetDescription>
            Record payment for this completed booking.
          </SheetDescription>
        </SheetHeader>
        <PaymentForm
          key={bookingId}
          action={async (formData) => {
            const result = await onSubmit(formData);
            if (result.success) {
              onClose();
            }
            return result;
          }}
          defaultAmount={defaultAmount}
          bookingId={bookingId}
        />
      </SheetContent>
    </Sheet>
  );
}
