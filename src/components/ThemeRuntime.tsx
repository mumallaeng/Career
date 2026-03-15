"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

type ThemeRuntimeProps = {
  defaultTheme: string;
};

export default function ThemeRuntime({ defaultTheme }: ThemeRuntimeProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryTheme = searchParams.get('theme');
    const storedTheme = window.localStorage.getItem('career-theme');
    const browserTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const theme = (queryTheme || storedTheme || browserTheme || defaultTheme || 'light').trim();
    document.documentElement.dataset.theme = theme || 'light';

    const queryLang = searchParams.get('lang');
    const storedLang = window.localStorage.getItem('career-lang');
    const browserLang = [...(navigator.languages || []), navigator.language || '']
      .find(Boolean) || 'en';
    const normalizedBrowserLang = /^ko\b/i.test(browserLang) ? 'ko' : 'en';
    const lang = (queryLang || storedLang || normalizedBrowserLang || document.documentElement.lang || 'en').trim();
    document.documentElement.lang = lang || 'en';
  }, [searchParams, defaultTheme]);

  return null;
}
