import type { MouseEvent } from 'react';

export interface ExperienceItemProps {
  title: string;
  dateRange: string;
  description: string;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * A single row in an experience/education timeline: title + date on one line, description below.
 *
 * @example
 * <ExperienceItem
 *   title="애드인에듀 IT 아카데미"
 *   dateRange="2024.11 - 2025.05"
 *   description="ROS2와 AI를 활용한 자율주행 로봇 개발자 양성과정을 수료했습니다."
 *   href="/activities/kdt-addinedu"
 * />
 */
export function ExperienceItem({ title, dateRange, description, href, onClick }: ExperienceItemProps) {
  return (
    <a href={href} className="portfolio-experience-item" onClick={onClick}>
      <div className="portfolio-experience-item-header">
        <h4 className="portfolio-experience-title">{title}</h4>
        <span className="portfolio-experience-date">{dateRange}</span>
      </div>
      <p className="portfolio-experience-description">{description}</p>
    </a>
  );
}
