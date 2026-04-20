import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getPlatformSupportRequests,
  updateSupportRequestByAdmin,
} from '@/app/actions/support-requests';

const statusOptions = ['open', 'in_progress', 'resolved', 'closed'] as const;

const statusStyles: Record<string, string> = {
  open: 'bg-amber-100 text-amber-900',
  in_progress: 'bg-blue-100 text-blue-900',
  resolved: 'bg-emerald-100 text-emerald-900',
  closed: 'bg-slate-200 text-slate-900',
};

export default async function PlatformSupportRequestsPage() {
  const requests = await getPlatformSupportRequests(300);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Support Requests</h1>
        <p className="text-sm text-muted-foreground">
          Incoming client support/help requests from businesses.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {requests.length} request{requests.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No support requests yet.
            </p>
          )}

          {requests.map((request) => (
            <div key={request.id} className="rounded-lg border p-3 md:p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{request.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {request.business?.name ?? 'Unknown business'} · {request.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.submitted_by?.email ?? request.contact_email ?? 'No contact email'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusStyles[request.status] ?? 'bg-muted text-muted-foreground'
                  }`}
                >
                  {request.status.replace('_', ' ')}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(request.created_at).toLocaleString('en-CA')}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {request.message}
              </p>

              <form
                action={async (formData) => {
                  'use server';
                  await updateSupportRequestByAdmin(formData);
                }}
                className="mt-3 grid gap-2 md:grid-cols-[180px_1fr_auto]"
              >
                <input type="hidden" name="requestId" value={request.id} />
                <select
                  name="status"
                  defaultValue={request.status}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  {statusOptions.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="adminNotes"
                  defaultValue={request.admin_notes ?? ''}
                  placeholder="Admin notes (optional)"
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                />
                <Button type="submit" size="sm" className="h-10">
                  Save
                </Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
