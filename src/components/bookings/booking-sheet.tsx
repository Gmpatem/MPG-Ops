'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { BookingForm } from '@/components/forms/booking-form';

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
}

interface BookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  services: Service[];
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
}

export function BookingSheet({ isOpen, onClose, customers, services, onSubmit }: BookingSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">Add Booking</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Schedule a new appointment for a customer.
          </SheetDescription>
        </SheetHeader>
        <BookingForm
          action={async (formData) => {
            const result = await onSubmit(formData);
            if (result.success) {
              onClose();
            }
            return result;
          }}
          customers={customers}
          services={services}
        />
      </SheetContent>
    </Sheet>
  );
}
