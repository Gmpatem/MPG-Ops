import { Skeleton } from '@/components/ui/skeleton';

export default function PlatformLoading() {
  return (
    <div className="space-y-6 animate-page-in">
      {/* Page header */}
      <div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      {/* Stat cards row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        {/* Table header */}
        <div className="bg-muted/50 flex gap-4 px-4 py-2">
          {[120, 96, 72, 80, 64].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-t">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
