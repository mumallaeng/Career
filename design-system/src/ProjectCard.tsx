import type { MouseEvent } from 'react';
import { Tag } from './Tag';

export interface ProjectCardProps {
  title: string;
  description: string;
  dateRange?: string;
  role?: string;
  type?: string;
  tags: string[];
  thumbnailUrl?: string;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Clickable project card: thumbnail, title, meta (type/role/date), description, tags.
 *
 * @example
 * <ProjectCard
 *   title="Shoepernoma"
 *   description="Robotics system integration for an autonomous delivery robot."
 *   dateRange="2024.11 - 2025.05"
 *   type="Team project"
 *   role="Integration lead"
 *   tags={['ROS2', 'Nav2', 'SLAM']}
 *   thumbnailUrl="/images/shoepernoma.png"
 *   href="/activities/shoepernoma"
 * />
 */
export function ProjectCard({
  title,
  description,
  dateRange,
  role,
  type,
  tags,
  thumbnailUrl,
  href,
  onClick,
}: ProjectCardProps) {
  const meta = [type, role, dateRange].filter(Boolean);

  return (
    <a href={href} className="portfolio-project-card" onClick={onClick}>
      {thumbnailUrl && (
        <div className="portfolio-project-thumbnail">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailUrl} alt="" />
        </div>
      )}
      <div className="portfolio-project-body">
        {meta.length > 0 && (
          <div className="portfolio-project-meta">
            {meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}
        <h3 className="portfolio-project-title">{title}</h3>
        <p className="portfolio-project-description">{description}</p>
        {tags.length > 0 && (
          <div className="portfolio-project-tags">
            {tags.map((tag) => (
              <Tag key={tag} label={tag} variant="tag" />
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
