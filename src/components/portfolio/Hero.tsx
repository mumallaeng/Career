import type { HeroContent } from '@/lib/portfolio';

interface HeroProps {
  content: HeroContent;
}

export default function Hero({ content }: HeroProps) {
  return (
    <section id="home" className="portfolio-section portfolio-hero">
      <div className="portfolio-container">
        <p className="portfolio-hero-kicker">{content.kicker}</p>
        <h1 className="portfolio-hero-name">{content.name}</h1>
        <p className="portfolio-hero-tagline">{content.tagline}</p>
        <div className="portfolio-hero-actions">
          <a href="#projects" className="portfolio-button portfolio-button--primary">
            View Projects
          </a>
          <a href="#contact" className="portfolio-button portfolio-button--secondary">
            Contact
          </a>
        </div>
      </div>
    </section>
  );
}
