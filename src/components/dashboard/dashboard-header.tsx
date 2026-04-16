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
import { Bell, User } from 'lucide-react';

interface DashboardHeaderProps {
  userEmail?: string;
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="font-bold text-lg sm:text-xl">
          MPG Ops
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Button>

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
                <PopoverTitle>Account</PopoverTitle>
                <PopoverDescription className="truncate">
                  {userEmail || 'No email'}
                </PopoverDescription>
              </PopoverHeader>
              <form action={logout} className="mt-2">
                <Button type="submit" variant="outline" className="w-full h-10 text-sm">
                  Log out
                </Button>
              </form>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
