'use client';

import { PaymentCard } from './payment-card';
import { PaymentEmptyState } from './payment-empty-state';

import type { Enums } from '@/lib/supabase/database.types';

type PaymentMethod = Enums<'payment_method'>;

interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  created_at: string;
  booking: {
    booking_date: string;
    customer: { name: string };
    service: { name: string };
  };
}

interface PaymentListProps {
  payments: Payment[];
}

export function PaymentList({ payments }: PaymentListProps) {
  if (payments.length === 0) {
    return <PaymentEmptyState />;
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <PaymentCard key={payment.id} payment={payment} />
      ))}
    </div>
  );
}
