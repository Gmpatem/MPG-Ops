'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ServiceStatusBadgeProps {
  isActive: boolean;
}

export function ServiceStatusBadge({ isActive }: ServiceStatusBadgeProps) {
  return (
    <Badge
      variant={isActive ? 'default' : 'secondary'}
      className={cn(
        'text-xs font-medium',
        isActive && 'bg-success/15 text-success hover:bg-success/15'
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
}
