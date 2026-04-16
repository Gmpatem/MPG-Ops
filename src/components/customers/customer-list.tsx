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
    <div className="bg-card rounded-xl border overflow-hidden">
      {/* Column headers — desktop only */}
      <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 border-b bg-muted/40">
        <div className="w-10 shrink-0" />
        <div className="flex-1 grid grid-cols-2 gap-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Name
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Contact
          </span>
        </div>
        <div className="w-28 shrink-0" />
      </div>

      {/* Rows */}
      {customers.map((customer, i) => (
        <div key={customer.id} className={i > 0 ? 'border-t' : ''}>
          <CustomerCard
            customer={customer}
            onEdit={() => onEditCustomer(customer)}
            onView={() => onViewCustomer(customer)}
          />
        </div>
      ))}
    </div>
  );
}
