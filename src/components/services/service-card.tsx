'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ServiceStatusBadge } from './service-status-badge';
import { Pencil, ImageOff } from 'lucide-react';

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
        p-0 rounded-xl border bg-card transition-all overflow-hidden hover:shadow-md
        ${!service.is_active ? 'bg-muted/30 border-muted' : ''}
      `}
    >
      {/* Image area — fixed height for grid alignment */}
      <div className="w-full h-28 sm:h-32 bg-muted/60 overflow-hidden relative">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={service.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex items-center gap-1.5 text-muted-foreground/60">
              <ImageOff className="w-4 h-4" />
              <span className="text-xs">No image</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        {/* Top row: Name + Meta / Status + Toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug truncate">
              {service.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {service.category || 'Uncategorized'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ServiceStatusBadge isActive={service.is_active} />
            <Switch
              checked={service.is_active}
              onCheckedChange={onToggleStatus}
              size="sm"
              aria-label={service.is_active ? 'Deactivate service' : 'Activate service'}
            />
          </div>
        </div>

        {/* Bottom row: Duration • Price / Edit */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span className="font-medium text-xs sm:text-sm">{service.duration_minutes} min</span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="font-medium text-xs sm:text-sm">₱{service.price}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="h-8 px-2.5 text-xs"
            title="Edit service"
          >
            <Pencil className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
