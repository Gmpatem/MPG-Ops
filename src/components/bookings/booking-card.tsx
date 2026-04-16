'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge, BookingStatus } from './booking-status-badge';
import { Clock, User, Scissors, CheckCircle, Pencil } from 'lucide-react';

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
    <Card className="p-4 rounded-xl border bg-card">
      {/* Top row: Time, Status, Edit */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-base">
            {booking.start_time} - {booking.end_time}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BookingStatusBadge status={booking.status} />
          <button
            onClick={onEdit}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            aria-label="Edit booking"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2 mb-2">
        <User className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{booking.customer.name}</span>
      </div>

      {/* Service */}
      <div className="flex items-center gap-2 mb-4">
        <Scissors className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {booking.service.name} ({booking.service.duration_minutes} min)
        </span>
      </div>

      {/* Actions for Scheduled */}
      {isScheduled && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkCompleted}
            className="flex-1 h-10 text-sm min-w-30"
          >
            Mark Completed
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkNoShow}
            className="h-10 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50"
          >
            No-Show
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-10 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Payment status for Completed */}
      {isCompleted && (
        <div className="flex items-center gap-2">
          {hasPayment ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-md flex-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Paid ₱{payment.amount.toFixed(2)}
              </span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onRecordPayment}
              className="flex-1 h-10 text-sm border-green-600 text-green-600 hover:bg-green-50"
            >
              Record Payment
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
