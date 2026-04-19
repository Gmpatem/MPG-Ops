'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditSubscriptionDialog } from '@/components/platform/edit-subscription-dialog';
import type { BusinessWithDetails } from '@/app/actions/platform';
import { formatPlanLabel, formatSubscriptionStatus, isTrialActive } from '@/lib/subscription';
import { Eye, Pencil, Users, Loader2 } from 'lucide-react';

interface Props {
  businesses: BusinessWithDetails[];
  query: string;
  filter: string;
  startSupportAction: (businessId: string) => Promise<void>;
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'trialing', label: 'Trialing' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'free', label: 'Free' },
] as const;

export function BusinessesTable({ businesses, query: initialQuery, filter: initialFilter, startSupportAction }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<BusinessWithDetails | null>(null);

  function updateSearch(q: string, f: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (f !== 'all') params.set('filter', f);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleOpenSupport(businessId: string) {
    setPendingId(businessId);
    startTransition(async () => {
      await startSupportAction(businessId);
      setPendingId(null);
    });
  }

  function statusVariant(b: BusinessWithDetails): 'default' | 'secondary' | 'outline' | 'destructive' {
    if (isTrialActive(b)) return 'default';
    if (b.subscription_status === 'active') return 'default';
    if (b.subscription_status === 'expired') return 'destructive';
    return 'secondary';
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search by name, slug, or owner email…"
          defaultValue={initialQuery}
          className="max-w-sm h-9"
          onChange={(e) => updateSearch(e.target.value, initialFilter)}
        />
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={initialFilter === f.value ? 'default' : 'outline'}
              onClick={() => updateSearch(initialQuery, f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {businesses.length} business{businesses.length !== 1 ? 'es' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Owner</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Members</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Created</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {businesses.map((b) => {
                  const isLoading = pendingId === b.id;
                  return (
                    <tr key={b.id} className="hover:bg-muted/30 align-top">
                      <td className="px-4 py-3 font-medium">
                        <div>{b.name}</div>
                        {b.slug && (
                          <div className="text-xs text-muted-foreground font-mono">{b.slug}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="text-xs">{b.owner?.email ?? '—'}</div>
                        {b.owner?.full_name && (
                          <div className="text-xs text-muted-foreground/70">{b.owner.full_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {formatPlanLabel(b.plan_tier as 'free' | 'pro' | 'business')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(b)}>
                          {formatSubscriptionStatus(b.subscription_status as 'trialing' | 'active' | 'expired' | 'free')}
                          {isTrialActive(b) && b.trial_ends_at
                            ? ` · ends ${new Date(b.trial_ends_at).toLocaleDateString()}`
                            : ''}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {b.member_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isLoading}
                            onClick={() => handleOpenSupport(b.id)}
                            title="Open in support mode"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                            <span className="ml-1 hidden sm:inline">Support</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditTarget(b)}
                            title="Edit subscription"
                          >
                            <Pencil className="h-3 w-3" />
                            <span className="ml-1 hidden sm:inline">Edit Plan</span>
                          </Button>
                          <Link href={`/platform/diagnostics?email=${encodeURIComponent(b.owner?.email ?? '')}`}>
                            <Button size="sm" variant="ghost" title="View members in support">
                              <Users className="h-3 w-3" />
                              <span className="ml-1 hidden sm:inline">Diagnose</span>
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {businesses.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                      No businesses match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editTarget && (
        <EditSubscriptionDialog
          businessId={editTarget.id}
          businessName={editTarget.name}
          currentPlan={editTarget.plan_tier}
          currentStatus={editTarget.subscription_status}
          open
          onClose={() => {
            setEditTarget(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
