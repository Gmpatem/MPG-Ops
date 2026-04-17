'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function Progress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [key, setKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (startTimer.current) clearTimeout(startTimer.current);
    startTimer.current = setTimeout(() => setKey((k) => k + 1), 0);
    timer.current = setTimeout(() => setKey(0), 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (startTimer.current) clearTimeout(startTimer.current);
    };
  }, [pathname, searchParams]);

  if (key === 0) return null;

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[9999] h-0.5 pointer-events-none overflow-hidden"
    >
      <div
        key={key}
        className="h-full w-full bg-primary origin-left"
        style={{ animation: 'nav-progress 550ms ease-out forwards' }}
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <Progress />
    </Suspense>
  );
}
