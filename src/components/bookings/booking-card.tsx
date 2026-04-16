'use client';

import { Button } from '@/components/ui/button';
import { BookingStatusBadge, BookingStatus } from './booking-status-badge';
import { CheckCircle, Pencil } from 'lucide-react';

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
}

interface BookingCardProps {
  booking: Booking;
  payment?: Payment | null;
  onMarkCompleted: () => void;
  onCancel: () => void;
  onRecordPayment: () => void;
  onMarkNoShow: () => void;
  onEdit: () => void;
}

function fmt(time: string) {
  return time.slice(0, 5);
}

export function BookingCard({
  booking,
  payment,
  onMarkCompleted,
  onCancel,
  onRecordPayment,
  onMarkNoShow,
  onEdit,
}: BookingCardProps) {
  const isScheduled = booking.status === 'scheduled';
  const isCompleted = booking.status === 'completed';
  const hasPayment = !!payment;

  return (
    <div className="px-4 py-3">
      {/* Row 1: time + status + edit */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {fmt(booking.start_time)}–{fmt(booking.end_time)}
        </span>
        <div className="flex items-center gap-2">
          <BookingStatusBadge status={booking.status} />
          <button
            onClick={onEdit}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Edit booking"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: customer · service */}
      <p className="text-sm text-muted-foreground truncate mb-2.5">
        <span className="font-medium text-foreground">{booking.customer.name}</span>
        {' · '}
        {booking.service.name}
        <span className="text-xs"> ({booking.service.duration_minutes}min)</span>
      </p>

      {/* Row 3: actions (scheduled only) */}
      {isScheduled && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkCompleted}
            className="h-8 text-xs px-3"
          >
            Complete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkNoShow}
            className="h-8 text-xs px-2.5 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
          >
            No-Show
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 text-xs px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Row 3: payment state (completed only) */}
      {isCompleted && (
        <div>
          {hasPayment ? (
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Paid · ₱{payment.amount.toFixed(2)}
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onRecordPayment}
              className="h-8 text-xs px-3 border-green-600 text-green-600 hover:bg-green-50"
            >
              Record Payment
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
