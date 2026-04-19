import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBusinessSupportData } from '@/app/actions/platform';
import { endSupportSession } from '@/app/actions/support';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPlanLabel, formatSubscriptionStatus, isTrialActive, getTrialDaysLeft } from '@/lib/subscription';
import {
  Building2,
  Users,
  CalendarDays,
  Wrench,
  UserCircle,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

export default async function SupportBusinessPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;

  let data;
  try {
    data = await getBusinessSupportData(businessId);
  } catch {
    notFound();
  }

  const { business, owner, members, stats } = data;
  const trialDays = isTrialActive(business) ? getTrialDaysLeft(business) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/platform/businesses">
              <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground">
                <ArrowLeft className="h-3.5 w-3.5" />
                Businesses
              </Button>
            </Link>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            {business.name}
          </h1>
          {business.slug && (
            <p className="text-sm text-muted-foreground font-mono">{business.slug}</p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link href={`/platform/diagnostics?email=${encodeURIComponent(owner?.email ?? '')}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Wrench className="h-3.5 w-3.5" />
              Run Diagnostics
            </Button>
          </Link>
          {business.slug && (
            <a href={`/b/${business.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Public Page
              </Button>
            </a>
          )}
          <form action={endSupportSession}>
            <Button type="submit" variant="destructive" size="sm">
              Exit Support Mode
            </Button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Services</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.services}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Members</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Type" value={business.business_type} />
            <Row label="Plan">
              <Badge variant="outline">
                {formatPlanLabel(business.plan_tier as 'free' | 'pro' | 'business')}
              </Badge>
            </Row>
            <Row label="Status">
              <Badge
                variant={
                  isTrialActive(business)
                    ? 'default'
                    : business.subscription_status === 'active'
                    ? 'default'
                    : business.subscription_status === 'expired'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {formatSubscriptionStatus(business.subscription_status as 'trialing' | 'active' | 'expired' | 'free')}
                {trialDays !== null ? ` · ${trialDays}d left` : ''}
              </Badge>
            </Row>
            {business.trial_ends_at && (
              <Row
                label="Trial ends"
                value={new Date(business.trial_ends_at).toLocaleDateString('en-CA')}
              />
            )}
            {business.phone && <Row label="Phone" value={business.phone} />}
            {business.email && <Row label="Email" value={business.email} />}
            {business.address && <Row label="Address" value={business.address} />}
            <Row
              label="Created"
              value={new Date(business.created_at).toLocaleDateString('en-CA')}
            />
          </CardContent>
        </Card>

        {/* Owner */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Account Owner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {owner ? (
              <>
                <Row label="Email" value={owner.email} />
                <Row label="Name" value={owner.full_name ?? '—'} />
                <Row label="User ID">
                  <span className="font-mono text-xs break-all">{business.owner_id}</span>
                </Row>
                <div className="pt-2">
                  <Link
                    href={`/platform/diagnostics?email=${encodeURIComponent(owner.email)}`}
                  >
                    <Button variant="outline" size="sm" className="gap-1.5 w-full">
                      <Wrench className="h-3.5 w-3.5" />
                      Run Owner Diagnostics
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Owner profile not found.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Team Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Joined</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">{m.profile?.email ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.profile?.full_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={m.role === 'owner' ? 'default' : 'outline'} className="capitalize">
                        {m.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString('en-CA')}
                    </td>
                    <td className="px-4 py-3">
                      {m.profile?.email && (
                        <Link
                          href={`/platform/diagnostics?email=${encodeURIComponent(m.profile.email)}`}
                        >
                          <Button size="sm" variant="ghost">
                            <Wrench className="h-3 w-3" />
                            <span className="ml-1 hidden sm:inline">Diagnose</span>
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                      No members found.
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

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right">{children ?? value ?? '—'}</span>
    </div>
  );
}
