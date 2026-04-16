'use client';

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { BookingStatusBadge, BookingStatus } from '@/components/bookings/booking-status-badge';
import { Phone, Mail, FileText, Calendar, Clock } from 'lucide-react';
import { getBookingsByCustomer } from '@/app/actions/bookings';
import { format, parseISO } from 'date-fns';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

interface ServiceRow {
  name: string;
  price: number;
}

interface PaymentRow {
  amount: number;
  status: string;
}

// Supabase returns joined rows as arrays for one-to-many relations
interface HistoryEntry {
  id: string;
  booking_date: string;
  start_time: string;
  status: BookingStatus;
  service: ServiceRow[] | ServiceRow | null;
  payment: PaymentRow[] | PaymentRow | null;
}

interface CustomerDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function CustomerDetailSheet({ isOpen, onClose, customer }: CustomerDetailSheetProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !customer) return;
    setIsLoading(true);
    getBookingsByCustomer(customer.id)
      .then((data) => setHistory(data as HistoryEntry[]))
      .finally(() => setIsLoading(false));
  }, [isOpen, customer]);

  const lastVisit = history.length > 0 ? history[0].booking_date : null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="responsive" className="overflow-y-auto">
        {customer && (
          <>
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl">{customer.name}</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Customer profile and service history
              </SheetDescription>
            </SheetHeader>

            {/* Contact info */}
            <div className="space-y-2 mb-4">
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.notes && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{customer.notes}</span>
                </div>
              )}
            </div>

            {/* Last visit */}
            {lastVisit && (
              <div className="flex items-center gap-2 text-sm mb-6 text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Last visit: <span className="font-medium text-foreground">{format(parseISO(lastVisit), 'MMM d, yyyy')}</span></span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t mb-4" />

            {/* Service History */}
            <h3 className="text-sm font-semibold mb-3">Service History</h3>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">No history yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Bookings will appear here once created.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => {
                  const service = Array.isArray(entry.service) ? entry.service[0] : entry.service;
                  const payment = Array.isArray(entry.payment) ? entry.payment[0] : entry.payment;
                  return (
                    <div
                      key={entry.id}
                      className="rounded-lg border bg-card p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {service?.name ?? '—'}
                        </span>
                        <BookingStatusBadge status={entry.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{format(parseISO(entry.booking_date), 'MMM d, yyyy')}</span>
                        <span>·</span>
                        <span>{entry.start_time.slice(0, 5)}</span>
                        {payment && (
                          <>
                            <span>·</span>
                            <span className="text-green-600 font-medium">
                              ₱{payment.amount.toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
