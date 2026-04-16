'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Copy, Check, ExternalLink, Paintbrush, Globe } from 'lucide-react';
import Link from 'next/link';

interface PublicSiteCardProps {
  businessId: string;
}

export function PublicSiteCard({ businessId }: PublicSiteCardProps) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const bookingUrl = `${origin}/book/${businessId}`;

  function handleCopy() {
    navigator.clipboard.writeText(bookingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Card className="p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm sm:text-base">Your Public Booking Site</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Customers can book appointments directly from this link — no account needed.
          </p>
        </div>
      </div>

      {/* URL row */}
      <div className="flex items-center gap-2 mb-3">
        <Input
          readOnly
          value={bookingUrl}
          className="h-10 text-xs bg-muted font-mono flex-1"
          onFocus={(e) => e.target.select()}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-10 shrink-0"
          title="Copy booking link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
        <a
          href={`/book/${businessId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 shrink-0 inline-flex items-center px-3 rounded-md border text-sm hover:bg-muted transition-colors"
          title="Open public site in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <Link href="/settings/public-site" className="inline-flex">
          <Button variant="outline" size="sm" className="gap-1.5 h-9">
            <Paintbrush className="w-4 h-4" />
            Customize Site
          </Button>
        </Link>
        <span className="text-xs text-muted-foreground">
          Change the headline, colors, and instructions customers see.
        </span>
      </div>
    </Card>
  );
}
