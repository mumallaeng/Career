import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getActivitiesData, getActivityBySlug } from '@/lib/content';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export async function generateStaticParams() {
  const koActivities = getActivitiesData('ko');
  const enActivities = getActivitiesData('en');
  
  return [
    ...koActivities.map((activity) => ({ locale: 'ko', slug: activity.slug })),
    ...enActivities.map((activity) => ({ locale: 'en', slug: activity.slug })),
  ];
}

export default async function ActivityDetailPage({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string }> 
}) {
  const { locale, slug } = await params;
  
  const activity = getActivityBySlug(slug, locale as 'ko' | 'en');
  
  if (!activity) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="back-nav">
          <Link 
            href={`/${locale}/activities`}
            className="back-link"
          >
            ← {locale === 'ko' ? '활동 목록으로' : 'Back to Activities'}
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