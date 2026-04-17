'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('relative text-muted-foreground', className)}
      aria-label="Notifications"
      title="Notifications"
      onClick={() => router.push('/bookings')}
    >
      <Bell className="h-[18px] w-[18px]" />
    </Button>
  );
}
