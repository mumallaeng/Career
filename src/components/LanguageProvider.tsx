'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Locale } from '@/lib/i18n';

const STORAGE_KEY = 'career-language';

interface LanguageContextValue {
  locale: Locale;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('ko');

  useEffect(() => {
    let initialLocale: Locale = 'ko';
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'ko' || stored === 'en') {
        initialLocale = stored;
      }
    } catch {
      // Keep the Korean default when storage is unavailable.
    }
    setLocale(initialLocale);
    document.documentElement.lang = initialLocale;
  }, []);

  const toggleLocale = useCallback(() => {
    const nextLocale = locale === 'ko' ? 'en' : 'ko';
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // Language switching still works for the current session.
    }
  }, [locale]);

  const value = useMemo(() => ({ locale, toggleLocale }), [locale, toggleLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider.');
  }
  return context;
}
