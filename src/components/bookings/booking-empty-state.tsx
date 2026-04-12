'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface BookingEmptyStateProps {
  onAddBooking: () => void;
}

export function BookingEmptyState({ onAddBooking }: BookingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Calendar className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No bookings for this day
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Add a booking to get started with scheduling appointments.
      </p>
      <Button onClick={onAddBooking} className="h-11 px-6">
        Add Booking
      </Button>
    </div>
  );
}
