/**
 * Date formatting utilities for consistent date display across the application
 */

/**
 * Format date for activity cards (year-month-day)
 */
export function formatActivityDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
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