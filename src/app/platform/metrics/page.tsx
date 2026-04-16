import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlatformMetrics } from '@/app/actions/platform';

export default async function PlatformMetricsPage() {
  const metrics = await getPlatformMetrics();
  const conversionRate =
    metrics.totalBusinesses > 0
      ? ((metrics.activePaidBusinesses / metrics.totalBusinesses) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Metrics</h1>
        <p className="text-sm text-muted-foreground">Key monetization and growth metrics.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trial → Paid Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Active paid / Total businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trialing Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.trialingBusinesses}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in trial period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Free Plan Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.freeBusinesses}</div>
            <p className="text-xs text-muted-foreground mt-1">On free plan after trial</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
