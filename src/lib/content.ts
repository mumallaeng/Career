import fs from 'fs';
import path from 'path';
import { Content, ContentDocument, ContentKind, FrontMatter } from '@/types/content';
import {
  getOneDriveAssetByFilename,
  getOneDriveAssetUrl,
  getOneDriveAssetsByActId,
  onedriveAssetMap,
} from '@/data/onedrive-assets';
import { containsPlantUml, isPlantUmlExtension } from '@/lib/plantuml';

interface ThumbnailData {
  url: string;
  hasExplicitDimensions: boolean;
}

const CONTENT_ROOT = path.join(process.cwd(), 'src/content');
const PROFILE_ROOT = path.join(CONTENT_ROOT, 'profile');
const RESUME_ROOT = path.join(CONTENT_ROOT, 'resume');
const WORK_ROOT = path.join(CONTENT_ROOT, 'work');
const WRITING_ROOT = path.join(CONTENT_ROOT, 'writing');
const FILE_EXTENSIONS = ['.mdx', '.md'] as const;
const DOC_EXTENSIONS = new Set(['.md', '.mdx', '.puml', '.plantuml', '.dbml']);

function toPosixPath(value: string): string {
  return value.split(path.sep).join('/');
}

function parseScalarValue(rawValue: string): string | string[] | boolean | number {
  let value = rawValue.trim();

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
    value = value.slice(1, -1);
  }

  if (value.startsWith('[') && value.endsWith(']')) {
    const body = value.slice(1, -1).trim();
    if (!body) {
      return [];
    }

    return body
      .split(',')
      .map(entry => entry.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);

  return value;
}

function parseFrontMatter(fileContent: string): { frontMatter: FrontMatter; content: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
  const match = fileContent.match(frontMatterRegex);

  if (!match) {
    throw new Error('Invalid front matter format');
  }

  const frontMatterLines = match[1].split('\n');
  const content = match[2].trim();
  const frontMatter: Record<string, unknown> = {};

  for (const line of frontMatterLines) {
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    frontMatter[key] = parseScalarValue(value);
  }

  return {
    frontMatter: {
      tags: [],
      categories: [],
      ...frontMatter,
    } as unknown as FrontMatter,
    content,
  };
}

function parseDocumentFrontMatter(fileContent: string): {
  frontMatter: Record<string, string>;
  body: string;
} {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n?/;
  const match = fileContent.match(frontMatterRegex);

  if (!match) {
    return {
      frontMatter: {},
      body: fileContent,
    };
  }

  const frontMatter: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
      value = value.slice(1, -1);
    }
    frontMatter[key] = value;
  }

  return {
    frontMatter,
    body: fileContent.slice(match[0].length).trimStart(),
  };
}

function driveUrlToId(driveUrl: string): string | null {
  const match = driveUrl.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function transformDriveUrl(driveUrl: string): string | undefined {
  const fileId = driveUrlToId(driveUrl);
  if (!fileId) {
    return undefined;
  }
  return `https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=${fileId}`;
}

function hasExplicitSize(tag: string): boolean {
  const widthAttribute = /\bwidth\s*=\s*(?:["'][^"']+["']|\{[^}]+\})/i;
  const heightAttribute = /\bheight\s*=\s*(?:["'][^"']+["']|\{[^}]+\})/i;
  const styleAttribute = /\bstyle\s*=\s*(?:["'][^"']*(?:width|height)[^"']*["']|\{\{[^}]*\b(?:width|height)\b[^}]*}})/i;

  return widthAttribute.test(tag) || heightAttribute.test(tag) || styleAttribute.test(tag);
}

function resolveOneDriveThumbnail(assetId?: string): ThumbnailData | undefined {
  if (!assetId) return undefined;
  const asset = onedriveAssetMap[assetId as keyof typeof onedriveAssetMap];
  if (!asset) return undefined;
  return {
    url: getOneDriveAssetUrl(asset, 'thumb'),
    hasExplicitDimensions: false,
  };
}

function resolveThumbnailFromFrontMatter(frontMatter: FrontMatter): ThumbnailData | undefined {
  const thumbnailFromAssetId = resolveOneDriveThumbnail(frontMatter.thumbnail_asset_id);
  if (thumbnailFromAssetId) {
    return thumbnailFromAssetId;
  }

  const rawThumbnail = frontMatter.thumbnail?.trim();
  if (!rawThumbnail) {
    return undefined;
  }

  const assetFromFilename = getOneDriveAssetByFilename(rawThumbnail);
  if (assetFromFilename) {
    return {
      url: getOneDriveAssetUrl(assetFromFilename, 'thumb'),
      hasExplicitDimensions: false,
    };
  }

  const transformedDriveUrl = transformDriveUrl(rawThumbnail);
  if (transformedDriveUrl) {
    return {
      url: transformedDriveUrl,
      hasExplicitDimensions: false,
    };
  }

  return {
    url: rawThumbnail,
    hasExplicitDimensions: false,
  };
}

function extractFirstImage(content: string): ThumbnailData | undefined {
  const customImgMatch = content.match(/(<ImgTag[^>]*driveUrl=["']([^"']+)["'][^>]*\/?>(?:<\/ImgTag>)?)/i);
  if (customImgMatch) {
    const [, fullMatch, driveUrl] = customImgMatch;
    const transformed = transformDriveUrl(driveUrl);
    if (transformed) {
      return {
        url: transformed,
        hasExplicitDimensions: hasExplicitSize(fullMatch),
      };
    }
  }

  const gridMatch = content.match(/<DriveAssetGrid[^>]*actId=["']([^"']+)["'][^>]*\/?>/i);
  if (gridMatch) {
    const actId = gridMatch[1].trim();
    const assets = getOneDriveAssetsByActId(actId);
    if (assets.length > 0) {
      return {
        url: getOneDriveAssetUrl(assets[0], 'thumb'),
        hasExplicitDimensions: false,
      };
    }
  }

  const htmlImgMatch = content.match(/(<img[^>]+>)/i);
  if (htmlImgMatch) {
    const tag = htmlImgMatch[1];
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    if (srcMatch) {
      return {
        url: srcMatch[1],
        hasExplicitDimensions: hasExplicitSize(tag),
      };
    }
  }

  const mdImgMatch = content.match(/!\[.*?\]\(([^)]+)\)/);
  if (mdImgMatch) {
    return {
      url: mdImgMatch[1],
      hasExplicitDimensions: false,
    };
  }

  return undefined;
}

function extractPreview(content: string, length = 160): string {
  const preview = content
    .replace(/^import .*$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#.*$/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (preview.length <= length) {
    return preview;
  }

  return `${preview.slice(0, length).trim()}...`;
}

function getFileExtension(filePath: string): 'md' | 'mdx' {
  return filePath.endsWith('.mdx') ? 'mdx' : 'md';
}

function getRelativeContentPath(filePath: string): string {
  return toPosixPath(path.relative(CONTENT_ROOT, filePath));
}

function getPrimaryDate(frontMatter: FrontMatter): string {
  return (
    frontMatter.updatedAt ||
    frontMatter.publicationDate ||
    frontMatter.startDate ||
    frontMatter.endDate ||
    frontMatter.date ||
    '1970-01-01'
  );
}

function buildPublicPath(collection: ContentKind, slug: string): string {
  switch (collection) {
    case 'profile':
      return '/profile';
    case 'resume':
      return '/resume';
    case 'writing':
      return `/writing/${slug}`;
    case 'work':
      return `/work/${slug}`;
    default:
      return '/';
  }
}

function createContentItem(collection: ContentKind, slug: string, filePath: string, docRootPath?: string): Content {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { frontMatter, content } = parseFrontMatter(fileContent);
  const extractedThumbnail = resolveThumbnailFromFrontMatter(frontMatter) ?? extractFirstImage(content);

  return {
    slug,
    collection,
    frontMatter,
    content,
    preview: extractPreview(content),
    thumbnailUrl: extractedThumbnail?.url,
    thumbnailHasExplicitSize: extractedThumbnail?.hasExplicitDimensions ?? false,
    fileExtension: getFileExtension(filePath),
    sourceFilePath: filePath,
    contentPath: getRelativeContentPath(filePath),
    publicPath: buildPublicPath(collection, slug),
    docRootPath,
  };
}

function getFirstExistingFile(dirPath: string, baseName = 'index'): string | null {
  for (const ext of FILE_EXTENSIONS) {
    const filePath = path.join(dirPath, `${baseName}${ext}`);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return filePath;
    }
  }
  return null;
}

function readSingletonCollection(collection: 'profile' | 'resume'): Content | null {
  const rootDir = collection === 'profile' ? PROFILE_ROOT : RESUME_ROOT;
  const filePath = getFirstExistingFile(rootDir);
  if (!filePath) {
    return null;
  }

  return createContentItem(collection, collection, filePath);
}

function sortByPrimaryDateDescending<T extends Content>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    return new Date(getPrimaryDate(right.frontMatter)).getTime() - new Date(getPrimaryDate(left.frontMatter)).getTime();
  });
}

function isPublicContent(item: Content): boolean {
  return !item.frontMatter.draft;
}

function inferWorkDocRootPath(slug: string): string | undefined {
  const docRoot = path.join(WORK_ROOT, slug, 'docs');
  if (!fs.existsSync(docRoot) || !fs.statSync(docRoot).isDirectory()) {
    return undefined;
  }
  return docRoot;
}

function stripIndexSuffix(value: string): string {
  return value.replace(/\/index\.(md|mdx)$/i, '');
}

function inferTitleFromPath(docPath: string[]): string {
  const lastSegment = docPath[docPath.length - 1] ?? '';
  const baseName = lastSegment.replace(/\.[^.]+$/, '');
  return baseName
    .split(/[-_]/)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatSegmentLabel(segment: string): string {
  const baseName = segment.replace(/\.[^.]+$/, '');
  const parts = baseName
    .split(/[-_]/)
    .filter(Boolean)
    .map(part => part.trim());

  const filtered = parts.filter(part => !/^\d+$/.test(part));
  const usableParts = filtered.length > 0 ? filtered : parts;

  return usableParts
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveSafePath(rootPath: string, segments: string[]): string | null {
  const resolvedPath = path.resolve(rootPath, ...segments);
  const expectedRoot = `${rootPath}${path.sep}`;

  if (resolvedPath !== rootPath && !resolvedPath.startsWith(expectedRoot)) {
    return null;
  }

  if (!fs.existsSync(resolvedPath)) {
    return null;
  }

  return resolvedPath;
}

function isSupportedDoc(fileName: string): boolean {
  const extension = path.extname(fileName).toLowerCase();
  return DOC_EXTENSIONS.has(extension);
}

function inlineEmbeddedPlantUml(body: string, currentDir: string): string {
  return body.replace(/!\[[^\]]*]\(([^)]+\.puml)\)/gi, (_match, rawHref) => {
    const decodedHref = rawHref.replace(/%20/g, ' ');
    const resolvedPath = path.resolve(currentDir, decodedHref);
    if (!resolvedPath.startsWith(currentDir) || !fs.existsSync(resolvedPath)) {
      return _match;
    }

    const plantUmlContent = fs.readFileSync(resolvedPath, 'utf8').trim();
    return `\n\`\`\`plantuml\n${plantUmlContent}\n\`\`\`\n`;
  });
}

export function getProfileData(): Content | null {
  return readSingletonCollection('profile');
}

export function getResumeData(): Content | null {
  return readSingletonCollection('resume');
}

export function getWorkData(): Content[] {
  if (!fs.existsSync(WORK_ROOT)) {
    return [];
  }

  const entries = fs.readdirSync(WORK_ROOT, { withFileTypes: true });
  const items: Content[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      continue;
    }

    const slug = entry.name;
    const itemRoot = path.join(WORK_ROOT, slug);
    const filePath = getFirstExistingFile(itemRoot);
    if (!filePath) {
      continue;
    }

    items.push(createContentItem('work', slug, filePath, inferWorkDocRootPath(slug)));
  }

  return sortByPrimaryDateDescending(items.filter(isPublicContent));
}

export function getWorkBySlug(slug: string): Content | null {
  return getWorkData().find(item => item.slug === slug) ?? null;
}

export function getFeaturedWork(limit = 4): Content[] {
  const works = getWorkData();
  return works
    .sort((left, right) => {
      const leftPriority = left.frontMatter.recommendation_priority ?? Number.MAX_SAFE_INTEGER;
      const rightPriority = right.frontMatter.recommendation_priority ?? Number.MAX_SAFE_INTEGER;
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }
      return new Date(getPrimaryDate(right.frontMatter)).getTime() - new Date(getPrimaryDate(left.frontMatter)).getTime();
    })
    .slice(0, limit);
}

export function getWritingData(): Content[] {
  if (!fs.existsSync(WRITING_ROOT)) {
    return [];
  }

  const entries = fs.readdirSync(WRITING_ROOT, { withFileTypes: true });
  const items: Content[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    if (entry.isFile() && FILE_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      const slug = entry.name.replace(/\.(md|mdx)$/i, '');
      const filePath = path.join(WRITING_ROOT, entry.name);
      items.push(createContentItem('writing', slug, filePath));
      continue;
    }

    if (entry.isDirectory()) {
      const filePath = getFirstExistingFile(path.join(WRITING_ROOT, entry.name));
      if (!filePath) {
        continue;
      }
      items.push(createContentItem('writing', entry.name, filePath));
    }
  }

  return sortByPrimaryDateDescending(items.filter(isPublicContent));
}

export function getWritingBySlug(slug: string): Content | null {
  return getWritingData().find(item => item.slug === slug) ?? null;
}

export function getRecentWriting(limit = 3): Content[] {
  return getWritingData().slice(0, limit);
}

export function getHomeData() {
  return {
    profile: getProfileData(),
    resume: getResumeData(),
    featuredWork: getFeaturedWork(),
    recentWriting: getRecentWriting(),
  };
}

export function collectWorkDocPaths(slug: string, segments: string[] = []): string[][] {
  const docRoot = inferWorkDocRootPath(slug);
  if (!docRoot) {
    return [];
  }

  const directoryPath = path.join(docRoot, ...segments);
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  const paths: string[][] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    if (entry.isDirectory()) {
      paths.push(...collectWorkDocPaths(slug, [...segments, entry.name]));
      continue;
    }

    if (entry.isFile() && isSupportedDoc(entry.name)) {
      paths.push([...segments, entry.name]);
    }
  }

  return paths;
}

export function generateWorkDocParams() {
  return getWorkData().flatMap(item =>
    collectWorkDocPaths(item.slug).map(docPath => ({
      slug: item.slug,
      docPath,
    }))
  );
}

export function getWorkDocument(slug: string, docPath: string[]): ContentDocument | null {
  const work = getWorkBySlug(slug);
  if (!work?.docRootPath) {
    return null;
  }

  const filePath = resolveSafePath(work.docRootPath, docPath);
  if (!filePath || !fs.statSync(filePath).isFile() || !isSupportedDoc(filePath)) {
    return null;
  }

  const fileExtension = path.extname(filePath).toLowerCase();
  const fileContents = fs.readFileSync(filePath, 'utf8');

  let frontMatter: Record<string, string> = {};
  let body = fileContents;
  if (fileExtension === '.md' || fileExtension === '.mdx') {
    const parsed = parseDocumentFrontMatter(fileContents);
    frontMatter = parsed.frontMatter;
    body = inlineEmbeddedPlantUml(parsed.body, path.dirname(filePath));
  } else if (fileExtension === '.dbml') {
    body = `\`\`\`dbml\n${fileContents.trim()}\n\`\`\`\n`;
  }

  const contextLabel = docPath.length > 1 ? formatSegmentLabel(docPath[docPath.length - 2] ?? slug) : work.frontMatter.title;
  const title = frontMatter.title || inferTitleFromPath(docPath);
  const contentPath = toPosixPath(path.relative(CONTENT_ROOT, filePath));

  return {
    content: work,
    title,
    body,
    filePath,
    fileExtension,
    contentPath,
    frontMatter,
    docPath,
    contextLabel,
  };
}

export function isRenderablePlantUmlDocument(fileExtension: string, body: string): boolean {
  return isPlantUmlExtension(fileExtension) || containsPlantUml(body);
}

export function getContentDateLabel(content: Content): string {
  return getPrimaryDate(content.frontMatter);
}

export function getContentPublicPath(content: Content): string {
  return content.publicPath;
}

export function getDisplayHeading(content: Content): string {
  return content.frontMatter.title;
}

export function getContentRelativePath(content: Content): string {
  return stripIndexSuffix(content.contentPath);
}
