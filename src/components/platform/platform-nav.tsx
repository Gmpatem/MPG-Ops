'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Wallet,
  BarChart3,
  ToggleLeft,
  ClipboardList,
  Stethoscope,
  LifeBuoy,
  MessageSquareHeart,
} from 'lucide-react';

const nav = [
  { href: '/platform', label: 'Overview', icon: LayoutDashboard },
  { href: '/platform/businesses', label: 'Businesses', icon: Building2 },
  { href: '/platform/users', label: 'Users', icon: Users },
  { href: '/platform/payments', label: 'Payment Mgmt', icon: Wallet },
  { href: '/platform/support-requests', label: 'Support Requests', icon: LifeBuoy },
  { href: '/platform/feedback', label: 'Feedback', icon: MessageSquareHeart },
  { href: '/platform/diagnostics', label: 'Diagnostics', icon: Stethoscope },
  { href: '/platform/audit', label: 'Audit Log', icon: ClipboardList },
  { href: '/platform/plans', label: 'Plans', icon: CreditCard },
  { href: '/platform/metrics', label: 'Metrics', icon: BarChart3 },
  { href: '/platform/feature-flags', label: 'Feature Flags', icon: ToggleLeft },
];

export function PlatformNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r bg-muted/30">
      <div className="px-4 py-4 md:py-6">
        <Link href="/platform" className="flex items-center gap-2 font-bold text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            A
          </span>
          Admin
        </Link>
      </div>
      <nav className="flex md:flex-col gap-1 overflow-x-auto px-4 pb-3 md:pb-0 scrollbar-hide">
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === '/platform'
              ? pathname === '/platform'
              : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors md:min-h-10',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
