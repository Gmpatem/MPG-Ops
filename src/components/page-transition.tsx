'use client';

import { usePathname } from 'next/navigation';

/**
 * Re-mounts its wrapper div whenever the pathname changes so that
 * the `animate-page-in` CSS animation fires on every navigation,
 * not just the first mount.
 */
export function PageTransition({
  children,
  className = 'animate-page-in',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <div key={pathname} className={className}>
      {children}
    </div>
  );
}
