'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { BookingList } from '@/components/bookings/booking-list';
import { BookingSheet } from '@/components/bookings/booking-sheet';
import { BookingEmptyState } from '@/components/bookings/booking-empty-state';
import { PaymentSheet } from '@/components/payments/payment-sheet';
import { createBooking, updateBookingStatus, getBookingsByDate } from '@/app/actions/bookings';
import { getCustomers } from '@/app/actions/customers';
import { getServices } from '@/app/actions/services';
import { recordPayment, getPayments } from '@/app/actions/payments';
import { useRouter } from 'next/navigation';
import { format, addDays, subDays } from 'date-fns';
import { LoadingPage } from '@/components/loading-page';
import { ErrorState } from '@/components/error-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type BookingStatus = 'scheduled' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  customer: { name: string };
  service: { name: string; duration_minutes: number; price: number };
  start_time: string;
  end_time: string;
  status: BookingStatus;
}

interface Payment {
  id: string;
  amount: number;
  booking_id: string;
}

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
}

type StatusFilter = 'all' | BookingStatus;

export default function BookingsPage() {
  const router = useRouter();
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [defaultAmount, setDefaultAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Fetch data on mount and when date changes
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [bookingsData, paymentsData, customersData, servicesData] = await Promise.all([
          getBookingsByDate(format(selectedDate, 'yyyy-MM-dd')),
          getPayments(),
          getCustomers(),
          getServices(),
        ]);
        setBookings(bookingsData);
        setPayments(paymentsData);
        setCustomers(customersData);
        setServices(servicesData);
      } catch (err) {
        setError('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedDate]);

  // Filter bookings based on status
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter(b => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const handlePreviousDay = useCallback(() => {
    setSelectedDate((prev) => subDays(prev, 1));
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => addDays(prev, 1));
  }, []);

  const handleAddBooking = useCallback(() => {
    setIsBookingSheetOpen(true);
  }, []);

  const handleCloseBookingSheet = useCallback(() => {
    setIsBookingSheetOpen(false);
  }, []);

  const handleClosePaymentSheet = useCallback(() => {
    setIsPaymentSheetOpen(false);
    setSelectedBookingId('');
    setDefaultAmount(0);
  }, []);

  const refreshData = async () => {
    const [bookingsData, paymentsData] = await Promise.all([
      getBookingsByDate(format(selectedDate, 'yyyy-MM-dd')),
      getPayments(),
    ]);
    setBookings(bookingsData);
    setPayments(paymentsData);
  };

  const handleCreateBooking = async (formData: FormData) => {
    try {
      const result = await createBooking(formData);
      if (result.success) {
        await refreshData();
        router.refresh();
        return { success: true };
      }
      return result;
    } catch (err) {
      return { error: 'Failed to create booking' };
    }
  };

  const handleMarkCompleted = async (bookingId: string) => {
    try {
      const result = await updateBookingStatus(bookingId, 'completed');
      if (result.success) {
        await refreshData();
        router.refresh();
      }
    } catch (err) {
      // Error handled silently
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      const result = await updateBookingStatus(bookingId, 'cancelled');
      if (result.success) {
        await refreshData();
        router.refresh();
      }
    } catch (err) {
      // Error handled silently
    }
  };

  const handleRecordPayment = useCallback((bookingId: string, amount: number) => {
    setSelectedBookingId(bookingId);
    setDefaultAmount(amount);
    setIsPaymentSheetOpen(true);
  }, []);

  const handleSubmitPayment = async (formData: FormData) => {
    try {
      const result = await recordPayment(formData);
      if (result.success) {
        await refreshData();
        router.refresh();
        return { success: true };
      }
      return result;
    } catch (err) {
      return { error: 'Failed to record payment' };
    }
  };

  const handleRetry = () => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [bookingsData, paymentsData, customersData, servicesData] = await Promise.all([
          getBookingsByDate(format(selectedDate, 'yyyy-MM-dd')),
          getPayments(),
          getCustomers(),
          getServices(),
        ]);
        setBookings(bookingsData);
        setPayments(paymentsData);
        setCustomers(customersData);
        setServices(servicesData);
      } catch (err) {
        setError('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  if (isLoading) {
    return (
      <LoadingPage
        title="Bookings"
        description="Manage your daily appointments."
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your daily appointments.
            </p>
          </div>
        </div>
        <div className="bg-card rounded-xl border">
          <ErrorState
            title="Failed to load bookings"
            message={error}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  const hasBookings = bookings.length > 0;
  const hasFilteredBookings = filteredBookings.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your daily appointments.
          </p>
        </div>
        <Button
          onClick={handleAddBooking}
          className="h-11 px-4 self-start"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Booking
        </Button>
      </div>

      {/* Date Selector */}
      <div className="flex items-center justify-between bg-card rounded-xl border p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousDay}
          className="h-10 w-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <p className="font-semibold text-lg">
            {isToday ? 'Today' : format(selectedDate, 'EEEE')}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(selectedDate, 'MMMM d, yyyy')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextDay}
          className="h-10 w-10"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Status Filter - Only show when there are bookings */}
      {hasBookings && (
        <div className="flex items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => value && setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-[160px] h-10" aria-label="Filter bookings by status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
          </span>
        </div>
      )}

      {/* Bookings List */}
      {!hasBookings ? (
        <div className="bg-card rounded-xl border">
          <BookingEmptyState onAddBooking={handleAddBooking} />
        </div>
      ) : !hasFilteredBookings ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <p className="text-muted-foreground">
            No {statusFilter !== 'all' ? statusFilter : ''} bookings for this day.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setStatusFilter('all')} 
            className="mt-4"
          >
            Show All Bookings
          </Button>
        </div>
      ) : (
        <BookingList
          bookings={filteredBookings}
          payments={payments}
          onMarkCompleted={handleMarkCompleted}
          onCancel={handleCancel}
          onRecordPayment={handleRecordPayment}
          onAddBooking={handleAddBooking}
        />
      )}

      {/* Add Booking Sheet */}
      <BookingSheet
        isOpen={isBookingSheetOpen}
        onClose={handleCloseBookingSheet}
        customers={customers}
        services={services}
        onSubmit={handleCreateBooking}
      />

      {/* Record Payment Sheet */}
      <PaymentSheet
        isOpen={isPaymentSheetOpen}
        onClose={handleClosePaymentSheet}
        bookingId={selectedBookingId}
        defaultAmount={defaultAmount}
        onSubmit={handleSubmitPayment}
      />
    </div>
  );
}
