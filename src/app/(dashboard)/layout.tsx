import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { RoutePreloader } from '@/components/route-preloader';
import { PageTransition } from '@/components/page-transition';
import { getCurrentBusiness } from '@/app/actions/business';
import { getUserOnboardingState } from '@/lib/auth-routing';

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

  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const onOnboarding = pathname === '/onboarding' || pathname.startsWith('/onboarding?');
  const onboardingState = await getUserOnboardingState(supabase, user.id);

  if (onOnboarding) {
    if (onboardingState === 'COMPLETE') {
      redirect('/dashboard');
    }

    // Onboarding gets a simplified shell on mobile:
    // avoid sticky/fixed dashboard chrome that can cause iOS Safari
    // viewport repaint glitches when the keyboard opens.
    return (
      <div className="min-h-[100dvh] bg-background">
        <main className="mx-auto w-full max-w-md px-4 py-6 sm:py-10 pb-[calc(1.5rem+var(--safe-bottom))]">
          {children}
        </main>
      </div>
    );
  }

  if (onboardingState === 'NEW') {
    redirect('/onboarding');
  }

  if (onboardingState === 'PARTIAL') {
    redirect('/onboarding?resume=1');
  }

  const business = await getCurrentBusiness();

  return (
    <div className="min-h-svh flex flex-col pb-[calc(4rem+var(--safe-bottom))]">
      {/* Header */}
      <DashboardHeader userEmail={user.email} business={business} />

      {/* Desktop Top Navigation */}
      <DashboardNav />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Prefetch likely routes for faster navigation */}
      <RoutePreloader />
    </div>
  );
}
