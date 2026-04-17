'use client';

import { useEffect } from 'react';
import { getCurrentBusiness } from '@/app/actions/business';

type TenantType = 'business' | 'church' | 'hospital';

const VALID_TENANTS: TenantType[] = ['business', 'church', 'hospital'];

export function TenantThemeSetter() {
  useEffect(() => {
    async function applyTenantTheme() {
      try {
        const business = await getCurrentBusiness();
        const type = business?.business_type as TenantType | undefined;
        const root = document.documentElement;

        if (type && VALID_TENANTS.includes(type) && type !== 'business') {
          root.setAttribute('data-tenant', type);
        } else {
          root.removeAttribute('data-tenant');
        }
      } catch {
        // Silently fail — default theme is safe
      }
    }

    applyTenantTheme();
  }, []);

  return null;
}
