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
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200',
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
