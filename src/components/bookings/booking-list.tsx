'use client';

import { BookingCard } from './booking-card';
import { BookingEmptyState } from './booking-empty-state';

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

interface BookingListProps {
  bookings: Booking[];
  payments: Payment[];
  onMarkCompleted: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onRecordPayment: (bookingId: string, defaultAmount: number) => void;
  onAddBooking: () => void;
}

export function BookingList({
  bookings,
  payments,
  onMarkCompleted,
  onCancel,
  onRecordPayment,
  onAddBooking,
}: BookingListProps) {
  if (bookings.length === 0) {
    return <BookingEmptyState onAddBooking={onAddBooking} />;
  }

  // Create a map of booking_id -> payment for quick lookup
  const paymentMap = new Map(payments.map(p => [p.booking_id, p]));

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          payment={paymentMap.get(booking.id)}
          onMarkCompleted={() => onMarkCompleted(booking.id)}
          onCancel={() => onCancel(booking.id)}
          onRecordPayment={() => onRecordPayment(booking.id, booking.service.price)}
        />
      ))}
    </div>
  );
}
