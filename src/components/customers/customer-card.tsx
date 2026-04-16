'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, User } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface CustomerCardProps {
  customer: Customer;
  onEdit: () => void;
  onView: () => void;
}

export function CustomerCard({ customer, onEdit, onView }: CustomerCardProps) {
  return (
    <Card className="p-4 rounded-xl border bg-card">
      {/* Top row: Name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base text-foreground leading-tight truncate">
            {customer.name}
          </h3>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-2 mb-4">
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 shrink-0" />
            <span className="truncate">{customer.phone}</span>
          </div>
        )}
        {customer.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        {!customer.phone && !customer.email && (
          <p className="text-sm text-muted-foreground italic">
            No contact information
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onView}
          className="flex-1 h-10 text-sm"
        >
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="flex-1 h-10 text-sm"
        >
          Edit
        </Button>
      </div>
    </Card>
  );
}
