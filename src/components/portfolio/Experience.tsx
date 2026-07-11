import Link from 'next/link';
import type { ExperienceEntry } from '@/lib/portfolio';

interface ExperienceProps {
  entries: ExperienceEntry[];
}

export default function Experience({ entries }: ExperienceProps) {
  const groups = Array.from(new Set(entries.map((entry) => entry.group)));

  return (
    <section id="experience" className="portfolio-section">
      <div className="portfolio-container">
        <header className="portfolio-section-header">
          <p className="portfolio-section-kicker">Experience</p>
          <h2 className="portfolio-section-title">Experience &amp; Activities</h2>
        </header>

        {groups.map((group) => (
          <div key={group} className="portfolio-experience-group">
            <h3 className="portfolio-experience-group-title">{group}</h3>
            {entries
              .filter((entry) => entry.group === group)
              .map((entry) => (
                <Link key={entry.title} href={entry.href} className="portfolio-experience-item">
                  <div className="portfolio-experience-item-header">
                    <h4 className="portfolio-experience-title">{entry.title}</h4>
                    <span className="portfolio-experience-date">{entry.dateRange}</span>
                  </div>
                  <p className="portfolio-experience-description">{entry.description}</p>
                </Link>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}
