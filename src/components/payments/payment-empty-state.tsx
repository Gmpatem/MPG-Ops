'use client';

import { CreditCard } from 'lucide-react';

export function PaymentEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <CreditCard className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No payments yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Payments will appear here when you record them for completed bookings.
      </p>
    </div>
  );
}
