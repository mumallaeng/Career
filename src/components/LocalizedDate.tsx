'use client';

import { formatActivityDate } from '@/lib/utils/date';
import { useUiPreferences } from '@/hooks/useUiPreferences';

interface LocalizedDateProps {
  startDate?: string;
  endDate?: string;
  className?: string;
}

export default function LocalizedDate({
  startDate,
  endDate,
  className,
}: LocalizedDateProps) {
  const { language } = useUiPreferences();
  const label = formatActivityDate(startDate, endDate, language);

  return (
    <time className={className}>
      {label}
    </time>
  );
}
