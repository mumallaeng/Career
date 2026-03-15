import Link from 'next/link';
import { notFound } from 'next/navigation';
import MDXRenderer from '@/components/MDXRenderer';
import LocalizedDate from '@/components/LocalizedDate';
import LocalizedText from '@/components/LocalizedText';
import { getDetailGroup, getWorkBySlug, getWorkData } from '@/lib/content';

export function generateStaticParams() {
  return getWorkData().map(item => ({ slug: item.slug }));
}

export default async function DetailItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getWorkBySlug(slug);

  if (!item) {
    notFound();
  }

  const backHref = getDetailGroup(item) === 'work' ? '/detail/work' : '/detail/affiliation';

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="back-nav">
          <Link href={backHref} className="back-link">
            <LocalizedText en="← Back to Detail" ko="← Detail 목록으로" />
          </Link>
        </nav>

        <article>
          <header className="post-header">
            <div className="post-meta-container">
              <span className="activity-category">
                <LocalizedText
                  en={item.frontMatter.work_type === 'case-study' ? 'Case Study' : 'Project'}
                  ko={item.frontMatter.work_type === 'case-study' ? '사례' : '프로젝트'}
                />
              </span>
              <LocalizedDate
                className="post-date"
                startDate={item.frontMatter.startDate}
                endDate={item.frontMatter.endDate}
              />
              {item.frontMatter.featured && (
                <span className="featured-badge">
                  <LocalizedText en="Featured" ko="추천" />
                </span>
              )}
            </div>

            <h1 className="post-title">
              <LocalizedText en={item.frontMatter.title_en ?? item.frontMatter.title} ko={item.frontMatter.title} />
            </h1>

            <p className="post-excerpt">
              <LocalizedText en={item.frontMatter.description_en ?? item.frontMatter.description} ko={item.frontMatter.description} />
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
