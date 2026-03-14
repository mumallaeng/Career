export type ContentKind = 'profile' | 'resume' | 'work' | 'writing';
export type WorkType = 'project' | 'case-study';

export interface FrontMatter {
  title: string;
  description: string;
  tags: string[];
  categories: string[];
  date?: string;
  startDate?: string;
  endDate?: string;
  publicationDate?: string;
  updatedAt?: string;
  featured?: boolean;
  draft?: boolean;
  type?: string;
  role?: string;
  thumbnail?: string;
  content_type?: string;
  recommendation_priority?: number;
  thumbnail_asset_id?: string;
  content_kind: ContentKind;
  work_type?: WorkType;
  summary?: string;
}

export interface ParsedFrontMatter extends FrontMatter {
  publication_id?: string;
}

export interface Content {
  slug: string;
  collection: ContentKind;
  frontMatter: FrontMatter;
  content: string;
  preview: string;
  thumbnailUrl?: string;
  thumbnailHasExplicitSize?: boolean;
  fileExtension: 'md' | 'mdx';
  contentPath: string;
  publicPath: string;
}

export interface ContentCardData {
  slug: string;
  collection: ContentKind;
  frontMatter: FrontMatter;
  thumbnailUrl?: string;
  thumbnailHasExplicitSize?: boolean;
  publicPath: string;
}

export interface ContentDocument {
  content: Content;
  title: string;
  body: string;
  fileExtension: string;
  contentPath: string;
  frontMatter: Record<string, string>;
  docPath: string[];
  contextLabel: string;
}
