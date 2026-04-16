import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllBusinesses } from '@/app/actions/platform';
import { formatPlanLabel, formatSubscriptionStatus, isTrialActive } from '@/lib/subscription';

export default async function PlatformBusinessesPage() {
  const businesses = await getAllBusinesses();

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Businesses</h1>
        <p className="text-sm text-muted-foreground">Manage business accounts and subscriptions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">All Businesses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Slug</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{b.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.slug || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{formatPlanLabel(b.plan_tier as 'free' | 'pro' | 'business')}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={isTrialActive(b) ? 'default' : b.subscription_status === 'active' ? 'default' : 'secondary'}
                      >
                        {formatSubscriptionStatus(b.subscription_status as 'trialing' | 'active' | 'expired' | 'free')}
                        {isTrialActive(b) && b.trial_ends_at
                          ? ` (ends ${new Date(b.trial_ends_at).toLocaleDateString()})`
                          : ''}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {businesses.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                      No businesses yet.
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
