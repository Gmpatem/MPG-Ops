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
      <SheetContent side="responsive" className="overflow-y-auto md:max-w-xl">
        {customer && (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl">{customer.name}</SheetTitle>
              <SheetDescription>
                Customer profile and service history
              </SheetDescription>
            </SheetHeader>

            {/* Contact info */}
            <div className="px-5 space-y-3 mb-6">
              {customer.phone && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-foreground">{customer.phone}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-foreground">{customer.email}</span>
                </div>
              )}
              {customer.notes && (
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-foreground leading-relaxed">{customer.notes}</span>
                </div>
              )}
            </div>

            {/* Last visit */}
            {lastVisit && (
              <div className="mx-5 flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 rounded-xl px-4 py-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Last visit: <span className="font-medium text-foreground">{format(parseISO(lastVisit), 'MMM d, yyyy')}</span></span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t mb-6" />

            {/* Service History */}
            <div className="px-5 pb-5">
              <h3 className="text-sm font-semibold mb-4">Service History</h3>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold">No history yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bookings will appear here once created.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => {
                    const service = Array.isArray(entry.service) ? entry.service[0] : entry.service;
                    const payment = Array.isArray(entry.payment) ? entry.payment[0] : entry.payment;
                    return (
                      <div
                        key={entry.id}
                        className="rounded-xl border bg-card p-4 space-y-2"
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
                              <span className="text-success font-medium">
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
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
