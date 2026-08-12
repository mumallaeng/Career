'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import NavContactActions from '@/components/NavContactActions';
import { useLanguage } from '@/components/LanguageProvider';
import { homeCopy } from '@/lib/i18n';

const SECTIONS = [
  { id: 'about', labelKey: 'about' },
  { id: 'skills', labelKey: 'skills' },
  { id: 'experience', labelKey: 'experience' },
  { id: 'projects', labelKey: 'projects' },
] as const;

const SECTION_ACTIVATION_OFFSET = 112;

export default function PortfolioNav() {
  const [activeId, setActiveId] = useState('about');
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === '';
  const { locale } = useLanguage();
  const copy = homeCopy[locale];

  useEffect(() => {
    if (!isHome) {
      return;
    }

    const elements = SECTIONS
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) {
      return;
    }

    let animationFrame = 0;

    const updateActiveSection = () => {
      animationFrame = 0;
      const activationLine = window.scrollY + SECTION_ACTIVATION_OFFSET;
      const isAtPageEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      let nextId = elements[0].id;

      for (const element of elements) {
        if (element.offsetTop <= activationLine) {
          nextId = element.id;
        }
      }

      if (isAtPageEnd) {
        nextId = elements[elements.length - 1].id;
      }

      setActiveId((currentId) => (currentId === nextId ? currentId : nextId));
    };

    const scheduleUpdate = () => {
      if (animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(updateActiveSection);
      }
    };

    updateActiveSection();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    elements.forEach((element) => resizeObserver.observe(element));

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver.disconnect();
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [isHome, pathname]);

  return (
    <header className="portfolio-nav">
      <div className="portfolio-nav-inner">
        <Link href="/" className="portfolio-nav-brand">김연우</Link>

        <nav className="portfolio-nav-links" aria-label={copy.nav.sectionNavigation}>
          {SECTIONS.map(({ id, labelKey }) => (
            <a
              key={id}
              href={isHome ? `#${id}` : `/#${id}`}
              className={`portfolio-nav-link${isHome && activeId === id ? ' active' : ''}`}
            >
              {copy.nav[labelKey]}
            </a>
          ))}
        </nav>

        <div className="portfolio-nav-contact">
          <NavContactActions />
          <span className="portfolio-nav-control-divider" aria-hidden="true">|</span>
          <div className="portfolio-nav-preferences">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
