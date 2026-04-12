import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getServiceCount } from '@/app/actions/services';
import { getCustomerCount } from '@/app/actions/customers';
import { getTodayBookingsCount, getTodayCompletedCount } from '@/app/actions/bookings';
import { getTodayRevenue, getTodayPaymentsCount } from '@/app/actions/payments';
import { getCurrentBusiness } from '@/app/actions/business';
import { Scissors, Users, Calendar, CreditCard } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const business = await getCurrentBusiness();

  if (!business) {
    redirect('/onboarding');
  }

  const serviceCount = await getServiceCount();
  const customerCount = await getCustomerCount();
  const todayBookings = await getTodayBookingsCount();
  const todayCompleted = await getTodayCompletedCount();
  const todayRevenue = await getTodayRevenue();
  const todayPaymentsCount = await getTodayPaymentsCount();

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

        {/* Services - Updated with real count */}
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
        <div className="flex flex-wrap gap-3">
          <Link href="/customers">
            <Button>Add Customer</Button>
          </Link>
          <Link href="/bookings">
            <Button variant="outline">New Booking</Button>
          </Link>
          <Link href="/services">
            <Button variant="outline">Add Service</Button>
          </Link>
        </div>
      </Card>

      {/* Business Info */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Business Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{business.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium capitalize">{business.business_type}</span>
          </div>
          {business.phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{business.phone}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
