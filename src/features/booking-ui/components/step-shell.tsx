'use client';

import { ChevronLeft } from 'lucide-react';
import { ProgressBar } from './progress-bar';

export function StepShell({
  step,
  title,
  subtitle,
  onBack,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Step Header */}
      <div className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="mx-auto max-w-lg px-5 pt-4 pb-4.5 lg:max-w-3xl lg:px-6">
          <div className="flex items-center gap-3 mb-3.5">
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center shadow-sm active:scale-90 transition-all shrink-0"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
            )}
            <div className="flex-1">
              <ProgressBar step={step} />
            </div>
          </div>
          <h2 className="font-display text-[28px] font-semibold tracking-tight text-foreground leading-none">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 pb-28 lg:py-8">
        <div className="mx-auto max-w-lg animate-fade-up lg:max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
