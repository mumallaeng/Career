'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { homeCopy } from '@/lib/i18n';

interface ActivityDetailCloseProps {
  href: string;
}

export default function ActivityDetailClose({ href }: ActivityDetailCloseProps) {
  const { locale } = useLanguage();
  const label = homeCopy[locale].detail.close;

  return (
    <Link
      href={href}
      className="activity-detail-close"
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      </svg>
    </Link>
  );
}
