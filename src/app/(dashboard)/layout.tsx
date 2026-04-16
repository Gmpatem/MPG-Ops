import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
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

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-4 sm:py-6 px-4 sm:px-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Prefetch likely routes for faster navigation */}
      <RoutePreloader />
    </div>
  );
}
