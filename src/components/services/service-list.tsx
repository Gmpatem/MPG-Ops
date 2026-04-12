'use client';

import { ServiceCard } from './service-card';
import { ServiceEmptyState } from './service-empty-state';

interface Service {
  id: string;
  name: string;
  category: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

interface ServiceListProps {
  services: Service[];
  onEditService: (service: Service) => void;
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
