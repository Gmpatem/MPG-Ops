'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentList } from '@/components/payments/payment-list';
import { PaymentEmptyState } from '@/components/payments/payment-empty-state';
import { getPayments, getRevenueSummary } from '@/app/actions/payments';
import { CreditCard, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { LoadingPage } from '@/components/loading-page';
import { ErrorState } from '@/components/error-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { isWithinInterval, subDays, startOfDay, parseISO } from 'date-fns';

interface Payment {
  id: string;
  amount: number;
  method: 'cash' | 'gcash' | 'card' | 'other';
  created_at: string;
  booking: {
    booking_date: string;
    customer: { name: string };
    service: { name: string };
  };
}

interface RevenueSummary {
  today: number;
  week: number;
  month: number;
}

type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [revenue, setRevenue] = useState<RevenueSummary>({ today: 0, week: 0, month: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [paymentsData, revenueData] = await Promise.all([
          getPayments(),
          getRevenueSummary(),
        ]);
        setPayments(paymentsData);
        setRevenue(revenueData);
      } catch (err) {
        setError('Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter payments based on date
  const filteredPayments = useMemo(() => {
    if (dateFilter === 'all') return payments;
    
    const now = new Date();
    const today = startOfDay(now);
    
    switch (dateFilter) {
      case 'today':
        return payments.filter(p => {
          const paymentDate = parseISO(p.created_at);
          return isWithinInterval(paymentDate, {
            start: today,
            end: now,
          });
        });
      case 'week': {
        const weekAgo = subDays(today, 7);
        return payments.filter(p => {
          const paymentDate = parseISO(p.created_at);
          return isWithinInterval(paymentDate, {
            start: weekAgo,
            end: now,
          });
        });
      }
      case 'month': {
        const monthAgo = subDays(today, 30);
        return payments.filter(p => {
          const paymentDate = parseISO(p.created_at);
          return isWithinInterval(paymentDate, {
            start: monthAgo,
            end: now,
          });
        });
      }
      default:
        return payments;
    }
  }, [payments, dateFilter]);

  const handleRetry = () => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [paymentsData, revenueData] = await Promise.all([
          getPayments(),
          getRevenueSummary(),
        ]);
        setPayments(paymentsData);
        setRevenue(revenueData);
      } catch (err) {
        setError('Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  };

  if (isLoading) {
    return (
      <LoadingPage
        title="Payments"
        description="View payment history and revenue summary."
        showStats
        statsCount={4}
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View payment history and revenue summary.
          </p>
        </div>
        <div className="bg-card rounded-xl border">
          <ErrorState
            title="Failed to load payments"
            message={error}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  const hasPayments = payments.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View payment history and revenue summary.
        </p>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Revenue
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{revenue.today.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue from today
            </p>
          </CardContent>
        </Card>

        {/* This Week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{revenue.week.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{revenue.month.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        {/* Total Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Payments
            </CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Payment History</h2>
          
          {/* Date Filter */}
          {hasPayments && (
            <div className="flex items-center gap-3">
              <Select
                value={dateFilter}
                onValueChange={(value) => value && setDateFilter(value as DateFilter)}
              >
                <SelectTrigger className="w-[160px] h-10" aria-label="Filter payments by date">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Results Count */}
        {hasPayments && dateFilter !== 'all' && (
          <p className="text-sm text-muted-foreground mb-4">
            {filteredPayments.length} {filteredPayments.length === 1 ? 'payment' : 'payments'} found
          </p>
        )}

        {payments.length === 0 ? (
          <div className="bg-card rounded-xl border">
            <PaymentEmptyState />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-card rounded-xl border p-8 text-center">
            <p className="text-muted-foreground">
              No payments found for the selected period.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setDateFilter('all')} 
              className="mt-4"
            >
              Show All Payments
            </Button>
          </div>
        ) : (
          <PaymentList payments={filteredPayments} />
        )}
      </div>
    </div>
  );
}
