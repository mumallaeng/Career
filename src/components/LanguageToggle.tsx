'use client';

import { useLanguage } from './LanguageProvider';

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();
  const label = locale === 'ko' ? 'Switch to English' : '한국어로 전환';

  return (
    <button type="button" className="language-toggle" onClick={toggleLocale} aria-label={label} title={label}>
      <span className={`language-toggle-option${locale === 'ko' ? ' active' : ''}`}>한</span>
      <span className="language-toggle-divider" aria-hidden="true">/</span>
      <span className={`language-toggle-option${locale === 'en' ? ' active' : ''}`}>EN</span>
    </button>
  );
}
