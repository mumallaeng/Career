import type { SkillGroup } from '@/lib/portfolio';
import { homeCopy, type Locale } from '@/lib/i18n';

interface SkillsProps {
  groups: SkillGroup[];
  locale: Locale;
}

export default function Skills({ groups, locale }: SkillsProps) {
  const copy = homeCopy[locale].skills;
  const skills = groups.flatMap((group) => group.skills);

  return (
    <div id="skills" className="portfolio-intro-skills" aria-labelledby="skills-title">
      <header className="portfolio-section-header">
        <h2 id="skills-title" className="portfolio-section-title">{copy.title}</h2>
      </header>
      <div className="portfolio-skill-chips">
        {skills.map((skill) => (
          <span key={skill} className="portfolio-skill-chip">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
