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
  source_vault_path: string;
  source_hash?: string;
  publication_id: string;
  summary?: string;
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
  sourceFilePath: string;
  contentPath: string;
  publicPath: string;
  docRootPath?: string;
}

export interface ContentDocument {
  content: Content;
  title: string;
  body: string;
  filePath: string;
  fileExtension: string;
  contentPath: string;
  frontMatter: Record<string, string>;
  docPath: string[];
  contextLabel: string;
}
