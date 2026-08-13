'use client';

import { useLanguage } from './LanguageProvider';

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();
  const label = locale === 'ko' ? 'Switch to English' : '한국어로 전환';
  const nextLocaleLabel = locale === 'ko' ? 'EN' : '한';

  return (
    <button type="button" className="language-toggle" onClick={toggleLocale} aria-label={label} title={label}>
      <span aria-hidden="true">{nextLocaleLabel}</span>
    </button>
  );
}
