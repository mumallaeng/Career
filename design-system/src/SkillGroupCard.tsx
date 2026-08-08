import { Tag } from './Tag';

export interface SkillGroupCardProps {
  title: string;
  skills: string[];
}

/**
 * Card grouping a set of related skills as chips under a title.
 *
 * @example
 * <SkillGroupCard title="Robotics & Automation" skills={['ROS2', 'Nav2', 'SLAM']} />
 */
export function SkillGroupCard({ title, skills }: SkillGroupCardProps) {
  return (
    <div className="portfolio-skill-group">
      <h3 className="portfolio-skill-group-title">{title}</h3>
      <div className="portfolio-skill-chips">
        {skills.map((skill) => (
          <Tag key={skill} label={skill} variant="chip" />
        ))}
      </div>
    </div>
  );
}
