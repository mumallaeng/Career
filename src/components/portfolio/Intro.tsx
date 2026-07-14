'use client';

import { homeCopy, type Locale } from '@/lib/i18n';
import type { AboutContent, HeroContent } from '@/lib/portfolio';
import ContactLinks from './ContactLinks';

interface IntroProps {
  hero: HeroContent;
  about: AboutContent;
  locale: Locale;
}

export default function Intro({ hero, about, locale }: IntroProps) {
  const copy = homeCopy[locale];
  const summary = locale === 'ko' ? about.summary : copy.about.summary;
  const bullets = locale === 'ko' ? about.bullets : copy.about.bullets;

  return (
    <section id="about" className="portfolio-section portfolio-intro">
      <div className="portfolio-container">
        <div className="portfolio-intro-hero">
          <p className="portfolio-hero-kicker">{copy.hero.kicker}</p>
          <h1 className="portfolio-hero-name">{hero.name}</h1>
          <p className="portfolio-hero-tagline">{copy.hero.tagline}</p>
          <div className="portfolio-hero-actions">
            <a href="#projects" className="portfolio-button portfolio-button--primary">
              {copy.hero.viewProjects}
            </a>
            <a href="#contact" className="portfolio-button portfolio-button--secondary">
              {copy.hero.contact}
            </a>
          </div>
        </div>

        <div className="portfolio-intro-grid">
          <div className="portfolio-intro-about">
            <header className="portfolio-section-header">
              <h2 id="about-title" className="portfolio-section-title">{copy.about.title}</h2>
            </header>
            <p className="portfolio-about-summary">{summary}</p>
            <ul className="portfolio-about-list">
              {bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>

          <aside id="contact" className="portfolio-intro-contact" aria-labelledby="contact-title">
            <header className="portfolio-section-header">
              <h2 id="contact-title" className="portfolio-section-title">{copy.contact.title}</h2>
            </header>
            <p className="portfolio-contact-description">{copy.contact.description}</p>

            <ContactLinks />
          </aside>
        </div>
      </div>
    </section>
  );
}
