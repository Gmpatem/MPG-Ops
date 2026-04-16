'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceStatusBadge } from './service-status-badge';
import { Scissors } from 'lucide-react';

import type { Tables } from '@/lib/supabase/database.types';

interface ServiceCardProps {
  service: Tables<'services'>;
  onEdit: () => void;
  onToggleStatus: () => void;
}

export function ServiceCard({ service, onEdit, onToggleStatus }: ServiceCardProps) {
  return (
    <Card
      className={`
        p-4 rounded-xl border bg-card
        ${!service.is_active ? 'opacity-60' : ''}
      `}
    >
      {/* Top row: Name and Status */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-base text-foreground leading-tight">
          {service.name}
        </h3>
        <ServiceStatusBadge isActive={service.is_active} />
      </div>

      {/* Second row: Category */}
      <p className="text-sm text-muted-foreground mb-3">
        {service.category || 'Uncategorized'}
      </p>

      {/* Third row: Duration and Price */}
      <div className="flex items-center gap-4 text-sm text-foreground mb-4">
        <span className="font-medium">{service.duration_minutes} min</span>
        <span className="font-medium">${service.price}</span>
      </div>

      {/* Bottom row: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex-1 h-10 text-sm"
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleStatus}
          className="h-10 text-sm text-muted-foreground hover:text-foreground"
        >
          {service.is_active ? 'Disable' : 'Enable'}
        </Button>
      </div>
    </Card>
  );
}
