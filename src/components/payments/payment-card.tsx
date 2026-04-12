'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Scissors, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

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

interface PaymentCardProps {
  payment: Payment;
}

export function PaymentCard({ payment }: PaymentCardProps) {
  const methodLabels: Record<PaymentMethod, string> = {
    cash: 'Cash',
    gcash: 'GCash',
    card: 'Card',
    other: 'Other',
  };

  return (
    <Card className="p-4 rounded-xl border bg-card">
      {/* Top row: Amount and Method */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-base">
            ₱{payment.amount.toFixed(2)}
          </span>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          {methodLabels[payment.method]}
        </Badge>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2 mb-2">
        <User className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{payment.booking.customer.name}</span>
      </div>

      {/* Service */}
      <div className="flex items-center gap-2 mb-2">
        <Scissors className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {payment.booking.service.name}
        </span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {format(new Date(payment.booking.booking_date), 'MMM d, yyyy')}
        </span>
      </div>
    </Card>
  );
}
