import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getActivitiesData, getActivityBySlug } from '@/lib/content';
import MDXRenderer from '@/components/MDXRenderer';
import CertificateGrid from '@/components/CertificateGrid';
import ScrollToTop from '@/components/ScrollToTop';
import { formatActivityDate } from '@/lib/utils/date';

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

  const tagSections = [
    { label: '사용 기술', tags: activity.frontMatter.tech_stack },
    { label: '스킬', tags: activity.frontMatter.skill_tags },
    { label: '분야', tags: activity.frontMatter.domain_tags },
  ].filter((section): section is { label: string; tags: string[] } =>
    Array.isArray(section.tags) && section.tags.length > 0
  );
  const { startDate, endDate, date, content_type: contentType } = activity.frontMatter;
  const activityDate = (startDate || endDate)
    ? formatActivityDate(startDate, endDate)
    : formatActivityDate(date);
  const isProject = contentType === 'project';
  const collectionHref = isProject ? '/activities/projects' : '/activities/experience';
  const collectionLabel = isProject ? '프로젝트 목록으로' : '경험과 활동 목록으로';

  return (
    <main className="activity-detail-page">
      <ScrollToTop routeKey={slug} />
      <div className="activity-detail-container">
        <nav className="activity-detail-back">
          <Link
            href={collectionHref}
            className="activity-detail-back-link"
          >
            ← {collectionLabel}
          </Link>
        </nav>

        <article className="activity-detail-article">
          <header className="post-header activity-detail-header">
            <div className="post-meta-container">
              <span className="activity-category">
                {activity.frontMatter.categories?.[0] || '활동'}
              </span>
              <time className="post-date">{activityDate}</time>
              {activity.frontMatter.featured && (
                <span className="featured-badge">
                  대표
                </span>
              )}
            </div>

            <h1 className="post-title">
              {activity.frontMatter.title}
            </h1>

            <p className="post-excerpt">
              {activity.frontMatter.description}
            </p>

            {tagSections.length > 0 && (
              <div className="tag-section-list">
                {tagSections.map((section) => (
                  <div key={section.label} className="tag-section">
                    <span className="tag-section-label">{section.label}</span>
                    <div className="tag-container">
                      {section.tags.map((tag) => (
                        <span key={tag} className="tag-item">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </header>

          <div className="post-body">
            <MDXRenderer content={activity.content} />
            {slug === 'certificate' && (
              <>
                <h2 className="text-2xl font-semibold mb-5 mt-10 text-gray-900 dark:text-gray-100 leading-tight">자격증 목록</h2>
                <CertificateGrid />
              </>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
