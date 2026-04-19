'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { UserWithMemberships } from '@/app/actions/platform';
import { Loader2, ShieldCheck, ShieldOff, Eye, Stethoscope } from 'lucide-react';

interface Props {
  users: UserWithMemberships[];
  query: string;
  filter: string;
  toggleAdminAction: (userId: string, isAdmin: boolean) => Promise<{ error?: string; success?: boolean } | undefined>;
  startSupportAction: (userId: string) => Promise<void>;
}

export function UsersTable({ users, query: initialQuery, filter: initialFilter, toggleAdminAction, startSupportAction }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function updateSearch(q: string, f: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (f !== 'all') params.set('filter', f);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleToggleAdmin(userId: string, currentIsAdmin: boolean) {
    setActionError(null);
    setPendingId(userId + '_admin');
    const result = await toggleAdminAction(userId, !currentIsAdmin);
    setPendingId(null);
    if (result?.error) setActionError(result.error);
  }

  async function handleStartSupport(userId: string) {
    setActionError(null);
    setPendingId(userId + '_support');
    startTransition(async () => {
      await startSupportAction(userId);
      setPendingId(null);
    });
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {/* Search & Filter bar */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search by email or name…"
          defaultValue={initialQuery}
          className="max-w-xs h-9"
          onChange={(e) => updateSearch(e.target.value, initialFilter)}
        />
        <div className="flex gap-1">
          {(['all', 'admin', 'user'] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={initialFilter === f ? 'default' : 'outline'}
              onClick={() => updateSearch(initialQuery, f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {users.length} user{users.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Businesses</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Joined</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => {
                  const isAdminPending = pendingId === u.id + '_admin';
                  const isSupportPending = pendingId === u.id + '_support';
                  return (
                    <tr key={u.id} className="hover:bg-muted/30 align-top">
                      <td className="px-4 py-3 font-medium">{u.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.full_name || '-'}</td>
                      <td className="px-4 py-3">
                        {u.is_platform_admin ? (
                          <Badge variant="default">Admin</Badge>
                        ) : (
                          <Badge variant="outline">User</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.memberships.length === 0 ? (
                          <span className="text-muted-foreground text-xs">No business</span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {u.memberships.map((m) => (
                              <span key={m.id} className="text-xs">
                                {m.business?.name ?? m.business_id}{' '}
                                <span className="text-muted-foreground">({m.role})</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSupportPending}
                            onClick={() => handleStartSupport(u.id)}
                            title="Start support session"
                          >
                            {isSupportPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                            <span className="ml-1 hidden sm:inline">Support</span>
                          </Button>
                          <Link
                            href={`/platform/diagnostics?email=${encodeURIComponent(u.email)}`}
                          >
                            <Button size="sm" variant="outline" title="Run diagnostics">
                              <Stethoscope className="h-3 w-3" />
                              <span className="ml-1 hidden sm:inline">Diagnose</span>
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant={u.is_platform_admin ? 'destructive' : 'ghost'}
                            disabled={isAdminPending}
                            onClick={() => handleToggleAdmin(u.id, u.is_platform_admin)}
                            title={u.is_platform_admin ? 'Revoke platform admin' : 'Promote to platform admin'}
                          >
                            {isAdminPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : u.is_platform_admin ? (
                              <ShieldOff className="h-3 w-3" />
                            ) : (
                              <ShieldCheck className="h-3 w-3" />
                            )}
                            <span className="ml-1 hidden sm:inline">
                              {u.is_platform_admin ? 'Revoke' : 'Make Admin'}
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
