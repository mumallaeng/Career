'use client';

import Link from 'next/link';
import type { ProjectSummary } from '@/lib/portfolio';

interface ProjectDetailOverlayProps {
  project: ProjectSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetailOverlay({ project, isOpen, onClose }: ProjectDetailOverlayProps) {
  if (!project) {
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
        aria-modal="true"
        aria-label={project.title}
      >
        <div className="portfolio-detail-header">
          <span className="portfolio-detail-eyebrow">Project</span>
          <button
            type="button"
            className="portfolio-detail-close"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="portfolio-detail-body">
          {project.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.thumbnailUrl} alt="" className="portfolio-detail-thumbnail" />
          )}

          <h2 className="portfolio-detail-title">{project.title}</h2>
          <div className="portfolio-detail-meta">
            {project.type && <span>{project.type}</span>}
            {project.role && <span>{project.role}</span>}
            {project.dateRange && <span>{project.dateRange}</span>}
          </div>

          <p className="portfolio-detail-description">{project.description}</p>

          <ul className="portfolio-detail-highlights">
            {project.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>

          <div className="portfolio-detail-tags">
            {project.tags.map((tag) => (
              <span key={tag} className="portfolio-project-tag">
                {tag}
              </span>
            ))}
          </div>

          <Link href={project.href} className="portfolio-button portfolio-button--primary">
            Read full case study →
          </Link>
        </div>
      </div>
    </>
  );
}
