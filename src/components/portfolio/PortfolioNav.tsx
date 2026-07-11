'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { contactEmail, contactGithubUrl } from '@/data/contact';

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export default function PortfolioNav() {
  const [activeId, setActiveId] = useState('home');

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

        <nav className="portfolio-nav-links" aria-label="Section navigation">
          {SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`portfolio-nav-link${activeId === id ? ' active' : ''}`}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="portfolio-nav-contact">
          <a
            href={`mailto:${contactEmail}`}
            className="portfolio-nav-icon-link"
            title={contactEmail}
            aria-label="이메일 보내기"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2.5 6.25A2.75 2.75 0 0 1 5.25 3.5h13.5A2.75 2.75 0 0 1 21.5 6.25v11.5A2.75 2.75 0 0 1 18.75 20.5H5.25A2.75 2.75 0 0 1 2.5 17.75z" />
              <path d="M4 6.5l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <Link
            href={contactGithubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-nav-icon-link"
            aria-label="GitHub 프로필 방문"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
