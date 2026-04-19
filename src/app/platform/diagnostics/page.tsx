import { runDiagnostics } from '@/app/actions/platform';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';

export default async function PlatformDiagnosticsPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const result = email ? await runDiagnostics(email).catch(() => null) : null;

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Diagnostics</h1>
        <p className="text-sm text-muted-foreground">
          Detect onboarding, account setup, and subscription issues for any user.
        </p>
      </div>

      {/* Search form */}
      <Card>
        <CardContent className="pt-4">
          <form method="get" className="flex gap-2 items-end">
            <div className="space-y-1 flex-1 max-w-sm">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                defaultValue={email ?? ''}
                className="h-10"
              />
            </div>
            <Button type="submit" className="h-10 gap-2">
              <Search className="h-4 w-4" />
              Run Diagnostics
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {email && result === null && (
        <Alert variant="destructive">
          <AlertDescription>Diagnostics failed. Check the email and try again.</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-4">
          {/* Health summary */}
          <div className="flex items-center gap-3">
            {result.issues.length === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
            )}
            <div>
              <p className="font-semibold">{result.email}</p>
              <p className="text-sm text-muted-foreground">
                {result.issues.length === 0
                  ? 'Account is healthy'
                  : `${result.issues.length} issue(s) detected`}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Profile */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profile</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {result.profile ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="default">Found</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span>{result.profile.full_name ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Admin</span>
                      <span>{result.profile.is_platform_admin ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(result.profile.created_at).toLocaleDateString()}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-4 w-4" />
                    No profile found
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business memberships */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Business Memberships</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {result.memberships.length === 0 ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    No business membership
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {result.memberships.map((m) => (
                      <li key={m.id} className="flex items-start gap-2 border rounded p-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{m.business?.name ?? m.business_id}</p>
                          <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                        </div>
                        <Badge
                          variant={
                            m.business?.subscription_status === 'active'
                              ? 'default'
                              : m.business?.subscription_status === 'expired'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="shrink-0 text-xs"
                        >
                          {m.business?.subscription_status ?? '?'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Issues & recommendations */}
          {result.issues.length > 0 && (
            <Card className="border-destructive/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-destructive">Issues Detected</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    {issue}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className={result.issues.length === 0 ? 'border-green-500/40' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  {result.issues.length === 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  {rec}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
