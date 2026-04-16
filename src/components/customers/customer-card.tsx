'use client';

import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';

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
  const initial = customer.name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-semibold text-primary select-none">
        {initial}
      </div>

      {/* Name + contact — stacks on mobile, grid on sm+ */}
      <div className="flex-1 min-w-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:items-center">
        <p className="text-sm font-medium text-foreground truncate">
          {customer.name}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 sm:mt-0">
          {customer.phone && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="w-3 h-3 shrink-0" />
              {customer.phone}
            </span>
          )}
          {customer.email && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-40">{customer.email}</span>
            </span>
          )}
          {!customer.phone && !customer.email && (
            <span className="text-xs text-muted-foreground italic">No contact info</span>
          )}
        </div>
      </div>

      {/* Inline actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onView}
          className="h-8 text-xs px-3"
        >
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 text-xs px-3"
        >
          Edit
        </Button>
      </div>
    </div>
  );
}
