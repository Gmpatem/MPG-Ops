'use client';

export function ProgressBar({ step, total = 7 }: { step: number; total?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`
            flex-1 h-1 rounded-full transition-all duration-400
            ${i + 1 <= step ? 'bg-primary' : 'bg-muted'}
          `}
        />
      ))}
    </div>
  );
}
