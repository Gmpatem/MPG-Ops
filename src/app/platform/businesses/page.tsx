import { getAllBusinessesEnhanced } from '@/app/actions/platform';
import { startSupportSession } from '@/app/actions/support';
import { BusinessesTable } from '@/components/platform/businesses-table';

export default async function PlatformBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q = '', filter = 'all' } = await searchParams;
  const businesses = await getAllBusinessesEnhanced();

  const filtered = businesses.filter((b) => {
    const matchesQuery =
      !q ||
      b.name.toLowerCase().includes(q.toLowerCase()) ||
      (b.slug ?? '').toLowerCase().includes(q.toLowerCase()) ||
      (b.owner?.email ?? '').toLowerCase().includes(q.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'trialing' && b.subscription_status === 'trialing') ||
      (filter === 'active' && b.subscription_status === 'active') ||
      (filter === 'expired' && b.subscription_status === 'expired') ||
      (filter === 'free' && b.subscription_status === 'free');
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Businesses</h1>
        <p className="text-sm text-muted-foreground">
          Manage business accounts, subscriptions, and open support sessions.
        </p>
      </div>

      <BusinessesTable
        businesses={filtered}
        query={q}
        filter={filter}
        startSupportAction={startSupportSession}
      />
    </div>
  );
}
