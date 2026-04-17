'use client';

import { useI18n, supportedLocales, type Locale } from '@/lib/i18n/i18n-provider';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Globe, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LanguageSwitcherProps {
  variant?: 'select' | 'minimal' | 'dropdown';
}

export function LanguageSwitcher({ variant = 'select' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  if (variant === 'dropdown') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label={t('common.language')}
            title={t('common.language')}
          >
            <Globe className="h-[18px] w-[18px]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={6} className="w-44 p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
            Language
          </div>
          <div className="flex flex-col">
            {supportedLocales.map((l) => (
              <button
                key={l.value}
                onClick={() => setLocale(l.value as Locale)}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
                aria-label={l.label}
              >
                <span className={locale === l.value ? 'font-medium' : ''}>
                  {l.label}
                </span>
                {locale === l.value && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-1 text-xs">
        {supportedLocales.map((l) => (
          <button
            key={l.value}
            onClick={() => setLocale(l.value as Locale)}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              locale === l.value
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={l.label}
          >
            {l.value.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger className="w-32 h-9 text-sm" aria-label={t('common.language')}>
        <SelectValue placeholder={t('common.language')} />
      </SelectTrigger>
      <SelectContent>
        {supportedLocales.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
