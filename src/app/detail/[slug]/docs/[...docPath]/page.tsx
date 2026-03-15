import Link from 'next/link';
import { notFound } from 'next/navigation';
import MDXRenderer from '@/components/MDXRenderer';
import PlantUmlDiagram from '@/components/PlantUmlDiagram';
import {
  generateWorkDocParams,
  getWorkDocument,
  isRenderablePlantUmlDocument,
} from '@/lib/content';

export function generateStaticParams() {
  return generateWorkDocParams();
}

export default async function DetailDocPage({
  params,
}: {
  params: Promise<{ slug: string; docPath: string[] }>;
}) {
  const { slug, docPath } = await params;
  const document = getWorkDocument(slug, docPath);

  if (!document) {
    notFound();
  }

  const isPlantUml = isRenderablePlantUmlDocument(document.fileExtension, document.body);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="back-nav mb-6">
          <Link href={`/detail/${slug}`} className="back-link">
            ← {document.content.frontMatter.title}
          </Link>
        </nav>

        <article>
          <header className="post-header">
            <h1 className="post-title">
              {document.title}
            </h1>
            <p className="doc-label">
              {document.contextLabel}
            </p>
          </header>

          <div className={`post-body doc-context-${document.contextLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
            {isPlantUml ? (
              <PlantUmlDiagram
                content={document.body}
                alt={document.title}
              />
            ) : (
              <MDXRenderer content={document.body} contentPath={document.contentPath} />
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
