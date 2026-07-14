'use client';

import Link from 'next/link';
import type { ProjectSummary } from '@/lib/portfolio';
import { homeCopy, type Locale } from '@/lib/i18n';

interface ProjectsProps {
  projects: ProjectSummary[];
  onSelect: (slug: string) => boolean;
  locale: Locale;
}

export default function Projects({ projects, onSelect, locale }: ProjectsProps) {
  const copy = homeCopy[locale].projects;

  return (
    <section id="projects" className="portfolio-section" aria-label={copy.title}>
      <div className="portfolio-container">
        <div className="portfolio-section-header portfolio-section-header--action-only">
          <Link href="/activities/projects" className="portfolio-section-more">
            {copy.more}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="portfolio-projects-grid">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={project.href}
              className="portfolio-project-card"
              onClick={(event) => {
                if (
                  event.defaultPrevented ||
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                ) {
                  return;
                }
                const handled = onSelect(project.slug);
                if (handled) {
                  event.preventDefault();
                }
              }}
            >
              {project.thumbnailUrl && (
                <div className="portfolio-project-thumbnail">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.thumbnailUrl} alt="" loading="lazy" />
                </div>
              )}
              <div className="portfolio-project-body">
                <div className="portfolio-project-meta">
                  {project.type && <span>{project.type}</span>}
                  {project.dateRange && <span>· {project.dateRange}</span>}
                </div>
                <h3 className="portfolio-project-title">{project.title}</h3>
                <p className="portfolio-project-description">{project.description}</p>
                <div className="portfolio-project-tags">
                  {project.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="portfolio-project-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
