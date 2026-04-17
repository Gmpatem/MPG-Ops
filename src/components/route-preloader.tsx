'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const NAV_ROUTES = [
  '/dashboard',
  '/bookings',
  '/customers',
  '/services',
  '/payments',
  '/settings',
];

function normalizeRoute(pathname: string): string | null {
  const route = NAV_ROUTES.find(
    (candidate) => pathname === candidate || pathname.startsWith(`${candidate}/`)
  );

  return route ?? null;
}

function getNearbyRoutes(pathname: string): string[] {
  const current = normalizeRoute(pathname);
  if (!current) {
    return [];
  }

  const index = NAV_ROUTES.indexOf(current);
  const nearby = new Set<string>();

  if (index > 0) {
    nearby.add(NAV_ROUTES[index - 1]);
  }
  if (index < NAV_ROUTES.length - 1) {
    nearby.add(NAV_ROUTES[index + 1]);
  }

  if (current === '/settings') {
    nearby.add('/settings/billing');
    nearby.add('/settings/public-site');
  }

  return [...nearby];
}

export function RoutePreloader() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getNearbyRoutes(pathname).forEach((route) => {
      if (route !== pathname) {
        router.prefetch(route);
      }
    });
  }, [router, pathname]);

  return null;
}
