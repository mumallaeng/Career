'use client';

import { useEffect, useState } from 'react';

export type UiLanguage = 'ko' | 'en';
export type UiTheme = 'light' | 'dark';

function readLanguage(): UiLanguage {
  if (typeof document === 'undefined') {
    return 'en';
  }

  return document.documentElement.lang === 'ko' ? 'ko' : 'en';
}

function readTheme(): UiTheme {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function useUiPreferences() {
  const [language, setLanguage] = useState<UiLanguage>('en');
  const [theme, setTheme] = useState<UiTheme>('light');

  useEffect(() => {
    const update = () => {
      setLanguage(readLanguage());
      setTheme(readTheme());
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang', 'data-theme'],
    });

    window.addEventListener('career:languagechange', update);
    window.addEventListener('career:themechange', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('career:languagechange', update);
      window.removeEventListener('career:themechange', update);
    };
  }, []);

  return { language, theme };
}
