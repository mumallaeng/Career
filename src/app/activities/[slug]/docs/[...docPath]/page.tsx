import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MDXRenderer from '@/components/MDXRenderer';
import PlantUmlDiagram from '@/components/PlantUmlDiagram';
import { containsPlantUml, isPlantUmlExtension } from '@/lib/plantuml';

const ACTIVITIES_ROOT = path.join(process.cwd(), 'src/content/activities');

function isSupportedDoc(fileName: string): boolean {
  const extension = path.extname(fileName).toLowerCase();
  return extension === '.md' || extension === '.mdx' || isPlantUmlExtension(extension);
}

function collectDocPaths(slug: string, segments: string[] = []): string[][] {
  const directoryPath = path.join(ACTIVITIES_ROOT, slug, ...segments);

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
      paths.push(...collectDocPaths(slug, [...segments, entry.name]));
      continue;
    }

    if (entry.isFile() && isSupportedDoc(entry.name)) {
      paths.push([...segments, entry.name]);
    }
  }

  return paths;
}

function resolveDocPath(slug: string, docPath: string[]): string | null {
  const slugRoot = path.join(ACTIVITIES_ROOT, slug);
  const resolvedPath = path.resolve(slugRoot, ...docPath);
  const expectedRoot = `${slugRoot}${path.sep}`;

  if (!resolvedPath.startsWith(expectedRoot)) {
    return null;
  }

  if (!fs.existsSync(resolvedPath)) {
    return null;
  }

  if (!fs.statSync(resolvedPath).isFile()) {
    return null;
  }

  if (!isSupportedDoc(path.basename(resolvedPath))) {
    return null;
  }

  return resolvedPath;
}

function parseFrontMatter(fileContent: string): {
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

  const frontMatterContent = match[1];
  const frontMatterLines = frontMatterContent.split('\n');
  const frontMatter: Record<string, string> = {};

  for (const line of frontMatterLines) {
    if (!line.trim() || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    frontMatter[key] = value;
  }

  const body = fileContent.slice(match[0].length).trimStart();

  return { frontMatter, body };
}

function inferTitleFromPath(docPath: string[]): string {
  const lastSegment = docPath[docPath.length - 1] ?? '';
  const baseName = lastSegment.replace(/\.[^.]+$/, '');
  return baseName
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function getActivityTitle(slug: string): string | null {
  const possibleExtensions = ['.mdx', '.md'];

  for (const ext of possibleExtensions) {
    const candidatePath = path.join(ACTIVITIES_ROOT, `${slug}${ext}`);

    if (!fs.existsSync(candidatePath) || !fs.statSync(candidatePath).isFile()) {
      continue;
    }

    const fileContent = fs.readFileSync(candidatePath, 'utf8');
    const { frontMatter } = parseFrontMatter(fileContent);

    if (frontMatter.title) {
      return frontMatter.title;
    }
  }

  return null;
}

function formatSegmentLabel(segment: string): string {
  const baseName = segment.replace(/\.[^.]+$/, '');
  const parts = baseName
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.trim());

  const filtered = parts.filter((part) => !/^\d+$/.test(part));
  const usableParts = filtered.length > 0 ? filtered : parts;

  return usableParts
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function isPlantUmlDocument(extension: string, body: string): boolean {
  return isPlantUmlExtension(extension) || containsPlantUml(body);
}

function createContextClass(label: string): string {
  const normalised = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalised ? `doc-context-${normalised}` : 'doc-context-general';
}

export function generateStaticParams() {
  if (!fs.existsSync(ACTIVITIES_ROOT)) {
    return [];
  }

  const entries = fs.readdirSync(ACTIVITIES_ROOT, { withFileTypes: true });
  const params: { slug: string; docPath: string[] }[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const slug = entry.name;
    const docPaths = collectDocPaths(slug);

    for (const docPath of docPaths) {
      params.push({ slug, docPath });
    }
  }

  return params;
}

export default async function ActivityDocPage({
  params
}: {
  params: Promise<{ slug: string; docPath: string[] }>;
}) {
  const { slug, docPath } = await params;
  const filePath = resolveDocPath(slug, docPath);

  if (!filePath) {
    notFound();
  }

  const fileExtension = path.extname(filePath).toLowerCase();
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { frontMatter, body } = parseFrontMatter(fileContents);
  const title = frontMatter.title || inferTitleFromPath(docPath);
  const parentSegment = docPath.length > 1 ? docPath[docPath.length - 2] : (docPath[0] ?? slug);
  const docLabel = formatSegmentLabel(parentSegment);
  const projectLabel = getActivityTitle(slug) || inferTitleFromPath([slug]);
  const contextClass = createContextClass(docLabel);
  const isPlantUml = isPlantUmlDocument(fileExtension, body);

  return (
    <main className="activity-detail-page activity-doc-page">
      <div className="activity-detail-container">
        <nav className="activity-detail-back">
          <Link href={`/activities/${slug}`} className="activity-detail-back-link">
            ← {projectLabel}
          </Link>
        </nav>

        <article className="activity-detail-article">
          <header className="post-header activity-detail-header">
            <h1 className="post-title">
              {title}
            </h1>
            <p className="doc-label">
              {docLabel}
            </p>
          </header>

          <div className={`post-body ${contextClass}`}>
            {isPlantUml ? (
              <PlantUmlDiagram
                content={body}
                alt={title || docLabel || 'PlantUML diagram'}
              />
            ) : (
              <MDXRenderer content={body} />
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
