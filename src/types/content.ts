/**
 * Types for content management system
 */

export interface FrontMatter {
  title: string;
  date: string;
  startDate?: string;
  endDate?: string;
  description: string;
  tags: string[];
  categories: string[];
  featured?: boolean;
  draft?: boolean;
  type?: string;
  role?: string;
  thumbnail?: string;
  content_type?: string;
}

export interface Content {
  slug: string;
  frontMatter: FrontMatter;
  content: string;
  preview: string;
  thumbnailUrl?: string;
}