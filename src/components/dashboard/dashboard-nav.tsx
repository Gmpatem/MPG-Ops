'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/i18n-provider';

interface NavItem {
  href: string;
  label: string;
}

export function DashboardNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems: NavItem[] = [
    { href: '/dashboard', label: t('nav.dashboard') },
    { href: '/bookings', label: t('nav.bookings') },
    { href: '/customers', label: t('nav.customers') },
    { href: '/services', label: t('nav.services') },
    { href: '/payments', label: t('nav.payments') },
    { href: '/settings', label: t('nav.settings') },
  ];

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <nav className="hidden md:block w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 -mb-px">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
