import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { RoutePreloader } from '@/components/route-preloader';
import { getCurrentBusiness } from '@/app/actions/business';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const business = await getCurrentBusiness();

  return (
    <div className="min-h-svh flex flex-col pb-[calc(4rem+var(--safe-bottom))]">
      {/* Header */}
      <DashboardHeader userEmail={user.email} business={business} />

      {/* Desktop Top Navigation */}
      <DashboardNav />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 animate-page-in">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Prefetch likely routes for faster navigation */}
      <RoutePreloader />
    </div>
  );
}
