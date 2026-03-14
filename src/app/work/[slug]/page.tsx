import Link from 'next/link';
import { notFound } from 'next/navigation';
import MDXRenderer from '@/components/MDXRenderer';
import { getWorkBySlug, getWorkData } from '@/lib/content';

export function generateStaticParams() {
  return getWorkData().map(item => ({ slug: item.slug }));
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getWorkBySlug(slug);

  if (!item) {
    notFound();
  }

  const primaryYear = (() => {
    const rawDate =
      item.frontMatter.updatedAt ||
      item.frontMatter.publicationDate ||
      item.frontMatter.endDate ||
      item.frontMatter.startDate ||
      item.frontMatter.date;

    return rawDate ? new Date(rawDate).getFullYear() : '';
  })();

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="back-nav">
          <Link href="/work" className="back-link">
            ← Work 목록으로
          </Link>
        </nav>

        <article>
          <header className="post-header">
            <div className="post-meta-container">
              <span className="activity-category">
                {item.frontMatter.work_type === 'case-study' ? 'Case Study' : 'Project'}
              </span>
              <time className="post-date">
                {primaryYear}
              </time>
              {item.frontMatter.featured && (
                <span className="featured-badge">
                  Featured
                </span>
              )}
            </div>

            <h1 className="post-title">
              {item.frontMatter.title}
            </h1>

            <p className="post-excerpt">
              {item.frontMatter.description}
            </p>

            {item.frontMatter.tags.length > 0 && (
              <div className="tag-container">
                {item.frontMatter.tags.map(tag => (
                  <span key={tag} className="tag-item">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="post-body">
            <MDXRenderer content={item.content} contentPath={item.contentPath} />
          </div>
        </article>
      </div>
    </div>
  );
}
