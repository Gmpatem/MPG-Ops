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
        isActive && 'bg-green-100 text-green-800 hover:bg-green-100'
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
}
