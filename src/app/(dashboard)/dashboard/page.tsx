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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back to {business.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Bookings
            </CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayBookings === 0 
                ? 'No bookings today' 
                : `${todayCompleted} completed, ${todayBookings - todayCompleted} pending`}
            </p>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Revenue
            </CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayPaymentsCount === 0 
                ? 'No payments today' 
                : `${todayPaymentsCount} payment${todayPaymentsCount === 1 ? '' : 's'} recorded`}
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {customerCount === 0 ? 'Add your first customer' : 'Registered customers'}
            </p>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Services
            </CardTitle>
            <Scissors className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active offerings in your business
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <DashboardQuickActions />
      </Card>

      {/* Public Booking Site */}
      <PublicSiteCard businessId={business.id} />

      {/* Today's Schedule */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Today&apos;s Schedule</h3>
        {todaysSchedule.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No appointments scheduled for today.</p>
            <Link href="/bookings" className="inline-block mt-3">
              <Button variant="outline" size="sm">Add Booking</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysSchedule.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col items-center justify-center w-14 shrink-0">
                    <span className="text-sm font-semibold">{booking.start_time}</span>
                    <span className="text-xs text-muted-foreground">{booking.end_time}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{booking.customer.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {booking.service.name} ({booking.service.duration_minutes} min)
                    </p>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
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
