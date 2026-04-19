import { getAuditLogs } from '@/app/actions/platform';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ACTION_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  support_mode_started: { label: 'Support started', variant: 'default' },
  support_mode_ended: { label: 'Support ended', variant: 'secondary' },
  platform_admin_granted: { label: 'Admin granted', variant: 'default' },
  platform_admin_revoked: { label: 'Admin revoked', variant: 'destructive' },
  business_plan_changed: { label: 'Plan changed', variant: 'outline' },
  user_profile_edited: { label: 'Profile edited', variant: 'outline' },
};

function ActionBadge({ action }: { action: string }) {
  const config = ACTION_LABELS[action] ?? { label: action, variant: 'outline' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default async function PlatformAuditPage() {
  const logs = await getAuditLogs(200);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          All platform admin and support actions. Last 200 entries.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{logs.length} entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">When</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Action</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Admin</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Target User</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Target Business</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {log.admin?.email ?? log.admin_user_id}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {log.target_user?.email ?? (log.target_user_id ? '—' : '')}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {log.target_business?.name ?? (log.target_business_id ? '—' : '')}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : ''}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                      No audit log entries yet.
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
