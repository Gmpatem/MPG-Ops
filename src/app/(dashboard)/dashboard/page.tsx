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
import { UpgradeBanner } from '@/components/upgrade/upgrade-banner';

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
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">🏢</span>
        </div>
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
    <div className="space-y-4 sm:space-y-5">
      {/* Upgrade Banner */}
      <UpgradeBanner business={business} />

      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back to {business.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Today's Bookings */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate">
              Bookings
            </CardTitle>
            <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold">{todayBookings}</div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-tight">
              {todayBookings === 0 
                ? 'No bookings today' 
                : `${todayCompleted} done, ${todayBookings - todayCompleted} pending`}
            </p>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate">
              Revenue
            </CardTitle>
            <div className="h-7 w-7 rounded-md bg-emerald-100 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold">₱{todayRevenue.toFixed(0)}</div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-tight">
              {todayPaymentsCount === 0 
                ? 'No payments today' 
                : `${todayPaymentsCount} payment${todayPaymentsCount === 1 ? '' : 's'}`}
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate">
              Customers
            </CardTitle>
            <div className="h-7 w-7 rounded-md bg-blue-100 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold">{customerCount}</div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-tight">
              {customerCount === 0 ? 'Add your first' : 'Registered customers'}
            </p>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate">
              Services
            </CardTitle>
            <div className="h-7 w-7 rounded-md bg-amber-100 flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl sm:text-2xl font-bold">{serviceCount}</div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-tight">
              Active offerings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-4 sm:p-5">
        <h3 className="font-semibold mb-3 text-sm sm:text-base">Quick Actions</h3>
        <DashboardQuickActions />
      </Card>

      {/* Public Booking Site */}
      <PublicSiteCard businessId={business.id} />

      {/* Today's Schedule */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm sm:text-base">Today&apos;s Schedule</h3>
          <span className="text-xs text-muted-foreground">
            {todaysSchedule.length} {todaysSchedule.length === 1 ? 'appt' : 'appts'}
          </span>
        </div>
        {todaysSchedule.length === 0 ? (
          <div className="text-center py-8 sm:py-10">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No appointments today</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Add a booking to get your day started.
            </p>
            <Link href="/bookings">
              <Button variant="outline" size="sm">Add Booking</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {todaysSchedule.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="flex flex-col items-center justify-center shrink-0 w-14 sm:w-16 h-10 rounded-lg bg-muted/60">
                    <span className="text-sm font-semibold leading-none">{booking.start_time.slice(0,5)}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{booking.end_time.slice(0,5)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{booking.customer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {booking.service.name} • {booking.service.duration_minutes} min
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
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
