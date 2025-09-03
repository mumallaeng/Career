import fs from 'fs';
import path from 'path';

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
}

export interface Content {
  slug: string;
  frontMatter: FrontMatter;
  content: string;
  locale: string;
}

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

export function getProjectsData(locale: 'ko' | 'en' = 'ko'): Content[] {
  const projectsDir = path.join(process.cwd(), 'content/projects');
  
  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  const files = fs.readdirSync(projectsDir)
    .filter(file => file.endsWith(`.${locale}.md`) && !file.startsWith('_'));

  const projects = files.map(file => {
    const filePath = path.join(projectsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { frontMatter, content } = parseFrontMatter(fileContent);
    
    const slug = file.replace(`.${locale}.md`, '');
    
    return {
      slug,
      frontMatter,
      content,
      locale
    };
  });

  return projects.sort((a, b) => new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime());
}

export function getActivitiesData(locale: 'ko' | 'en' = 'ko'): Content[] {
  const activitiesDir = path.join(process.cwd(), 'content/activities');
  
  if (!fs.existsSync(activitiesDir)) {
    return [];
  }

  const files = fs.readdirSync(activitiesDir)
    .filter(file => file.endsWith(`.${locale}.md`) && !file.startsWith('_'));

  const activities = files.map(file => {
    const filePath = path.join(activitiesDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { frontMatter, content } = parseFrontMatter(fileContent);
    
    const slug = file.replace(`.${locale}.md`, '');
    
    return {
      slug,
      frontMatter,
      content,
      locale
    };
  });

  return activities.sort((a, b) => new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime());
}

export function getProjectBySlug(slug: string, locale: 'ko' | 'en' = 'ko'): Content | null {
  const projects = getProjectsData(locale);
  return projects.find(project => project.slug === slug) || null;
}

export function getActivityBySlug(slug: string, locale: 'ko' | 'en' = 'ko'): Content | null {
  const activities = getActivitiesData(locale);
  return activities.find(activity => activity.slug === slug) || null;
}

export function getProfileData(locale: 'ko' | 'en' = 'ko'): Content | null {
  const profilePath = path.join(process.cwd(), `content/profile.${locale}.md`);
  
  if (!fs.existsSync(profilePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(profilePath, 'utf8');
  const { frontMatter, content } = parseFrontMatter(fileContent);
  
  return {
    slug: 'profile',
    frontMatter,
    content,
    locale
  };
}