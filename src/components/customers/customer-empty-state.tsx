'use client';

import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface CustomerEmptyStateProps {
  onAddCustomer: () => void;
}

export function CustomerEmptyState({ onAddCustomer }: CustomerEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No customers yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Add your first customer to start managing bookings and tracking their service history.
      </p>
      <Button onClick={onAddCustomer} className="h-11 px-6">
        Add First Customer
      </Button>
    </div>
  );
}
