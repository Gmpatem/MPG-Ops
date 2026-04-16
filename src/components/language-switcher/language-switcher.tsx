'use client';

import { useI18n, supportedLocales } from '@/lib/i18n/i18n-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LanguageSwitcherProps {
  variant?: 'select' | 'minimal';
}

export function LanguageSwitcher({ variant = 'select' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-1 text-xs">
        {supportedLocales.map((l, index) => (
          <button
            key={l.value}
            onClick={() => setLocale(l.value)}
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
    <Select value={locale} onValueChange={(value) => setLocale(value as typeof locale)}>
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
