'use client';

import { CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormStatusProps {
  type: 'success' | 'error';
  message: string;
  className?: string;
}

export function FormStatus({ type, message, className }: FormStatusProps) {
  const isSuccess = type === 'success';
  
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-md text-sm',
        isSuccess
          ? 'bg-success/10 text-success border border-success/20'
          : 'bg-destructive/10 text-destructive border border-destructive/20',
        className
      )}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      )}
      <span className="flex-1">{message}</span>
    </div>
  );
}
