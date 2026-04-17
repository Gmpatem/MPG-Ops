'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, X } from 'lucide-react';
import { CustomerList } from '@/components/customers/customer-list';
import { CustomerSheet } from '@/components/customers/customer-sheet';
import { CustomerDetailSheet } from '@/components/customers/customer-detail-sheet';
import { CustomerEmptyState } from '@/components/customers/customer-empty-state';
import { createCustomer, updateCustomer, getCustomersPage } from '@/app/actions/customers';
import { useToast } from '@/components/ui/toast';
import { LoadingPage } from '@/components/loading-page';
import { ErrorState } from '@/components/error-state';
import { Input } from '@/components/ui/input';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

export default function CustomersPage() {
  const { toast } = useToast();
  const PAGE_SIZE = 20;
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersOffset, setCustomersOffset] = useState(0);
  const [hasMoreCustomers, setHasMoreCustomers] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isSearching = searchQuery.trim().length > 0;

  const loadFirstCustomersPage = useCallback(async () => {
    const data = await getCustomersPage(PAGE_SIZE, 0);
    setCustomers(data.items);
    setCustomersOffset(data.items.length);
    setHasMoreCustomers(data.hasMore);
  }, [PAGE_SIZE]);

  // Fetch customers on mount
  useEffect(() => {
    async function loadCustomers() {
      try {
        setIsLoading(true);
        setError(null);
        await loadFirstCustomersPage();
      } catch {
        setError('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    }
    void loadCustomers();
  }, [loadFirstCustomersPage]);

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    
    const query = searchQuery.toLowerCase().trim();
    return customers.filter(customer => {
      const nameMatch = customer.name.toLowerCase().includes(query);
      const phoneMatch = customer.phone?.toLowerCase().includes(query) ?? false;
      return nameMatch || phoneMatch;
    });
  }, [customers, searchQuery]);

  const handleAddCustomer = useCallback(() => {
    setEditingCustomer(null);
    setIsSheetOpen(true);
  }, []);

  const handleViewCustomer = useCallback((customer: Customer) => {
    setViewingCustomer(customer);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setViewingCustomer(null);
  }, []);

  const handleEditCustomer = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setIsSheetOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    setEditingCustomer(null);
  }, []);

  const handleCreateCustomer = async (formData: FormData) => {
    try {
      const result = await createCustomer(formData);
      if (result.success) {
        await loadFirstCustomersPage();
        toast({ title: 'Customer added successfully' });
        return { success: true };
      }
      return result;
    } catch (err) {
      return { error: 'Failed to create customer' };
    }
  };

  const handleUpdateCustomer = async (formData: FormData) => {
    if (!editingCustomer) return { error: 'No customer selected' };
    try {
      const result = await updateCustomer(editingCustomer.id, formData);
      if (result.success) {
        await loadFirstCustomersPage();
        toast({ title: 'Customer updated successfully' });
        return { success: true };
      }
      return result;
    } catch (err) {
      return { error: 'Failed to update customer' };
    }
  };

  const handleRetry = () => {
    async function loadCustomers() {
      try {
        setIsLoading(true);
        setError(null);
        await loadFirstCustomersPage();
      } catch {
        setError('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    }
    void loadCustomers();
  };

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreCustomers) return;

    try {
      setIsLoadingMore(true);
      const data = await getCustomersPage(PAGE_SIZE, customersOffset);
      setCustomers((prev) => [...prev, ...data.items]);
      setCustomersOffset((prev) => prev + data.items.length);
      setHasMoreCustomers(data.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  }, [customersOffset, hasMoreCustomers, isLoadingMore, PAGE_SIZE]);

  const canLoadMore = hasMoreCustomers && !isSearching;

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <LoadingPage
        title="Customers"
        description="Manage your customers and their contact details."
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your customers and their contact details.
            </p>
          </div>
        </div>
        <div className="bg-card rounded-xl border">
          <ErrorState
            title="Failed to load customers"
            message={error}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  const hasCustomers = customers.length > 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your customers and their contact details.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          {hasCustomers && (
            <div className="relative w-52 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-10"
              />
              {isSearching && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          <Button
            onClick={handleAddCustomer}
            className="h-10 px-3 sm:px-4"
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Results Count */}
      {hasCustomers && isSearching && (
        <p className="text-sm text-muted-foreground">
          {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} found
        </p>
      )}

      {/* Customers List */}
      {!hasCustomers ? (
        <div className="bg-card rounded-xl border">
          <CustomerEmptyState onAddCustomer={handleAddCustomer} />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <p className="text-muted-foreground">
            No customers found matching &quot;{searchQuery}&quot;
          </p>
          <Button 
            variant="outline" 
            onClick={clearSearch} 
            className="mt-4"
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <>
          <CustomerList
            customers={filteredCustomers}
            onEditCustomer={handleEditCustomer}
            onViewCustomer={handleViewCustomer}
            onAddCustomer={handleAddCustomer}
          />
          {canLoadMore && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="h-10"
              >
                {isLoadingMore ? 'Loading…' : 'Load more customers'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Sheet */}
      <CustomerSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        customer={editingCustomer}
        onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
      />

      {/* Customer Detail Sheet */}
      <CustomerDetailSheet
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        customer={viewingCustomer}
      />
    </div>
  );
}
