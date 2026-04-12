'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface LoadingPageProps {
  title: string;
  description: string;
  showStats?: boolean;
  statsCount?: number;
}

export function LoadingPage({ 
  title, 
  description, 
  showStats = false,
  statsCount = 4 
}: LoadingPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-11 w-32 self-start" />
      </div>

      {/* Stats (optional) */}
      {showStats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: statsCount }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20 mt-2" />
              <Skeleton className="h-3 w-32 mt-1" />
            </Card>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-24 mt-3" />
          </Card>
        ))}
      </div>
    </div>
  );
}
