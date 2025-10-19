import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getActivitiesData, getActivityBySlug } from '@/lib/content';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export async function generateStaticParams() {
  const activities = getActivitiesData();
  return activities.map((activity) => ({ slug: activity.slug }));
}

export default async function ActivityDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  const activity = getActivityBySlug(slug);

  if (!activity) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="back-nav">
          <Link
            href="/activities"
            className="back-link"
          >
            ← 활동 목록으로
          </Link>
        </nav>

        <article>
          <header className="post-header">
            <div className="post-meta-container">
              <span className="activity-category">
                {activity.frontMatter.categories?.[0] || '활동'}
              </span>
              <time className="post-date">
                {new Date(activity.frontMatter.date).getFullYear()}
              </time>
              {activity.frontMatter.featured && (
                <span className="featured-badge">
                  Featured
                </span>
              )}
            </div>

            <h1 className="post-title">
              {activity.frontMatter.title}
            </h1>

            <p className="post-excerpt">
              {activity.frontMatter.description}
            </p>

            {activity.frontMatter.tags && (
              <div className="tag-container">
                {activity.frontMatter.tags.map((tag) => (
                  <span key={tag} className="tag-item">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="post-body">
            <MarkdownRenderer content={activity.content} />
          </div>
        </article>
      </div>
    </div>
  );
}
