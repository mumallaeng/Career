import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import ContentGrid from '@/components/ContentGrid';
import { getHomeData } from '@/lib/content';

function stripInlineMarkdown(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>#]/g, '')
    .trim();
}

function extractLeadParagraphs(content: string, count = 2): string[] {
  return content
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph && !/^(#{1,6}\s|[-*]\s|```|\|)/.test(paragraph))
    .map(stripInlineMarkdown)
    .filter(Boolean)
    .slice(0, count);
}

export default function HomePage() {
  const { profile, featuredWork, recentWriting } = getHomeData();
  const profileParagraphs = profile ? extractLeadParagraphs(profile.content, 3) : [];

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
            <p className="career-section-label">Career</p>
            <h2 className="career-section-title">어떤 방식으로 일하는지</h2>
          </div>
        </div>

        {profile && (
          <div className="career-inline-panel">
            <div className="career-inline-copy">
              {profileParagraphs.map(paragraph => (
                <p key={paragraph} className="career-inline-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
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
        <ContentGrid items={featuredWork} variant="featured-grid" />
      </section>

      <section className="career-section">
        <div className="career-section-header">
          <div>
            <p className="career-section-label">Career note</p>
            <h2 className="career-section-title">공개 가능한 커리어 서술</h2>
          </div>
        </div>

        <div className="writing-list inline-notes">
          {recentWriting.map(item => (
            <article key={item.slug} className="writing-list-item">
              <p className="writing-list-date">
                {item.frontMatter.updatedAt ?? item.frontMatter.publicationDate ?? item.frontMatter.date}
              </p>
              <h3 className="writing-list-title">{item.frontMatter.title}</h3>
              <p className="writing-list-description">
                {item.frontMatter.description}
              </p>
              <div className="career-inline-copy compact">
                {extractLeadParagraphs(item.content, 3).map(paragraph => (
                  <p key={`${item.slug}-${paragraph}`} className="career-inline-paragraph compact">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <Analytics />
    </div>
  );
}
