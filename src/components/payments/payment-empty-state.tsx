'use client';

import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function PaymentEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <CreditCard className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No payments yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">
        Payments will appear here when you record them for completed bookings.
      </p>
      <Link href="/bookings">
        <Button variant="outline" size="sm">
          Go to Bookings
        </Button>
      </Link>
    </div>
  );
}
