'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import en from './locales/en.json';
import tl from './locales/tl.json';
import fr from './locales/fr.json';
import es from './locales/es.json';

export type Locale = 'en' | 'tl' | 'fr' | 'es';

const dictionaries: Record<Locale, typeof en> = {
  en,
  tl,
  fr,
  es,
};

const STORAGE_KEY = 'mpg-ops-lang';

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current !== null && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in dictionaries) {
      return stored;
    }
    return 'en';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = dictionaries[locale] ?? en;
      let value = getNestedValue(dict as Record<string, unknown>, key);
      if (value === undefined) {
        value = getNestedValue(en as Record<string, unknown>, key);
      }
      if (value === undefined) {
        return key;
      }
      if (vars) {
        return Object.entries(vars).reduce((acc, [k, v]) => {
          return acc.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
        }, value);
      }
      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

export const supportedLocales: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'tl', label: 'Taglish' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
];
