'use client';

import { CustomerCard } from './customer-card';
import { CustomerEmptyState } from './customer-empty-state';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

interface CustomerListProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onViewCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
}

export function CustomerList({
  customers,
  onEditCustomer,
  onViewCustomer,
  onAddCustomer,
}: CustomerListProps) {
  if (customers.length === 0) {
    return <CustomerEmptyState onAddCustomer={onAddCustomer} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          onEdit={() => onEditCustomer(customer)}
          onView={() => onViewCustomer(customer)}
        />
      ))}
    </div>
  );
}
