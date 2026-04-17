'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, Sparkles, Crown } from 'lucide-react';
import type { PlanTier } from '@/lib/subscription';

interface FeatureGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredPlan: PlanTier;
  featureName: string;
  description?: string;
}

export function FeatureGate({
  open,
  onOpenChange,
  requiredPlan,
  featureName,
  description,
}: FeatureGateProps) {
  const isBusiness = requiredPlan === 'business';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center py-2">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              isBusiness ? 'bg-info/15 text-info' : 'bg-primary/10 text-primary'
            }`}
          >
            {isBusiness ? <Crown className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <DialogHeader>
            <DialogTitle className="text-base">{featureName}</DialogTitle>
            <DialogDescription className="text-sm">
              {description ||
                `This feature is available on the ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} plan.`}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="mt-2 space-y-2">
          <Link href="/settings/billing" className="block">
            <Button className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
            </Button>
          </Link>
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
