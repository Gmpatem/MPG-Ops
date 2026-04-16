import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const flags = [
  { key: 'pro_trial_14_days', status: 'enabled', desc: 'Give new businesses a 14-day Pro trial on signup.' },
  { key: 'multi_service_booking', status: 'enabled', desc: 'Allow customers to book multiple services at once.' },
  { key: 'payments_tab', status: 'disabled', desc: 'Show payments tab and enable payment tracking.' },
  { key: 'promotions_tab', status: 'preview', desc: 'Show promotions & deals management tab.' },
  { key: 'ai_reminders', status: 'disabled', desc: 'AI-powered SMS/email reminder system.' },
  { key: 'team_staff_features', status: 'disabled', desc: 'Multi-staff scheduling and assignments.' },
];

export default function PlatformFeatureFlagsPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Feature Flags</h1>
        <p className="text-sm text-muted-foreground">Platform-wide feature toggles. (UI read-only for now — update via database.)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Flags</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Feature</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {flags.map((f) => (
                  <tr key={f.key} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium font-mono text-xs">{f.key}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          f.status === 'enabled'
                            ? 'default'
                            : f.status === 'preview'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {f.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
