'use client';

import { useEffect, useState } from 'react';
import LanguageToggle from '@/components/LanguageToggle';
import NavContactActions from '@/components/NavContactActions';
import { useLanguage } from '@/components/LanguageProvider';
import { homeCopy } from '@/lib/i18n';

const SECTIONS = [
  { id: 'home', labelKey: 'home' },
  { id: 'contact', labelKey: 'contact' },
  { id: 'about', labelKey: 'about' },
  { id: 'skills', labelKey: 'skills' },
  { id: 'experience', labelKey: 'experience' },
  { id: 'projects', labelKey: 'projects' },
] as const;

export default function PortfolioNav() {
  const [activeId, setActiveId] = useState('home');
  const { locale } = useLanguage();
  const copy = homeCopy[locale];

  useEffect(() => {
    const elements = SECTIONS
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-96px 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="portfolio-nav">
      <div className="portfolio-nav-inner">
        <a href="#home" className="portfolio-nav-brand">김연우</a>

        <nav className="portfolio-nav-links" aria-label={copy.nav.sectionNavigation}>
          {SECTIONS.map(({ id, labelKey }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`portfolio-nav-link${activeId === id ? ' active' : ''}`}
            >
              {copy.nav[labelKey]}
            </a>
          ))}
        </nav>

        <div className="portfolio-nav-contact">
          <NavContactActions />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
