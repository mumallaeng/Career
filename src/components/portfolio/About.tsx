import type { AboutContent } from '@/lib/portfolio';
import { homeCopy, type Locale } from '@/lib/i18n';

interface AboutProps {
  content: AboutContent;
  locale: Locale;
}

export default function About({ content, locale }: AboutProps) {
  const copy = homeCopy[locale].about;
  const summary = locale === 'ko' ? content.summary : copy.summary;
  const bullets = locale === 'ko' ? content.bullets : copy.bullets;

  return (
    <section id="about" className="portfolio-section">
      <div className="portfolio-container">
        <header className="portfolio-section-header">
          <p className="portfolio-section-kicker">{copy.kicker}</p>
          <h2 className="portfolio-section-title">{copy.title}</h2>
        </header>
        <p className="portfolio-about-summary">{summary}</p>
        <ul className="portfolio-about-list">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
