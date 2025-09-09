/**
 * Types for content management system
 */

export interface FrontMatter {
  title: string;
  date: string;
  author?: string;
  description: string;
  tags: string[];
  categories: string[];
  translationKey: string;
  featured?: boolean;
  draft?: boolean;
  isAutoTranslated?: boolean;
  originalLang?: string;
  type?: string;
  role?: string;
}

export interface Content {
  slug: string;
  frontMatter: FrontMatter;
  content: string;
  preview: string;
  locale: string;
}

export type ContentType = 'projects' | 'activities';
export type Locale = 'ko' | 'en';