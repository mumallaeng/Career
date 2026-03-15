/**
 * Date formatting utilities for consistent date display across the application
 */

export function getPrimaryDateValue(startDate?: string, endDate?: string): string {
  return startDate || endDate || '1970-01-01';
}

function getLocale(language: 'ko' | 'en'): string {
  return language === 'ko' ? 'ko-KR' : 'en-US';
}

function formatSingleDate(dateString: string | undefined, language: 'ko' | 'en'): string | null {
  if (!dateString) {
    return null;
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (language === 'ko') {
    return date.toLocaleDateString(getLocale(language), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  return date.toLocaleDateString(getLocale(language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date for activity cards (year-month-day)
 */
export function formatActivityDate(
  startDate?: string,
  endDate?: string,
  language: 'ko' | 'en' = 'ko',
): string {
  const formattedStart = formatSingleDate(startDate, language);
  const formattedEnd = formatSingleDate(endDate, language);

  if (formattedStart && formattedEnd && formattedStart === formattedEnd) {
    return formattedStart;
  }

  if (formattedStart && formattedEnd) {
    return `${formattedStart} - ${formattedEnd}`;
  }

  return formattedStart ?? formattedEnd ?? '';
}

/**
 * Format date for post pages (full date)
 */
export function formatPostDate(dateString: string, language: 'ko' | 'en' = 'ko'): string {
  const date = new Date(dateString);

  return date.toLocaleDateString(getLocale(language), {
    year: 'numeric',
    month: language === 'ko' ? 'long' : 'short',
    day: 'numeric',
  });
}
