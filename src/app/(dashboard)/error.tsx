'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (when available)
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Something went wrong
      </h2>
      
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        We encountered an error loading this page. Please try again or contact support if the problem persists.
      </p>

      {error.digest && (
        <p className="text-xs text-muted-foreground mb-6 font-mono">
          Error ID: {error.digest}
        </p>
      )}
      
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button onClick={() => window.location.href = '/dashboard'}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
