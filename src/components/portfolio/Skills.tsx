import type { SkillGroup } from '@/lib/portfolio';
import { homeCopy, type Locale } from '@/lib/i18n';

interface SkillsProps {
  groups: SkillGroup[];
  locale: Locale;
}

export default function Skills({ groups, locale }: SkillsProps) {
  const copy = homeCopy[locale].skills;

  return (
    <section id="skills" className="portfolio-section portfolio-section--secondary">
      <div className="portfolio-container">
        <header className="portfolio-section-header">
          <h2 className="portfolio-section-title">{copy.title}</h2>
        </header>
        <div className="portfolio-skills-grid">
          {groups.map((group) => (
            <div key={group.title} className="portfolio-skill-group">
              <h3 className="portfolio-skill-group-title">{group.title}</h3>
              <div className="portfolio-skill-chips">
                {group.skills.map((skill) => (
                  <span key={skill} className="portfolio-skill-chip">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
