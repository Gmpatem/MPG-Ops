'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const CRITICAL_ROUTES = ['/dashboard', '/bookings', '/customers', '/services', '/settings'];

export function RoutePreloader() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Prefetch other critical routes that the user is likely to visit
    CRITICAL_ROUTES.forEach((route) => {
      if (route !== pathname) {
        router.prefetch(route);
      }
    });
  }, [router, pathname]);

  return null;
}
