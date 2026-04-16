'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/error-state';
import { FormStatus } from '@/components/form-status';
import {
  getServicesForPublicManagement,
  updateServicePublicSettings,
  type ServiceWithPublicFields,
} from '@/app/actions/public-services';
import { getCurrentBusiness } from '@/app/actions/business';
import { useToast } from '@/components/ui/toast';
import { ExternalLink, Star, Eye, EyeOff, Globe } from 'lucide-react';

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        checked ? 'bg-primary' : 'bg-muted-foreground/30'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Service row state ────────────────────────────────────────────────────────

interface ServiceRowState {
  showOnPublic: boolean;
  isFeatured: boolean;
  publicTitle: string;
  publicDescription: string;
  promoBadge: string;
  promoText: string;
  displayOrder: string;
}

function serviceToRowState(s: ServiceWithPublicFields): ServiceRowState {
  return {
    showOnPublic: s.show_on_public_booking,
    isFeatured: s.is_featured,
    publicTitle: s.public_title ?? '',
    publicDescription: s.public_description ?? '',
    promoBadge: s.promo_badge ?? '',
    promoText: s.promo_text ?? '',
    displayOrder: String(s.display_order),
  };
}

// ─── Service card ─────────────────────────────────────────────────────────────

function ServicePublicCard({
  service,
  onSaved,
}: {
  service: ServiceWithPublicFields;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [state, setState] = useState<ServiceRowState>(() => serviceToRowState(service));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expanded, setExpanded] = useState(false);

  function update<K extends keyof ServiceRowState>(key: K, value: ServiceRowState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    const result = await updateServicePublicSettings(service.id, {
      show_on_public_booking: state.showOnPublic,
      is_featured: state.isFeatured,
      public_title: state.publicTitle.trim() || undefined,
      public_description: state.publicDescription.trim() || undefined,
      promo_badge: state.promoBadge.trim() || undefined,
      promo_text: state.promoText.trim() || undefined,
      display_order: Number(state.displayOrder) || 0,
    });
    if ('success' in result) {
      setMessage({ type: 'success', text: 'Saved.' });
      toast({ title: `"${service.name}" public settings saved` });
      onSaved();
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    setIsSaving(false);
  }

  return (
    <Card className={`p-4 ${!service.is_active ? 'opacity-60' : ''}`}>
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-base truncate">{service.name}</span>
            {!service.is_active && (
              <Badge variant="secondary" className="text-xs shrink-0">Inactive</Badge>
            )}
            {state.isFeatured && (
              <Badge className="bg-amber-100 text-amber-800 text-xs shrink-0 border-0">
                <Star className="w-2.5 h-2.5 mr-0.5" />Featured
              </Badge>
            )}
            {!state.showOnPublic && (
              <Badge variant="secondary" className="text-xs shrink-0 text-muted-foreground">
                <EyeOff className="w-2.5 h-2.5 mr-0.5" />Hidden
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            ₱{service.price.toFixed(0)} · {service.duration_minutes} min
            {service.category ? ` · ${service.category}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 underline underline-offset-2"
        >
          {expanded ? 'Collapse' : 'Edit'}
        </button>
      </div>

      {/* Quick toggles — always visible */}
      <div className="flex items-center gap-6 mb-3">
        <div className="flex items-center gap-2">
          <Toggle
            checked={state.showOnPublic}
            onChange={(v) => update('showOnPublic', v)}
            label="Show on public booking page"
          />
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            {state.showOnPublic ? (
              <><Eye className="w-3.5 h-3.5" />Visible</>
            ) : (
              <><EyeOff className="w-3.5 h-3.5" />Hidden</>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Toggle
            checked={state.isFeatured}
            onChange={(v) => update('isFeatured', v)}
            label="Mark as featured"
          />
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />Featured
          </span>
        </div>
      </div>

      {/* Expanded detail form */}
      {expanded && (
        <div className="border-t pt-4 space-y-4">
          {/* Public title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`pt-${service.id}`} className="text-sm font-medium">
                Public title
                <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              <span className="text-xs text-muted-foreground">{state.publicTitle.length}/80</span>
            </div>
            <Input
              id={`pt-${service.id}`}
              placeholder={service.name}
              value={state.publicTitle}
              maxLength={80}
              onChange={(e) => update('publicTitle', e.target.value)}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">Overrides the service name on the public page. Leave blank to use the service name.</p>
          </div>

          {/* Public description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`pd-${service.id}`} className="text-sm font-medium">
                Public description
                <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              <span className="text-xs text-muted-foreground">{state.publicDescription.length}/200</span>
            </div>
            <Textarea
              id={`pd-${service.id}`}
              placeholder="Brief description customers see when choosing this service…"
              value={state.publicDescription}
              maxLength={200}
              onChange={(e) => update('publicDescription', e.target.value)}
              className="min-h-16 resize-none"
            />
          </div>

          {/* Promo badge + display order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={`pb-${service.id}`} className="text-sm font-medium">
                  Promo badge
                </Label>
                <span className="text-xs text-muted-foreground">{state.promoBadge.length}/30</span>
              </div>
              <Input
                id={`pb-${service.id}`}
                placeholder="e.g. Popular"
                value={state.promoBadge}
                maxLength={30}
                onChange={(e) => update('promoBadge', e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`do-${service.id}`} className="text-sm font-medium">
                Display order
              </Label>
              <Input
                id={`do-${service.id}`}
                type="number"
                min={0}
                max={9999}
                placeholder="0"
                value={state.displayOrder}
                onChange={(e) => update('displayOrder', e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          {/* Promo text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={`pxt-${service.id}`} className="text-sm font-medium">
                Promo text
                <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              <span className="text-xs text-muted-foreground">{state.promoText.length}/120</span>
            </div>
            <Input
              id={`pxt-${service.id}`}
              placeholder="e.g. Book before Friday for 10% off"
              value={state.promoText}
              maxLength={120}
              onChange={(e) => update('promoText', e.target.value)}
              className="h-11"
            />
          </div>

          {/* Feedback + save */}
          {message && <FormStatus type={message.type} message={message.text} />}
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={handleSave}
              className="h-10 px-5"
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 text-muted-foreground"
              onClick={() => {
                setState(serviceToRowState(service));
                setMessage(null);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Quick save when not expanded */}
      {!expanded && (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="h-9 text-xs px-4"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
          {message && (
            <span className={`text-xs ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Public Section ───────────────────────────────────────────────────────────

export function ServicePublicSection() {
  const [services, setServices] = useState<ServiceWithPublicFields[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [data, biz] = await Promise.all([
        getServicesForPublicManagement(),
        getCurrentBusiness(),
      ]);
      setServices(data as ServiceWithPublicFields[]);
      setBusinessId((biz?.id as string) ?? null);
    } catch {
      setError('Failed to load services.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-8 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <ErrorState title="Failed to load services" message={error} onRetry={load} />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Explainer */}
      <Card className="p-4 bg-muted/40 border-dashed">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium">These settings only affect your public booking page.</p>
            <p className="text-muted-foreground">
              Toggle visibility, mark services as featured, add promo badges, and control display order.
              Inactive services never appear publicly regardless of these settings.
            </p>
          </div>
        </div>
      </Card>

      {/* Empty state */}
      {services.length === 0 && (
        <Card className="p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Globe className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-semibold mb-1">No services yet</p>
          <p className="text-sm text-muted-foreground">
            Add services in the Services tab first.
          </p>
        </Card>
      )}

      {/* Count + preview link */}
      {services.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {services.filter((s) => s.show_on_public_booking && s.is_active).length} of {services.length} services visible publicly
            </p>
            {businessId && (
              <a
                href={`/book/${businessId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Preview</span>
              </a>
            )}
          </div>

          {services.map((service) => (
            <ServicePublicCard key={service.id} service={service} onSaved={load} />
          ))}
        </>
      )}
    </div>
  );
}
