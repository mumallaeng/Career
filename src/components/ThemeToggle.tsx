'use client';

import { useEffect, useState } from 'react';
import {
  COLOR_SCHEME_MEDIA_QUERY,
  COLOR_SCHEME_STORAGE_KEY,
  DEFAULT_COLOR_SCHEME,
  isColorScheme,
  type ColorScheme,
} from '@/lib/color-scheme';
import { useLanguage } from './LanguageProvider';

function getDocumentColorScheme(): ColorScheme {
  const currentScheme = document.documentElement.dataset.colorScheme ?? null;
  return isColorScheme(currentScheme) ? currentScheme : DEFAULT_COLOR_SCHEME;
}

function applyColorScheme(colorScheme: ColorScheme) {
  document.documentElement.dataset.colorScheme = colorScheme;
}

function getSavedColorScheme(): ColorScheme | null {
  try {
    const storedColorScheme = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    return isColorScheme(storedColorScheme) ? storedColorScheme : null;
  } catch {
    return null;
  }
}

function getPreferredColorScheme(mediaQuery: MediaQueryList): ColorScheme {
  return mediaQuery.matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const { locale } = useLanguage();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(DEFAULT_COLOR_SCHEME);
  const isDark = colorScheme === 'dark';
  const label = locale === 'ko'
    ? (isDark ? '라이트 모드로 전환' : '다크 모드로 전환')
    : (isDark ? 'Switch to light mode' : 'Switch to dark mode');

  useEffect(() => {
    const mediaQuery = window.matchMedia(COLOR_SCHEME_MEDIA_QUERY);
    const syncColorScheme = () => {
      const nextScheme = getSavedColorScheme() ?? getPreferredColorScheme(mediaQuery);
      applyColorScheme(nextScheme);
      setColorScheme(nextScheme);
    };

    syncColorScheme();

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== COLOR_SCHEME_STORAGE_KEY) {
        return;
      }
      syncColorScheme();
    };

    const handleSystemColorScheme = () => {
      if (getSavedColorScheme() === null) {
        syncColorScheme();
      }
    };

    window.addEventListener('storage', handleStorage);
    mediaQuery.addEventListener('change', handleSystemColorScheme);

    return () => {
      window.removeEventListener('storage', handleStorage);
      mediaQuery.removeEventListener('change', handleSystemColorScheme);
    };
  }, []);

  const toggleColorScheme = () => {
    const nextScheme: ColorScheme = getDocumentColorScheme() === 'dark' ? 'light' : 'dark';
    applyColorScheme(nextScheme);
    setColorScheme(nextScheme);

    try {
      window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, nextScheme);
    } catch {
      // Theme switching still works for the current session.
    }
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleColorScheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      <svg className="theme-icon theme-icon--sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg className="theme-icon theme-icon--moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
      </svg>
    </button>
  );
}
