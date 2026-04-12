'use client';

import { PaymentCard } from './payment-card';
import { PaymentEmptyState } from './payment-empty-state';

type PaymentMethod = 'cash' | 'gcash' | 'card' | 'other';

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
