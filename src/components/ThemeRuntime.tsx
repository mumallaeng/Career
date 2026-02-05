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
    const theme = (queryTheme || defaultTheme || 'hero-grid').trim();
    if (!theme) {
      return;
    }
    document.documentElement.dataset.theme = theme;
  }, [searchParams, defaultTheme]);

  return null;
}
