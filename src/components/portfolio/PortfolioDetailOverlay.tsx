'use client';

import Link from 'next/link';

export interface PortfolioDetail {
  eyebrow: string;
  title: string;
  href: string;
  actionLabel: string;
  description: string;
  meta: string[];
  tags?: string[];
  thumbnailUrl?: string;
  highlights?: string[];
}

interface PortfolioDetailOverlayProps {
  detail: PortfolioDetail | null;
  isOpen: boolean;
  isWideView: boolean;
  closeLabel: string;
  onClose: () => void;
}

export default function PortfolioDetailOverlay({
  detail,
  isOpen,
  isWideView,
  closeLabel,
  onClose,
}: PortfolioDetailOverlayProps) {
  if (!detail) {
    return null;
  }

  return (
    <>
      <div
        className={`portfolio-detail-backdrop${isOpen ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`portfolio-detail-panel${isOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal={!isWideView}
        aria-label={detail.title}
      >
        <div className="portfolio-detail-header">
          <span className="portfolio-detail-eyebrow">{detail.eyebrow}</span>
          <button
            type="button"
            className="portfolio-detail-close"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="portfolio-detail-body">
          {detail.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={detail.thumbnailUrl} alt="" className="portfolio-detail-thumbnail" />
          )}

          <h2 className="portfolio-detail-title">{detail.title}</h2>
          <div className="portfolio-detail-meta">
            {detail.meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <p className="portfolio-detail-description">{detail.description}</p>

          {detail.highlights && detail.highlights.length > 0 && (
            <ul className="portfolio-detail-highlights">
              {detail.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          )}

          {detail.tags && detail.tags.length > 0 && (
            <div className="portfolio-detail-tags">
              {detail.tags.map((tag) => (
                <span key={tag} className="portfolio-project-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <Link href={detail.href} className="portfolio-button portfolio-button--primary">
            {detail.actionLabel}
          </Link>
        </div>
      </div>
    </>
  );
}
