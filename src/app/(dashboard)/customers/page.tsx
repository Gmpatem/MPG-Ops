'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, X } from 'lucide-react';
import { CustomerList } from '@/components/customers/customer-list';
import { CustomerSheet } from '@/components/customers/customer-sheet';
import { CustomerEmptyState } from '@/components/customers/customer-empty-state';
import { createCustomer, updateCustomer, getCustomers } from '@/app/actions/customers';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch customers on mount
  useEffect(() => {
    async function loadCustomers() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCustomers();
        setCustomers(data);
      } catch (err) {
        setError('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    }
    loadCustomers();
  }, []);

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
        const data = await getCustomers();
        setCustomers(data);
        router.refresh();
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
        const data = await getCustomers();
        setCustomers(data);
        router.refresh();
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
        const data = await getCustomers();
        setCustomers(data);
      } catch (err) {
        setError('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    }
    loadCustomers();
  };

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
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
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
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your customers and their contact details.
          </p>
        </div>
        <Button
          onClick={handleAddCustomer}
          className="h-11 px-4 self-start"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search Bar - Only show when there are customers */}
      {hasCustomers && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-11"
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
        <CustomerList
          customers={filteredCustomers}
          onEditCustomer={handleEditCustomer}
          onAddCustomer={handleAddCustomer}
        />
      )}

      {/* Add/Edit Sheet */}
      <CustomerSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        customer={editingCustomer}
        onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
      />
    </div>
  );
}
