import { redirect } from 'next/navigation';
import { PlatformNav } from '@/components/platform/platform-nav';
import { SupportBanner } from '@/components/platform/support-banner';
import { PageTransition } from '@/components/page-transition';
import { isCurrentUserPlatformAdmin } from '@/lib/platform-admin';

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isCurrentUserPlatformAdmin();
  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-svh flex flex-col">
      <SupportBanner />
      <div className="flex flex-col md:flex-row flex-1">
        <PlatformNav />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
