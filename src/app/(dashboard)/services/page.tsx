'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ServiceList } from '@/components/services/service-list';
import { ServiceSheet } from '@/components/services/service-sheet';
import { ServiceEmptyState } from '@/components/services/service-empty-state';
import { ServicePublicSection } from '@/components/services/service-public-section';
import { createService, updateService, toggleServiceStatus, getServices } from '@/app/actions/services';
import { getCurrentBusiness } from '@/app/actions/business';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { LoadingPage } from '@/components/loading-page';
import { ErrorState } from '@/components/error-state';
import { LimitTrigger } from '@/components/upgrade/limit-trigger';
import { FeatureGate } from '@/components/upgrade/feature-gate';
import { canUseFeature, PLAN_LIMITS } from '@/lib/subscription';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Tables } from '@/lib/supabase/database.types';

type ServiceFilter = 'all' | 'active' | 'inactive';
type Tab = 'services' | 'public' | 'payments' | 'promotions' | 'ai-reminders';

const tabs: { id: Tab; label: string }[] = [
  { id: 'services', label: 'Services' },
  { id: 'public', label: 'Public Booking' },
  { id: 'payments', label: 'Payments' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'ai-reminders', label: 'AI Reminders' },
];

export default function ServicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingService, setEditingService] = useState<Tables<'services'> | null>(null);
  const [services, setServices] = useState<Tables<'services'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ServiceFilter>('all');
  const [business, setBusiness] = useState<Tables<'businesses'> | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [featureGateOpen, setFeatureGateOpen] = useState(false);
  const [featureGateConfig, setFeatureGateConfig] = useState<{ featureName: string; requiredPlan: 'pro' | 'business' }>({
    featureName: '',
    requiredPlan: 'pro',
  });

  // Fetch services and business on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [svcData, bizData] = await Promise.all([getServices(), getCurrentBusiness()]);
        setServices(svcData);
        setBusiness(bizData);
      } catch (err) {
        setError('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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

  const effectivePlan = business ? (canUseFeature(business, 'business') ? 'business' : canUseFeature(business, 'pro') ? 'pro' : 'free') : 'free';
  const serviceLimit = PLAN_LIMITS[effectivePlan].maxServices;
  const atServiceLimit = serviceLimit !== null && services.length >= serviceLimit;

  const handleAddService = useCallback(() => {
    if (atServiceLimit) {
      setLimitModalOpen(true);
      return;
    }
    setEditingService(null);
    setIsSheetOpen(true);
  }, [atServiceLimit]);

  const handleEditService = useCallback((service: Tables<'services'>) => {
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
        toast({ title: 'Service created successfully' });
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
        toast({ title: 'Service updated successfully' });
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
        toast({
          title: currentStatus ? 'Service deactivated' : 'Service activated',
        });
      }
    } catch (err) {
      // silently ignore
    }
  };

  const handleRetry = () => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [svcData, bizData] = await Promise.all([getServices(), getCurrentBusiness()]);
        setServices(svcData);
        setBusiness(bizData);
      } catch (err) {
        setError('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  };

  const onTabClick = (tab: Tab) => {
    if (tab === 'payments' && business && !canUseFeature(business, 'business')) {
      setFeatureGateConfig({ featureName: 'Payments & Invoicing', requiredPlan: 'business' });
      setFeatureGateOpen(true);
      return;
    }
    if (tab === 'promotions' && business && !canUseFeature(business, 'pro')) {
      setFeatureGateConfig({ featureName: 'Promotions & Deals', requiredPlan: 'pro' });
      setFeatureGateOpen(true);
      return;
    }
    if (tab === 'ai-reminders' && business && !canUseFeature(business, 'business')) {
      setFeatureGateConfig({ featureName: 'AI Reminders', requiredPlan: 'business' });
      setFeatureGateOpen(true);
      return;
    }
    setActiveTab(tab);
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
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the services your business offers, including price and duration.
          </p>
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
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground text-sm mt-0.5 sm:mt-1">
            Manage your services and public booking appearance.
          </p>
        </div>
        {activeTab === 'services' && (
          <Button
            onClick={handleAddService}
            className="h-11 px-4 self-start text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        )}
      </div>

      {/* Limit progress bar for Free plan */}
      {business && serviceLimit !== null && activeTab === 'services' && (
        <div className="rounded-xl border bg-card px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-medium">Service limit</span>
            <span className={atServiceLimit ? 'text-amber-600 font-semibold' : 'font-medium text-foreground'}>
              {services.length} / {serviceLimit}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${atServiceLimit ? 'bg-amber-500' : 'bg-primary'}`}
              style={{ width: `${Math.min(100, (services.length / serviceLimit) * 100)}%` }}
            />
          </div>
          {atServiceLimit && (
            <p className="mt-1.5 text-amber-600 text-[11px]">
              You&apos;ve reached the Free plan service limit. Upgrade to Pro for unlimited services.
            </p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto scrollbar-hide gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={cn(
              'px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Services (internal CRUD) */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          {hasServices && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Select
                value={filter}
                onValueChange={(value) => value && setFilter(value as ServiceFilter)}
              >
                <SelectTrigger className="w-36 h-10 text-sm" aria-label="Filter services">
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
            <div className="bg-card rounded-xl border p-6 sm:p-8 text-center">
              <p className="text-muted-foreground">
                No {filter === 'active' ? 'active' : 'inactive'} services found.
              </p>
              <Button
                variant="outline"
                onClick={() => setFilter('all')}
                className="mt-4 h-10 text-sm"
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
        </div>
      )}

      {/* Tab: Public Booking presentation */}
      {activeTab === 'public' && (
        <ServicePublicSection />
      )}

      {activeTab === 'payments' && (
        <div className="bg-card rounded-xl border p-6 sm:p-8 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            Payments & Invoicing
          </p>
          <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
            Track payments, issue invoices, and manage customer billing history. 
            Full payment gateway integration coming soon.
          </p>
        </div>
      )}

      {activeTab === 'promotions' && (
        <div className="bg-card rounded-xl border p-6 sm:p-8 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            Promotions & Deals coming soon.
          </p>
          <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
            Create discounts, package deals, and seasonal offers for your services.
          </p>
        </div>
      )}

      {activeTab === 'ai-reminders' && (
        <div className="bg-card rounded-xl border p-6 sm:p-8 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            AI Reminders & Rescheduling
          </p>
          <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
            Automated appointment reminders, smart rescheduling suggestions, 
            and no-show recovery powered by AI. Coming soon.
          </p>
        </div>
      )}

      {/* Add/Edit Sheet */}
      <ServiceSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        service={editingService}
        onSubmit={editingService ? handleUpdateService : handleCreateService}
      />

      {/* Limit trigger modal */}
      <LimitTrigger
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        title="Service limit reached"
        description={`The Free plan is limited to ${serviceLimit} services. Upgrade to Pro to add unlimited services.`}
      />

      {/* Feature gate modal */}
      <FeatureGate
        open={featureGateOpen}
        onOpenChange={setFeatureGateOpen}
        requiredPlan={featureGateConfig.requiredPlan}
        featureName={featureGateConfig.featureName}
      />
    </div>
  );
}
