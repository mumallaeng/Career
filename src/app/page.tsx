import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import ContentGrid from '@/components/ContentGrid';
import { getHomeData } from '@/lib/content';

export default function HomePage() {
  const { profile, resume, featuredWork, recentWriting } = getHomeData();

  return (
    <div className="activities-container">
      <section className="career-hero">
        <p className="career-eyebrow">Career publication</p>
        <h1 className="career-title">
          {profile?.frontMatter.title ?? 'Career'}
        </h1>
        <p className="career-summary">
          {profile?.frontMatter.summary ?? profile?.frontMatter.description ?? 'Public profile, resume, work, and writing.'}
        </p>
        <div className="career-actions">
          <Link href="/resume" className="career-primary-link">
            Resume 보기
          </Link>
          <Link href="/work" className="career-secondary-link">
            Work 둘러보기
          </Link>
        </div>
      </section>

      <section className="career-section">
        <div className="career-section-header">
          <div>
            <p className="career-section-label">Featured work</p>
            <h2 className="career-section-title">대표 작업과 사례</h2>
          </div>
          <Link href="/work" className="career-section-link">
            전체 Work →
          </Link>
        </div>
        <ContentGrid items={featuredWork} />
      </section>

      <section className="career-section">
        <div className="career-section-header">
          <div>
            <p className="career-section-label">Writing</p>
            <h2 className="career-section-title">공개 가능한 커리어 서술</h2>
          </div>
          <Link href="/writing" className="career-section-link">
            전체 Writing →
          </Link>
        </div>

        <div className="writing-list">
          {recentWriting.map(item => (
            <article key={item.slug} className="writing-list-item">
              <p className="writing-list-date">
                {item.frontMatter.updatedAt ?? item.frontMatter.publicationDate ?? item.frontMatter.date}
              </p>
              <h3 className="writing-list-title">
                <Link href={item.publicPath}>
                  {item.frontMatter.title}
                </Link>
              </h3>
              <p className="writing-list-description">
                {item.frontMatter.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {resume && (
        <section className="career-section">
          <div className="career-callout">
            <div>
              <p className="career-section-label">Resume</p>
              <h2 className="career-section-title">요약 이력은 별도 페이지로 유지합니다.</h2>
              <p className="career-summary compact">
                {resume.frontMatter.description}
              </p>
            </div>
            <Link href="/resume" className="career-primary-link">
              Resume 열기
            </Link>
          </div>
        </section>
      )}

      <Analytics />
    </div>
  );
}
