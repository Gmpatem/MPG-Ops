'use client';

import { ServiceCard } from './service-card';
import { ServiceEmptyState } from './service-empty-state';

import type { Tables } from '@/lib/supabase/database.types';

interface ServiceListProps {
  services: Tables<'services'>[];
  onEditService: (service: Tables<'services'>) => void;
  onToggleStatus: (serviceId: string, currentStatus: boolean) => void;
  onAddService: () => void;
}

export function ServiceList({
  services,
  onEditService,
  onToggleStatus,
  onAddService,
}: ServiceListProps) {
  if (services.length === 0) {
    return <ServiceEmptyState onAddService={onAddService} />;
  }

  return (
    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onEdit={() => onEditService(service)}
          onToggleStatus={() => onToggleStatus(service.id, service.is_active)}
        />
      ))}
    </div>
  );
}
