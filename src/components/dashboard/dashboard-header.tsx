'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { logout } from '@/app/actions/auth';
import { User } from 'lucide-react';
import { formatPlanLabel, formatSubscriptionStatus, isTrialActive } from '@/lib/subscription';
import { useI18n } from '@/lib/i18n/i18n-provider';
import { LanguageSwitcher } from '@/components/language-switcher/language-switcher';
import { NotificationBell } from '@/components/notifications/notification-bell';
import type { Tables } from '@/lib/supabase/database.types';

interface DashboardHeaderProps {
  userEmail?: string;
  business?: Tables<'businesses'> | null;
}

export function DashboardHeader({ userEmail, business }: DashboardHeaderProps) {
  const { t } = useI18n();
  const planLabel = business ? formatPlanLabel(isTrialActive(business) ? 'pro' : (business.plan_tier as 'free' | 'pro' | 'business')) : 'Free';
  const statusLabel = business ? formatSubscriptionStatus(business.subscription_status as 'trialing' | 'active' | 'expired' | 'free') : '';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 pt-safe backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="font-bold text-lg sm:text-xl truncate">
          {business?.name || 'MPG Ops'}
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationBell />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border bg-muted/50"
                aria-label="Profile"
                title="Profile"
              >
                <User className="h-[18px] w-[18px] text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={6} className="w-64">
              <PopoverHeader>
                <PopoverTitle>{t('common.account')}</PopoverTitle>
                <PopoverDescription className="truncate">
                  {userEmail || 'No email'}
                </PopoverDescription>
              </PopoverHeader>
              {business && (
                <div className="mt-3 rounded-lg border bg-muted/40 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t('common.plan')}</span>
                    <span className="text-xs font-medium">{planLabel}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{t('common.status')}</span>
                    <span className="text-xs font-medium">{statusLabel}</span>
                  </div>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Language</span>
                <LanguageSwitcher variant="dropdown" />
              </div>
              <form action={logout} className="mt-3">
                <Button type="submit" variant="outline" className="w-full h-10 text-sm">
                  {t('common.logOut')}
                </Button>
              </form>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
