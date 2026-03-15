import Link from 'next/link';
import ContentGrid from '@/components/ContentGrid';
import WorkFilter from '@/components/WorkFilter';
import { getDetailData, getFeaturedWork, toContentCardData } from '@/lib/content';

export default function PortfolioPage() {
  const featuredItems = getFeaturedWork(4).map(toContentCardData);
  const portfolioItems = getDetailData('work').map(toContentCardData);

  return (
    <div className="activities-container">
      <header className="career-section-header page-header">
        <div>
          <p className="career-section-label">Portfolio</p>
          <h1 className="career-section-title">Selected projects and case studies</h1>
        </div>
        <p className="career-summary compact">
          A curated view of representative builds, technical case studies, and delivery outcomes.
        </p>
      </header>

      <section className="career-callout">
        <div>
          <p className="career-note-label">Overview</p>
          <p className="career-inline-paragraph compact">
            This page highlights work worth opening first. Broader timelines, affiliations, and supporting records stay in Detail.
          </p>
        </div>
        <div className="career-actions">
          <Link href="/detail/work" className="career-secondary-link">
            Open Detail / Work
          </Link>
          <Link href="/certificate" className="career-secondary-link">
            View Certificate
          </Link>
        </div>
      </section>

      <section className="career-section">
        <div className="career-section-header">
          <div>
            <p className="career-section-label">Highlights</p>
            <h2 className="career-section-title">Representative work</h2>
          </div>
        </div>
        <ContentGrid items={featuredItems} variant="featured-grid" />
      </section>

      <section className="career-section">
        <div className="career-section-header">
          <div>
            <p className="career-section-label">Browse</p>
            <h2 className="career-section-title">Project and case study archive</h2>
          </div>
        </div>
        <WorkFilter items={portfolioItems} />
      </section>
    </div>
  );
}
