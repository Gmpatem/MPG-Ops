import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getServiceCount } from '@/app/actions/services';
import { getCustomerCount } from '@/app/actions/customers';
import { getTodayBookingsCount, getTodayCompletedCount, getBookingsByDate } from '@/app/actions/bookings';
import { getTodayRevenue, getTodayPaymentsCount } from '@/app/actions/payments';
import { getCurrentBusiness } from '@/app/actions/business';
import { BookingStatusBadge } from '@/components/bookings/booking-status-badge';
import { DashboardQuickActions } from '@/components/dashboard/dashboard-quick-actions';
import { PublicSiteCard } from '@/components/dashboard/public-site-card';
import { Scissors, Users, Calendar, CreditCard, Clock } from 'lucide-react';

type BookingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

interface Booking {
  id: string;
  customer: { name: string };
  service: { name: string; duration_minutes: number; price: number };
  start_time: string;
  end_time: string;
  status: BookingStatus;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const business = await getCurrentBusiness();

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">No business found</h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          We couldn&apos;t find a business associated with your account. Please contact support if you believe this is an error.
        </p>
      </div>
    );
  }

  const serviceCount = await getServiceCount();
  const customerCount = await getCustomerCount();
  const todayBookings = await getTodayBookingsCount();
  const todayCompleted = await getTodayCompletedCount();
  const todayRevenue = await getTodayRevenue();
  const todayPaymentsCount = await getTodayPaymentsCount();

  const today = new Date().toISOString().split('T')[0];
  const todaysSchedule = await getBookingsByDate(today);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5 sm:mt-1">
          Welcome back to {business.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Today's Bookings */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 sm:px-6 pt-2.5 sm:pt-6">
            <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground truncate">
              Bookings
            </CardTitle>
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-2.5 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{todayBookings}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">
              {todayBookings === 0 
                ? 'No bookings today' 
                : `${todayCompleted} done, ${todayBookings - todayCompleted} pending`}
            </p>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 sm:px-6 pt-2.5 sm:pt-6">
            <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground truncate">
              Revenue
            </CardTitle>
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-2.5 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">₱{todayRevenue.toFixed(0)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">
              {todayPaymentsCount === 0 
                ? 'No payments today' 
                : `${todayPaymentsCount} payment${todayPaymentsCount === 1 ? '' : 's'}`}
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 sm:px-6 pt-2.5 sm:pt-6">
            <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground truncate">
              Customers
            </CardTitle>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-2.5 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{customerCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">
              {customerCount === 0 ? 'Add your first' : 'Registered customers'}
            </p>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 sm:px-6 pt-2.5 sm:pt-6">
            <CardTitle className="text-[11px] sm:text-sm font-medium text-muted-foreground truncate">
              Services
            </CardTitle>
            <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-2.5 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{serviceCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">
              Active offerings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-3.5 sm:p-5">
        <h3 className="font-semibold mb-2.5 sm:mb-3 text-sm sm:text-base">Quick Actions</h3>
        <DashboardQuickActions />
      </Card>

      {/* Public Booking Site */}
      <PublicSiteCard businessId={business.id} />

      {/* Today's Schedule */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b bg-card">
          <h3 className="font-semibold text-sm sm:text-base">Today&apos;s Schedule</h3>
        </div>
        {todaysSchedule.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No appointments scheduled for today.</p>
            <Link href="/bookings" className="inline-block mt-2 sm:mt-3">
              <Button variant="outline" size="sm">Add Booking</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {todaysSchedule.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="flex flex-col shrink-0 w-16 sm:w-20">
                    <span className="text-sm font-semibold leading-none">{booking.start_time}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{booking.end_time}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{booking.customer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {booking.service.name} • {booking.service.duration_minutes} min
                    </p>
                  </div>
                </div>
                <div className="shrink-0 ml-3">
                  <BookingStatusBadge status={booking.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
