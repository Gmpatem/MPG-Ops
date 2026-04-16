'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/error-state';
import { FormStatus } from '@/components/form-status';
import { getCurrentBusiness, updatePublicSiteSettings } from '@/app/actions/business';
import { useToast } from '@/components/ui/toast';
import { Copy, Check, ExternalLink, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { PublicSiteSettings } from '@/app/actions/business';

// ─── Accent swatches ──────────────────────────────────────────────────────────

const ACCENT_OPTIONS: { value: NonNullable<PublicSiteSettings['accent']>; label: string; bg: string; ring: string }[] = [
  { value: 'default', label: 'Default',  bg: 'bg-zinc-900',   ring: 'ring-zinc-900' },
  { value: 'blue',    label: 'Blue',     bg: 'bg-blue-600',   ring: 'ring-blue-600' },
  { value: 'green',   label: 'Green',    bg: 'bg-emerald-600', ring: 'ring-emerald-600' },
  { value: 'purple',  label: 'Purple',   bg: 'bg-violet-600', ring: 'ring-violet-600' },
  { value: 'rose',    label: 'Rose',     bg: 'bg-rose-600',   ring: 'ring-rose-600' },
];

// ─── Copy link helper ─────────────────────────────────────────────────────────

function CopyLinkRow({ businessId }: { businessId: string }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${origin}/book/${businessId}`;

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        readOnly
        value={url}
        className="h-10 text-xs bg-muted font-mono flex-1"
        onFocus={(e) => e.target.select()}
      />
      <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="h-10 shrink-0">
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      </Button>
      <a
        href={`/book/${businessId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-10 shrink-0 inline-flex items-center gap-1 px-3 rounded-md border text-sm hover:bg-muted transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicSitePage() {
  const { toast } = useToast();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [headline, setHeadline] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [accent, setAccent] = useState<NonNullable<PublicSiteSettings['accent']>>('default');

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const biz = await getCurrentBusiness();
        if (!biz) { setError('No business found.'); return; }
        setBusinessId(biz.id);
        const s = biz.public_site_settings as PublicSiteSettings | null;
        if (s) {
          setHeadline(s.headline ?? '');
          setSubtitle(s.subtitle ?? '');
          setInstructions(s.instructions ?? '');
          setAccent(s.accent ?? 'default');
        }
      } catch {
        setError('Failed to load settings.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    const result = await updatePublicSiteSettings({
      headline: headline.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      instructions: instructions.trim() || undefined,
      accent: accent === 'default' ? undefined : accent,
    });
    if (result && 'success' in result) {
      setMessage({ type: 'success', text: 'Public site settings saved.' });
      toast({ title: 'Public site settings saved' });
    } else {
      const errMsg = result && 'error' in result ? result.error : 'Failed to save.';
      setMessage({ type: 'error', text: errMsg });
    }
    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-56" />
        <Card className="p-6 space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
          <Skeleton className="h-11 w-32" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight">Public Site</h1>
        <Card className="p-8">
          <ErrorState title="Failed to load" message={error} onRetry={() => window.location.reload()} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Public Booking Site</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Customize what customers see when they open your booking link.
        </p>
      </div>

      {/* Booking link */}
      {businessId && (
        <Card className="p-6">
          <h3 className="font-semibold text-sm mb-1">Your Booking Link</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Share this link with customers so they can book online.
          </p>
          <CopyLinkRow businessId={businessId} />
        </Card>
      )}

      {/* Customization form */}
      <Card className="p-6 space-y-5">
        <div>
          <h3 className="font-semibold mb-0.5">Appearance &amp; Content</h3>
          <p className="text-xs text-muted-foreground">
            All fields are optional. Customers see defaults if left blank.
          </p>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="headline" className="text-sm font-medium">
              Welcome headline
            </Label>
            <span className="text-xs text-muted-foreground">{headline.length}/80</span>
          </div>
          <Input
            id="headline"
            type="text"
            placeholder="Book Your Appointment"
            value={headline}
            maxLength={80}
            onChange={(e) => setHeadline(e.target.value)}
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">
            The main heading customers see on your booking page.
          </p>
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="subtitle" className="text-sm font-medium">
              Subtitle
            </Label>
            <span className="text-xs text-muted-foreground">{subtitle.length}/120</span>
          </div>
          <Input
            id="subtitle"
            type="text"
            placeholder="Easy online booking — it only takes a minute."
            value={subtitle}
            maxLength={120}
            onChange={(e) => setSubtitle(e.target.value)}
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">
            A short line shown below the headline.
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="instructions" className="text-sm font-medium">
              Booking instructions
              <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <span className="text-xs text-muted-foreground">{instructions.length}/300</span>
          </div>
          <Textarea
            id="instructions"
            placeholder="e.g. Please arrive 5 minutes early. Bring a valid ID."
            value={instructions}
            maxLength={300}
            onChange={(e) => setInstructions(e.target.value)}
            className="min-h-24 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Shown to customers before they start booking.
          </p>
        </div>

        {/* Accent color */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Accent color</Label>
          <div className="flex flex-wrap gap-3">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAccent(opt.value)}
                className={`flex flex-col items-center gap-1.5 group`}
              >
                <span
                  className={`w-9 h-9 rounded-full ${opt.bg} ring-2 ring-offset-2 transition-all ${
                    accent === opt.value ? opt.ring : 'ring-transparent'
                  }`}
                />
                <span className={`text-xs ${accent === opt.value ? 'font-semibold' : 'text-muted-foreground'}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Changes the button and highlight color on your public booking page.
          </p>
        </div>

        {/* Feedback */}
        {message && <FormStatus type={message.type} message={message.text} />}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <Button
            type="button"
            className="h-11 px-6"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          {businessId && (
            <a
              href={`/book/${businessId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preview public site
            </a>
          )}
        </div>
      </Card>
    </div>
  );
}
