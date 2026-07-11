'use client';

import Link from 'next/link';
import type { ProjectSummary } from '@/lib/portfolio';

interface ProjectsProps {
  projects: ProjectSummary[];
  onSelect: (slug: string) => boolean;
}

export default function Projects({ projects, onSelect }: ProjectsProps) {
  return (
    <section id="projects" className="portfolio-section">
      <div className="portfolio-container">
        <header className="portfolio-section-header">
          <p className="portfolio-section-kicker">Projects</p>
          <h2 className="portfolio-section-title">Projects</h2>
        </header>

        <div className="portfolio-projects-grid">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={project.href}
              className="portfolio-project-card"
              onClick={(event) => {
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
