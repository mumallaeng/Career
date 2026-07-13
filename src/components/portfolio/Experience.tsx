import Link from 'next/link';
import type { ExperienceEntry } from '@/lib/portfolio';
import { homeCopy, type Locale } from '@/lib/i18n';

interface ExperienceProps {
  entries: ExperienceEntry[];
  onSelect: (href: string) => boolean;
  locale: Locale;
}

export default function Experience({ entries, onSelect, locale }: ExperienceProps) {
  const groups = Array.from(new Set(entries.map((entry) => entry.group)));
  const copy = homeCopy[locale].experience;

  return (
    <section id="experience" className="portfolio-section">
      <div className="portfolio-container">
        <header className="portfolio-section-header portfolio-section-header--with-action">
          <div>
            <p className="portfolio-section-kicker">{copy.kicker}</p>
            <h2 className="portfolio-section-title">{copy.title}</h2>
          </div>
          <Link href="/activities/experience" className="portfolio-section-more">
            {copy.more}
            <span aria-hidden="true">→</span>
          </Link>
        </header>

        {groups.map((group) => (
          <div key={group} className="portfolio-experience-group">
            <h3 className="portfolio-experience-group-title">{copy.groups[group]}</h3>
            {entries
              .filter((entry) => entry.group === group)
              .map((entry) => (
                <Link
                  key={entry.title}
                  href={entry.href}
                  className="portfolio-experience-item"
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
                    const handled = onSelect(entry.href);
                    if (handled) {
                      event.preventDefault();
                    }
                  }}
                >
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
