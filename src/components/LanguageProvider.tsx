'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  LANGUAGE_STORAGE_KEY,
  localeFromLanguageTags,
  type Locale,
} from '@/lib/i18n';

interface LanguageContextValue {
  locale: Locale;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getPreferredLocale(): Locale {
  const preferredLanguages = [
    ...(window.navigator.languages ?? []),
    window.navigator.language,
  ];
  return localeFromLanguageTags(preferredLanguages);
}

function getSavedLocale(): Locale | null {
  try {
    const storedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedLocale === 'ko' || storedLocale === 'en' ? storedLocale : null;
  } catch {
    return null;
  }
}

function getInitialLocale(): Locale {
  return getSavedLocale() ?? getPreferredLocale();
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const syncLocale = () => setLocale(getInitialLocale());

    syncLocale();
    window.addEventListener('languagechange', syncLocale);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === LANGUAGE_STORAGE_KEY) {
        syncLocale();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('languagechange', syncLocale);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const toggleLocale = useCallback(() => {
    const nextLocale = locale === 'ko' ? 'en' : 'ko';
    setLocale(nextLocale);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale);
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
