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
  const rawContent = language === 'ko' ? (ko ?? en) : en;
  const content = rawContent.replace(/\\n/g, '\n');

  return createElement(as, className ? { className } : undefined, content);
}
