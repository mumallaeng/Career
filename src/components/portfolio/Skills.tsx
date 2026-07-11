import type { SkillGroup } from '@/lib/portfolio';

interface SkillsProps {
  groups: SkillGroup[];
}

export default function Skills({ groups }: SkillsProps) {
  return (
    <section id="skills" className="portfolio-section portfolio-section--secondary">
      <div className="portfolio-container">
        <header className="portfolio-section-header">
          <p className="portfolio-section-kicker">Skills</p>
          <h2 className="portfolio-section-title">Skills</h2>
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
