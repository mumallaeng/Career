'use client';

import { createElement } from 'react';
import { useUiPreferences } from '@/hooks/useUiPreferences';

type LocalizedTextProps = {
  en: string;
  ko?: string;
  as?: keyof HTMLElementTagNameMap;
  className?: string;
};

export default function LocalizedText({
  en,
  ko,
  as = 'span',
  className,
}: LocalizedTextProps) {
  const { language } = useUiPreferences();
  const content = language === 'ko' ? (ko ?? en) : en;

  return createElement(as, className ? { className } : undefined, content);
}
