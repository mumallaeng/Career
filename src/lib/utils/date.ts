import { ContentType, Locale } from '@/types/content';

/**
 * Date formatting utilities for consistent date display across the application
 */

/**
 * Format date for project cards (year-month only)
 */
export function formatProjectDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: '2-digit' 
  });
}

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
 * Format date based on content type
 */
export function formatContentDate(dateString: string, type: ContentType): string {
  return type === 'projects' ? formatProjectDate(dateString) : formatActivityDate(dateString);
}

/**
 * Format date for post pages (full date with locale support)
 */
export function formatPostDate(dateString: string, locale: Locale = 'ko'): string {
  const date = new Date(dateString);
  
  if (locale === 'en') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}