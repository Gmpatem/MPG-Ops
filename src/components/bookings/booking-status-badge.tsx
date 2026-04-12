'use client';

import { Badge } from '@/components/ui/badge';

type BookingStatus = 'scheduled' | 'completed' | 'cancelled';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const variants: Record<BookingStatus, { label: string; className: string }> = {
    scheduled: {
      label: 'Scheduled',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800 hover:bg-red-100',
    },
  };

  const { label, className } = variants[status];

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  );
}
