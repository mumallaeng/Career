import fs from 'fs';
import path from 'path';
import { FrontMatter, Content } from '@/types/content';

function parseFrontMatter(fileContent: string): { frontMatter: FrontMatter; content: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = fileContent.match(frontMatterRegex);

  if (!match) {
    throw new Error('Invalid front matter format');
  }

  const frontMatterText = match[1];
  const content = match[2].trim();

  const frontMatter: Record<string, unknown> = {};

  frontMatterText.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value: string | string[] | boolean = valueParts.join(':').trim();

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map((v: string) => v.trim().replace(/"/g, ''));
      }

      // Parse booleans
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      frontMatter[key.trim()] = value;
    }
  });

  return { frontMatter: frontMatter as unknown as FrontMatter, content };
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

function extractFirstImage(content: string): string | undefined {
  // Try to find ImgTag component with driveUrl
  const customImgMatch = content.match(/<ImgTag[^>]*driveUrl=["']([^"']+)["'][^>]*\/?>/i);
  if (customImgMatch) {
    const transformed = transformDriveUrl(customImgMatch[1]);
    if (transformed) {
      return transformed;
    }
  }

  // Try to find HTML img tag first
  const htmlImgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (htmlImgMatch) {
    return htmlImgMatch[1];
  }

  // Try to find Markdown image syntax ![alt](url)
  const mdImgMatch = content.match(/!\[.*?\]\(([^)]+)\)/);
  if (mdImgMatch) {
    return mdImgMatch[1];
  }

  return undefined;
}

export function getActivitiesData(): Content[] {
  const contentDir = path.join(process.cwd(), 'src/content/activities');

  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files = fs.readdirSync(contentDir)
    .filter(file => (file.endsWith('.md') || file.endsWith('.mdx')) && !file.startsWith('_'));

  const previewLength = 120;

  const items = files.map(file => {
    const filePath = path.join(contentDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { frontMatter, content } = parseFrontMatter(fileContent);

    const slug = file.replace(/\.(md|mdx)$/, '');

    // Create preview from content
    const preview = content
      .replace(/^#.*$/gm, '') // Remove headers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()
      .substring(0, previewLength) + '...';

    // Extract thumbnail: use frontMatter.thumbnail if available, otherwise extract from content
    const thumbnailUrl = frontMatter.thumbnail || extractFirstImage(content);

    return {
      slug,
      frontMatter,
      content,
      preview,
      thumbnailUrl
    };
  });

  return items.sort((a, b) => {
    const dateA = a.frontMatter.endDate || a.frontMatter.date;
    const dateB = b.frontMatter.endDate || b.frontMatter.date;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

export function getActivityBySlug(slug: string): Content | null {
  const activities = getActivitiesData();
  return activities.find(activity => activity.slug === slug) || null;
}

export function getProfileData(): Content | null {
  const profilePath = path.join(process.cwd(), 'src/content/profile.md');

  if (!fs.existsSync(profilePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(profilePath, 'utf8');
  const { frontMatter, content } = parseFrontMatter(fileContent);

  // Create preview from content (first paragraph or first 150 characters)
  const preview = content
    .replace(/^#.*$/gm, '') // Remove headers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()
    .substring(0, 150) + '...';

  const thumbnailUrl = frontMatter.thumbnail || extractFirstImage(content);

  return {
    slug: 'profile',
    frontMatter,
    content,
    preview,
    thumbnailUrl
  };
}
