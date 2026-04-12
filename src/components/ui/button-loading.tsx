'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import type { Button as ButtonPrimitive } from '@base-ui/react/button';

interface ButtonLoadingProps extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
}

export function ButtonLoading({
  isLoading = false,
  loadingText,
  children,
  disabled,
  className,
  variant,
  size,
  ...props
}: ButtonLoadingProps) {
  return (
    <Button
      disabled={disabled || isLoading}
      className={cn(
        'relative',
        isLoading && 'text-transparent',
        className
      )}
      variant={variant}
      size={size}
      {...props}
    >
      <span className={cn(isLoading && 'invisible')}>{children}</span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center text-current">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {loadingText || children}
        </span>
      )}
    </Button>
  );
}
