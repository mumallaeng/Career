import Link from 'next/link';
import { getActivitiesData } from '@/lib/content';

export default async function ActivitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const activities = getActivitiesData(locale as 'ko' | 'en');

  return (
    <div className="activities-container">
      {/* Section Header */}
      <header className="section-header">
        <h1 className="section-title">
          {locale === 'ko' ? '활동' : 'Activities'}
        </h1>
        <div className="section-description">
          {locale === 'ko' ? '다양한 활동과 수상 경력을 소개합니다.' : 'Various activities and achievements I\'ve participated in.'}
        </div>
      </header>

      {/* Activities Grid */}
      <div className="activities-grid">
        {activities.map((activity, index) => {
          if (index === 0) {
            // First activity: full width featured
            return (
              <article key={activity.slug} className="activity-card featured">
                <Link href={`/${locale}/activities/${activity.slug}`} className="activity-link">
                  <div className="activity-content">
                    <h3 className="activity-title">
                      {activity.frontMatter.title}
                    </h3>
                    <div className="activity-meta">
                      <time className="activity-date">
                        {new Date(activity.frontMatter.date).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit',
                          day: '2-digit' 
                        })}
                      </time>
                      {activity.frontMatter.categories && (
                        <span className="activity-category">
                          {activity.frontMatter.categories[0]}
                        </span>
                      )}
                      <div className="activity-tags">
                        {activity.frontMatter.tags?.map((tag) => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="activity-description">
                      {activity.frontMatter.description}
                    </div>
                    <span className="read-more">
                      {locale === 'ko' ? '자세히 보기' : 'Read More'}
                    </span>
                  </div>
                </Link>
              </article>
            );
          } else if ((index - 1) % 3 === 0) {
            // Start new row of three (2nd, 5th, 8th...)
            return (
              <article key={activity.slug} className="activity-card third left">
                <Link href={`/${locale}/activities/${activity.slug}`} className="activity-link">
                  <div className="activity-content">
                    <h3 className="activity-title">
                      {activity.frontMatter.title}
                    </h3>
                    <div className="activity-meta">
                      <time className="activity-date">
                        {new Date(activity.frontMatter.date).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit',
                          day: '2-digit' 
                        })}
                      </time>
                      {activity.frontMatter.categories && (
                        <span className="activity-category">
                          {activity.frontMatter.categories[0]}
                        </span>
                      )}
                      <div className="activity-tags">
                        {activity.frontMatter.tags?.map((tag) => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="activity-description">
                      {activity.frontMatter.description}
                    </div>
                    <span className="read-more">
                      {locale === 'ko' ? '자세히 보기' : 'Read More'}
                    </span>
                  </div>
                </Link>
              </article>
            );
          } else if ((index - 1) % 3 === 1) {
            // Middle of three (3rd, 6th, 9th...)
            return (
              <article key={activity.slug} className="activity-card third center">
                <Link href={`/${locale}/activities/${activity.slug}`} className="activity-link">
                  <div className="activity-content">
                    <h3 className="activity-title">
                      {activity.frontMatter.title}
                    </h3>
                    <div className="activity-meta">
                      <time className="activity-date">
                        {new Date(activity.frontMatter.date).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit',
                          day: '2-digit' 
                        })}
                      </time>
                      {activity.frontMatter.categories && (
                        <span className="activity-category">
                          {activity.frontMatter.categories[0]}
                        </span>
                      )}
                      <div className="activity-tags">
                        {activity.frontMatter.tags?.map((tag) => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="activity-description">
                      {activity.frontMatter.description}
                    </div>
                    <span className="read-more">
                      {locale === 'ko' ? '자세히 보기' : 'Read More'}
                    </span>
                  </div>
                </Link>
              </article>
            );
          } else {
            // End of three (4th, 7th, 10th...)
            return (
              <article key={activity.slug} className="activity-card third right">
                <Link href={`/${locale}/activities/${activity.slug}`} className="activity-link">
                  <div className="activity-content">
                    <h3 className="activity-title">
                      {activity.frontMatter.title}
                    </h3>
                    <div className="activity-meta">
                      <time className="activity-date">
                        {new Date(activity.frontMatter.date).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit',
                          day: '2-digit' 
                        })}
                      </time>
                      {activity.frontMatter.categories && (
                        <span className="activity-category">
                          {activity.frontMatter.categories[0]}
                        </span>
                      )}
                      <div className="activity-tags">
                        {activity.frontMatter.tags?.map((tag) => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="activity-description">
                      {activity.frontMatter.description}
                    </div>
                    <span className="read-more">
                      {locale === 'ko' ? '자세히 보기' : 'Read More'}
                    </span>
                  </div>
                </Link>
              </article>
            );
          }
        })}
      </div>
    </div>
  );
}