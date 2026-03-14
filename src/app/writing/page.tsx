import Link from 'next/link';
import { getWritingData } from '@/lib/content';

export default function WritingPage() {
  const items = getWritingData();

  return (
    <div className="activities-container">
      <header className="career-section-header page-header">
        <div>
          <p className="career-section-label">Writing</p>
          <h1 className="career-section-title">커리어 관련 공개 글</h1>
        </div>
        <p className="career-summary compact">
          자기소개 초안과 evidence 전체를 공개하지 않고, 공개 가능한 결과물만 별도 글로 정리합니다.
        </p>
      </header>

      <div className="writing-list">
        {items.map(item => (
          <article key={item.slug} className="writing-list-item">
            <p className="writing-list-date">
              {item.frontMatter.updatedAt ?? item.frontMatter.publicationDate ?? item.frontMatter.date}
            </p>
            <h2 className="writing-list-title">
              <Link href={item.publicPath}>
                {item.frontMatter.title}
              </Link>
            </h2>
            <p className="writing-list-description">
              {item.frontMatter.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
