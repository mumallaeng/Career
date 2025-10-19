import fs from 'fs';
import path from 'path';
import { FrontMatter, Content, ContentType } from '@/types/content';

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

function getContentData(contentType: ContentType): Content[] {
  const contentDir = path.join(process.cwd(), `src/content/${contentType}`);

  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files = fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.md') && !file.startsWith('_'));

  const previewLength = contentType === 'projects' ? 150 : 120;

  const items = files.map(file => {
    const filePath = path.join(contentDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { frontMatter, content } = parseFrontMatter(fileContent);

    const slug = file.replace('.md', '');

    // Create preview from content
    const preview = content
      .replace(/^#.*$/gm, '') // Remove headers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()
      .substring(0, previewLength) + '...';

    return {
      slug,
      frontMatter,
      content,
      preview
    };
  });

  return items.sort((a, b) => new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime());
}

export function getProjectsData(): Content[] {
  return getContentData('projects');
}

export function getActivitiesData(): Content[] {
  return getContentData('activities');
}

export function getProjectBySlug(slug: string): Content | null {
  const projects = getProjectsData();
  return projects.find(project => project.slug === slug) || null;
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

  return {
    slug: 'profile',
    frontMatter,
    content,
    preview
  };
}