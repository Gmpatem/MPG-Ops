import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  getPlatformFeedback,
  updateFeedbackStatusByAdmin,
} from '@/app/actions/feedback';

const statusOptions = ['new', 'reviewed', 'actioned', 'dismissed'] as const;

const statusStyles: Record<string, string> = {
  new: 'bg-amber-100 text-amber-900',
  reviewed: 'bg-blue-100 text-blue-900',
  actioned: 'bg-emerald-100 text-emerald-900',
  dismissed: 'bg-slate-200 text-slate-900',
};

export default async function PlatformFeedbackPage() {
  const feedbackRows = await getPlatformFeedback(300);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Client Feedback</h1>
        <p className="text-sm text-muted-foreground">
          Review comments and quality signals from public booking pages.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {feedbackRows.length} feedback item{feedbackRows.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {feedbackRows.length === 0 && (
            <p className="text-sm text-muted-foreground">No feedback has been submitted yet.</p>
          )}

          {feedbackRows.map((feedback) => (
            <div key={feedback.id} className="rounded-lg border p-3 md:p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{feedback.business?.name ?? 'Unknown business'}</p>
                  <p className="text-xs text-muted-foreground">
                    {feedback.customer_name ?? 'Anonymous'} · {feedback.customer_email ?? 'No email'}
                  </p>
                  {feedback.rating !== null && (
                    <p className="text-xs text-muted-foreground">Rating: {feedback.rating}/5</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusStyles[feedback.status] ?? 'bg-muted text-muted-foreground'
                  }`}
                >
                  {feedback.status}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(feedback.created_at).toLocaleString('en-CA')}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {feedback.comment}
              </p>

              <form
                action={async (formData) => {
                  'use server';
                  await updateFeedbackStatusByAdmin(formData);
                }}
                className="mt-3 flex flex-wrap items-center gap-2"
              >
                <input type="hidden" name="feedbackId" value={feedback.id} />
                <select
                  name="status"
                  defaultValue={feedback.status}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  {statusOptions.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
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
