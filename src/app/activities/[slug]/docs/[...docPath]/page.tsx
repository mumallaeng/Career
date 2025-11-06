import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import MDXRenderer from '@/components/MDXRenderer';

const ACTIVITIES_ROOT = path.join(process.cwd(), 'src/content/activities');

function isSupportedDoc(fileName: string): boolean {
  const extension = path.extname(fileName).toLowerCase();
  return extension === '.md' || extension === '.mdx';
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
  const fileName = path.basename(filePath);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="back-nav mb-6">
          <Link href={`/activities/${slug}`} className="back-link">
            ← {slug} 상세로 돌아가기
          </Link>
        </nav>

        <article>
          <header className="post-header">
            <h1 className="post-title">
              {fileName}
            </h1>
          </header>

          <div className="post-body">
            {fileExtension === '.mdx' ? (
              <MDXRenderer content={fileContents} />
            ) : (
              <MarkdownRenderer content={fileContents} />
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
