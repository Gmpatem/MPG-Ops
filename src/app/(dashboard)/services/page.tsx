'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ServiceList } from '@/components/services/service-list';
import { ServiceSheet } from '@/components/services/service-sheet';
import { ServiceEmptyState } from '@/components/services/service-empty-state';
import { createService, updateService, toggleServiceStatus, getServices } from '@/app/actions/services';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/loading-page';
import { ErrorState } from '@/components/error-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Service {
  id: string;
  name: string;
  category: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

type ServiceFilter = 'all' | 'active' | 'inactive';

export default function ServicesPage() {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ServiceFilter>('all');

  // Fetch services on mount
  useEffect(() => {
    async function loadServices() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getServices();
        setServices(data);
      } catch (err) {
        setError('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    }
    loadServices();
  }, []);

  // Filter services based on active/inactive status
  const filteredServices = useMemo(() => {
    switch (filter) {
      case 'active':
        return services.filter(s => s.is_active);
      case 'inactive':
        return services.filter(s => !s.is_active);
      default:
        return services;
    }
  }, [services, filter]);

  const handleAddService = useCallback(() => {
    setEditingService(null);
    setIsSheetOpen(true);
  }, []);

  const handleEditService = useCallback((service: Service) => {
    setEditingService(service);
    setIsSheetOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    setEditingService(null);
  }, []);

  const handleCreateService = async (formData: FormData) => {
    try {
      const result = await createService(formData);
      if (result.success) {
        const data = await getServices();
        setServices(data);
        router.refresh();
        return { success: true };
      }
      return result;
    } catch (err) {
      return { error: 'Failed to create service' };
    }
  };

  const handleUpdateService = async (formData: FormData) => {
    if (!editingService) return { error: 'No service selected' };
    try {
      const result = await updateService(editingService.id, formData);
      if (result.success) {
        const data = await getServices();
        setServices(data);
        router.refresh();
        return { success: true };
      }
      return result;
    } catch (err) {
      return { error: 'Failed to update service' };
    }
  };

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const result = await toggleServiceStatus(serviceId, !currentStatus);
      if (result.success) {
        const data = await getServices();
        setServices(data);
        router.refresh();
      }
    } catch (err) {
      // Error is handled silently - the toggle just won't update
    }
  };

  const handleRetry = () => {
    async function loadServices() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getServices();
        setServices(data);
      } catch (err) {
        setError('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    }
    loadServices();
  };

  if (isLoading) {
    return (
      <LoadingPage
        title="Services"
        description="Manage the services your business offers, including price and duration."
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage the services your business offers, including price and duration.
            </p>
          </div>
        </div>
        <div className="bg-card rounded-xl border">
          <ErrorState
            title="Failed to load services"
            message={error}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  const hasServices = services.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the services your business offers, including price and duration.
          </p>
        </div>
        <Button
          onClick={handleAddService}
          className="h-11 px-4 self-start"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Filter Bar - Only show when there are services */}
      {hasServices && (
        <div className="flex items-center gap-3">
          <Select
            value={filter}
            onValueChange={(value) => value && setFilter(value as ServiceFilter)}
          >
            <SelectTrigger className="w-[140px] h-10" aria-label="Filter services">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
          </span>
        </div>
      )}

      {/* Services List */}
      {!hasServices ? (
        <div className="bg-card rounded-xl border">
          <ServiceEmptyState onAddService={handleAddService} />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <p className="text-muted-foreground">
            No {filter === 'active' ? 'active' : 'inactive'} services found.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setFilter('all')} 
            className="mt-4"
          >
            Show All Services
          </Button>
        </div>
      ) : (
        <ServiceList
          services={filteredServices}
          onEditService={handleEditService}
          onToggleStatus={handleToggleStatus}
          onAddService={handleAddService}
        />
      )}

      {/* Add/Edit Sheet */}
      <ServiceSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        service={editingService}
        onSubmit={editingService ? handleUpdateService : handleCreateService}
      />
    </div>
  );
}
