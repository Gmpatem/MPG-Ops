import { Skeleton } from '@/components/ui/skeleton';

export default function AuthLoading() {
  return (
    <div className="animate-page-in space-y-6">
      {/* Brand mark */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Card */}
      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm space-y-5">
        {/* Fields */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}

        {/* Submit button */}
        <Skeleton className="h-12 w-full rounded-lg" />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <Skeleton className="h-3 w-4" />
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Secondary links */}
        <div className="space-y-2 text-center">
          <Skeleton className="h-4 w-40 mx-auto" />
          <Skeleton className="h-4 w-52 mx-auto" />
        </div>
      </div>
    </div>
  );
}
