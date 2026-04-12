'use client';

import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';

interface ServiceEmptyStateProps {
  onAddService: () => void;
}

export function ServiceEmptyState({ onAddService }: ServiceEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Scissors className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No services yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Start by adding your first service so bookings can be created later.
      </p>
      <Button onClick={onAddService} className="h-11 px-6">
        Add First Service
      </Button>
    </div>
  );
}
