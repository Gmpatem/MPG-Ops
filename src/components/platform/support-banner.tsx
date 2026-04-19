import { getSupportSession } from '@/lib/support-session';
import { endSupportSession } from '@/app/actions/support';
import { Button } from '@/components/ui/button';
import { ShieldAlert, X } from 'lucide-react';

export async function SupportBanner() {
  const session = await getSupportSession();
  if (!session) return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-white">
      <div className="flex items-center gap-2 min-w-0">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span className="truncate">
          Support mode active — viewing{' '}
          <span className="font-bold">{session.targetBusinessName}</span>{' '}
          <span className="opacity-80">({session.targetUserEmail})</span>
        </span>
        <span className="shrink-0 opacity-75 text-xs">
          · started {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <form action={endSupportSession}>
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-white hover:bg-amber-600 hover:text-white shrink-0"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Exit
        </Button>
      </form>
    </div>
  );
}
