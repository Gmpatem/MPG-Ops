'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { BookingList } from '@/components/bookings/booking-list';
import { BookingSheet } from '@/components/bookings/booking-sheet';
import { BookingEmptyState } from '@/components/bookings/booking-empty-state';
import { PaymentSheet } from '@/components/payments/payment-sheet';
import { createBooking, updateBooking, updateBookingStatus, getBookingsByDate } from '@/app/actions/bookings';
import { getCustomers } from '@/app/actions/customers';
import { getServices } from '@/app/actions/services';
import { recordPayment, getPayments } from '@/app/actions/payments';
import { useToast } from '@/components/ui/toast';
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

type BookingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

interface Booking {
  id: string;
  customer_id: string;
  service_id: string;
  booking_date: string;
  customer: { name: string };
  service: { name: string; duration_minutes: number; price: number };
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
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

interface EditingBooking {
  id: string;
  customer_id: string;
  service_id: string;
  booking_date: string;
  start_time: string;
  notes: string | null;
}

export default function BookingsPage() {
  const { toast } = useToast();
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<EditingBooking | null>(null);
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
  const [isDateLoading, setIsDateLoading] = useState(false);

  const fetchSupportData = useCallback(async () => {
    const [customersData, servicesData] = await Promise.all([
      getCustomers(),
      getServices(),
    ]);
    setCustomers(customersData);
    setServices(servicesData);
  }, []);

  const fetchDateData = useCallback(
    async (date: Date, showDateLoader = false) => {
      try {
        if (showDateLoader) {
          setIsDateLoading(true);
        }
        setError(null);
        const [bookingsData, paymentsData] = await Promise.all([
          getBookingsByDate(format(date, 'yyyy-MM-dd')),
          getPayments(),
        ]);
        setBookings(bookingsData);
        setPayments(paymentsData);
      } catch {
        setError('Failed to load bookings');
      } finally {
        if (showDateLoader) {
          setIsDateLoading(false);
        }
      }
    },
    []
  );

  // Initial load: static support data + date data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        setError(null);
        await fetchSupportData();
        await fetchDateData(new Date());
      } catch {
        setError('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialData();
  }, [fetchSupportData, fetchDateData]);

  // Filter bookings based on status
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter(b => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const handlePreviousDay = useCallback(() => {
    setSelectedDate((prev) => {
      const nextDate = subDays(prev, 1);
      void fetchDateData(nextDate, true);
      return nextDate;
    });
  }, [fetchDateData]);

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => {
      const nextDate = addDays(prev, 1);
      void fetchDateData(nextDate, true);
      return nextDate;
    });
  }, [fetchDateData]);

  const handleAddBooking = useCallback(() => {
    setIsBookingSheetOpen(true);
  }, []);

  const handleCloseBookingSheet = useCallback(() => {
    setIsBookingSheetOpen(false);
  }, []);

  const handleEditBooking = useCallback((bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    setEditingBooking({
      id: booking.id,
      customer_id: booking.customer_id,
      service_id: booking.service_id,
      booking_date: booking.booking_date,
      start_time: booking.start_time,
      notes: booking.notes,
    });
    setIsEditSheetOpen(true);
  }, [bookings]);

  const handleCloseEditSheet = useCallback(() => {
    setIsEditSheetOpen(false);
    setEditingBooking(null);
  }, []);

  const handleClosePaymentSheet = useCallback(() => {
    setIsPaymentSheetOpen(false);
    setSelectedBookingId('');
    setDefaultAmount(0);
  }, []);

  const refreshData = useCallback(async () => {
    await fetchDateData(selectedDate);
  }, [fetchDateData, selectedDate]);

  const handleCreateBooking = async (formData: FormData) => {
    try {
      const result = await createBooking(formData);
      if (result.success) {
        await refreshData();
        toast({ title: 'Booking created successfully' });
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
        toast({ title: 'Booking marked as completed' });
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
        toast({ title: 'Booking cancelled' });
      }
    } catch (err) {
      // Error handled silently
    }
  };

  const handleMarkNoShow = async (bookingId: string) => {
    try {
      const result = await updateBookingStatus(bookingId, 'no_show');
      if (result.success) {
        await refreshData();
        toast({ title: 'Booking marked as no-show' });
      }
    } catch (err) {
      // Error handled silently
    }
  };

  const handleUpdateBooking = async (formData: FormData) => {
    if (!editingBooking) return { error: 'No booking selected' };
    try {
      const result = await updateBooking(editingBooking.id, formData);
      if (result.success) {
        await refreshData();
        toast({ title: 'Booking updated successfully' });
        return { success: true };
      }
      return result;
    } catch (err) {
      return { error: 'Failed to update booking' };
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
        toast({ title: 'Payment recorded successfully' });
        return { success: true };
      }
      return result;
    } catch (err) {
      return { error: 'Failed to record payment' };
    }
  };

  const handleRetry = () => {
    async function reloadData() {
      try {
        setIsLoading(true);
        setError(null);
        await Promise.all([fetchSupportData(), fetchDateData(selectedDate)]);
      } finally {
        setIsLoading(false);
      }
    }

    void reloadData();
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
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your daily appointments.
          </p>
        </div>
        <Button
          onClick={handleAddBooking}
          className="h-10 px-3 sm:px-4 self-start"
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Booking</span>
        </Button>
      </div>

      {/* Date Selector + Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex items-center justify-between bg-card rounded-xl border p-3 md:py-2.5 md:px-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousDay}
            className="h-10 w-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="font-semibold text-base sm:text-lg">
              {isToday ? 'Today' : format(selectedDate, 'EEEE')}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
            {isDateLoading && (
              <p className="text-xs text-muted-foreground mt-0.5">Updating…</p>
            )}
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
          <div className="flex items-center gap-3 shrink-0">
            <Select
              value={statusFilter}
              onValueChange={(value) => value && setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="w-40 h-11" aria-label="Filter bookings by status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bookings</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground hidden sm:inline whitespace-nowrap">
              {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
            </span>
          </div>
        )}
      </div>

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
          onMarkNoShow={handleMarkNoShow}
          onEdit={handleEditBooking}
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

      {/* Edit Booking Sheet */}
      <BookingSheet
        isOpen={isEditSheetOpen}
        onClose={handleCloseEditSheet}
        customers={customers}
        services={services}
        initialData={editingBooking ?? undefined}
        bookingId={editingBooking?.id}
        onSubmit={handleUpdateBooking}
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
