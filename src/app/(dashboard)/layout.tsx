import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <DashboardHeader userEmail={user.email} />

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-4 sm:py-6 px-4 sm:px-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
