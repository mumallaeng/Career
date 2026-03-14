import Link from 'next/link';
import { notFound } from 'next/navigation';
import MDXRenderer from '@/components/MDXRenderer';
import { getWritingBySlug, getWritingData } from '@/lib/content';

export function generateStaticParams() {
  return getWritingData().map(item => ({ slug: item.slug }));
}

export default async function WritingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getWritingBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="back-nav">
          <Link href="/writing" className="back-link">
            ← Writing 목록으로
          </Link>
        </nav>

        <article>
          <header className="post-header">
            <div className="post-meta-container">
              <span className="activity-category">
                Writing
              </span>
              <time className="post-date">
                {item.frontMatter.updatedAt ?? item.frontMatter.publicationDate ?? item.frontMatter.date}
              </time>
            </div>

            <h1 className="post-title">
              {item.frontMatter.title}
            </h1>

            <p className="post-excerpt">
              {item.frontMatter.description}
            </p>
          </header>

          <div className="post-body">
            <MDXRenderer content={item.content} contentPath={item.contentPath} />
          </div>
        </article>
      </div>
    </div>
  );
}
