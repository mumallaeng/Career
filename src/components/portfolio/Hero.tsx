import type { HeroContent } from '@/lib/portfolio';
import { homeCopy, type Locale } from '@/lib/i18n';

interface HeroProps {
  content: HeroContent;
  locale: Locale;
}

export default function Hero({ content, locale }: HeroProps) {
  const copy = homeCopy[locale].hero;

  return (
    <section id="home" className="portfolio-section portfolio-hero">
      <div className="portfolio-container">
        <p className="portfolio-hero-kicker">{copy.kicker}</p>
        <h1 className="portfolio-hero-name">{content.name}</h1>
        <p className="portfolio-hero-tagline">{copy.tagline}</p>
        <div className="portfolio-hero-actions">
          <a href="#projects" className="portfolio-button portfolio-button--primary">
            {copy.viewProjects}
          </a>
          <a href="#contact" className="portfolio-button portfolio-button--secondary">
            {copy.contact}
          </a>
        </div>
      </div>
    </section>
  );
}
