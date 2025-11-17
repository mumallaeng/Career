/**
 * Date formatting utilities for consistent date display across the application
 */

/**
 * Format date for activity cards (year-month-day)
 */
export function formatActivityDate(startDate?: string, endDate?: string): string {
  const format = (dateString: string | undefined) => {
    if (!dateString) {
      return null;
    }

    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formattedStart = format(startDate);
  const formattedEnd = format(endDate);

  if (formattedStart && formattedEnd) {
    return `${formattedStart} ~ ${formattedEnd}`;
  }

  return formattedStart ?? formattedEnd ?? '';
}

/**
 * Format date for post pages (full date)
 */
export function formatPostDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
