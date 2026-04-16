'use client';

import { BookingCard } from './booking-card';
import { BookingEmptyState } from './booking-empty-state';
import { BookingStatus } from './booking-status-badge';

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
  onMarkNoShow: (bookingId: string) => void;
  onEdit: (bookingId: string) => void;
  onAddBooking: () => void;
}

export function BookingList({
  bookings,
  payments,
  onMarkCompleted,
  onCancel,
  onRecordPayment,
  onMarkNoShow,
  onEdit,
  onAddBooking,
}: BookingListProps) {
  if (bookings.length === 0) {
    return <BookingEmptyState onAddBooking={onAddBooking} />;
  }

  const paymentMap = new Map(payments.map((p) => [p.booking_id, p]));

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      {bookings.map((booking, i) => (
        <div key={booking.id} className={i > 0 ? 'border-t' : ''}>
          <BookingCard
            booking={booking}
            payment={paymentMap.get(booking.id)}
            onMarkCompleted={() => onMarkCompleted(booking.id)}
            onCancel={() => onCancel(booking.id)}
            onRecordPayment={() => onRecordPayment(booking.id, booking.service.price)}
            onMarkNoShow={() => onMarkNoShow(booking.id)}
            onEdit={() => onEdit(booking.id)}
          />
        </div>
      ))}
    </div>
  );
}
