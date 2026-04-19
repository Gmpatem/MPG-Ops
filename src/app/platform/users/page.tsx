import { Suspense } from 'react';
import { getAllUsersEnhanced, toggleUserPlatformAdmin } from '@/app/actions/platform';
import { startUserSupportSession } from '@/app/actions/support';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UsersTable } from '@/components/platform/users-table';

export default async function PlatformUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q = '', filter = 'all' } = await searchParams;
  const users = await getAllUsersEnhanced();

  const filtered = users.filter((u) => {
    const matchesQuery =
      !q ||
      u.email.toLowerCase().includes(q.toLowerCase()) ||
      (u.full_name ?? '').toLowerCase().includes(q.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'admin' && u.is_platform_admin) ||
      (filter === 'user' && !u.is_platform_admin);
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage user accounts, platform admin access, and support sessions.
        </p>
      </div>

      <UsersTable
        users={filtered}
        query={q}
        filter={filter}
        toggleAdminAction={toggleUserPlatformAdmin}
        startSupportAction={startUserSupportSession}
      />
    </div>
  );
}
