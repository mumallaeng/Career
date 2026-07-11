import type { AboutContent } from '@/lib/portfolio';

interface AboutProps {
  content: AboutContent;
}

export default function About({ content }: AboutProps) {
  return (
    <section id="about" className="portfolio-section">
      <div className="portfolio-container">
        <header className="portfolio-section-header">
          <p className="portfolio-section-kicker">About</p>
          <h2 className="portfolio-section-title">About Me</h2>
        </header>
        <p className="portfolio-about-summary">{content.summary}</p>
        <ul className="portfolio-about-list">
          {content.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
