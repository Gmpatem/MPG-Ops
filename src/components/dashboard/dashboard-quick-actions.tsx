'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CustomerSheet } from '@/components/customers/customer-sheet';
import { ServiceSheet } from '@/components/services/service-sheet';
import { BookingSheet } from '@/components/bookings/booking-sheet';
import { createCustomer } from '@/app/actions/customers';
import { createService } from '@/app/actions/services';
import { createBooking } from '@/app/actions/bookings';
import { getCustomers } from '@/app/actions/customers';
import { getServices } from '@/app/actions/services';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
}

export function DashboardQuickActions() {
  const { toast } = useToast();
  const router = useRouter();

  const [isCustomerSheetOpen, setIsCustomerSheetOpen] = useState(false);
  const [isServiceSheetOpen, setIsServiceSheetOpen] = useState(false);
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [bookingCustomers, setBookingCustomers] = useState<Customer[]>([]);
  const [bookingServices, setBookingServices] = useState<Service[]>([]);
  const [isLoadingBookingData, setIsLoadingBookingData] = useState(false);

  const handleOpenBookingSheet = async () => {
    setIsLoadingBookingData(true);
    try {
      const [customers, services] = await Promise.all([getCustomers(), getServices()]);
      setBookingCustomers(customers);
      setBookingServices(services);
      setIsBookingSheetOpen(true);
    } finally {
      setIsLoadingBookingData(false);
    }
  };

  const handleCreateCustomer = async (formData: FormData) => {
    try {
      const result = await createCustomer(formData);
      if (result.success) {
        router.refresh();
        toast({ title: 'Customer added successfully' });
        return { success: true as const };
      }
      return result;
    } catch {
      return { error: 'Failed to create customer' };
    }
  };

  const handleCreateService = async (formData: FormData) => {
    try {
      const result = await createService(formData);
      if (result.success) {
        router.refresh();
        toast({ title: 'Service created successfully' });
        return { success: true as const };
      }
      return result;
    } catch {
      return { error: 'Failed to create service' };
    }
  };

  const handleCreateBooking = async (formData: FormData) => {
    try {
      const result = await createBooking(formData);
      if (result.success) {
        router.refresh();
        toast({ title: 'Booking created successfully' });
        return { success: true as const };
      }
      return result;
    } catch {
      return { error: 'Failed to create booking' };
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
        <Button onClick={() => setIsCustomerSheetOpen(true)} className="h-10 text-sm">
          Add Customer
        </Button>
        <Button
          variant="outline"
          onClick={handleOpenBookingSheet}
          disabled={isLoadingBookingData}
          className="h-10 text-sm"
        >
          {isLoadingBookingData ? 'Loading...' : 'New Booking'}
        </Button>
        <Button variant="outline" onClick={() => setIsServiceSheetOpen(true)} className="h-10 text-sm col-span-2 sm:col-span-1">
          Add Service
        </Button>
      </div>

      <CustomerSheet
        isOpen={isCustomerSheetOpen}
        onClose={() => setIsCustomerSheetOpen(false)}
        onSubmit={handleCreateCustomer}
      />

      <ServiceSheet
        isOpen={isServiceSheetOpen}
        onClose={() => setIsServiceSheetOpen(false)}
        onSubmit={handleCreateService}
      />

      <BookingSheet
        isOpen={isBookingSheetOpen}
        onClose={() => setIsBookingSheetOpen(false)}
        customers={bookingCustomers}
        services={bookingServices}
        onSubmit={handleCreateBooking}
      />
    </>
  );
}
