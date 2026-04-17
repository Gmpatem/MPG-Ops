'use client';

import { Badge } from '@/components/ui/badge';

export type BookingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const variants: Record<BookingStatus, { label: string; className: string }> = {
    scheduled: {
      label: 'Scheduled',
      className: 'bg-warning/15 text-warning hover:bg-warning/15',
    },
    completed: {
      label: 'Completed',
      className: 'bg-success/15 text-success hover:bg-success/15',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-destructive/15 text-destructive hover:bg-destructive/15',
    },
    no_show: {
      label: 'No Show',
      className: 'bg-muted text-muted-foreground hover:bg-muted',
    },
  };

  const { label, className } = variants[status];

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  );
}
