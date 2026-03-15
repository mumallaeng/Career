'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { UiLanguage, UiTheme } from '@/hooks/useUiPreferences';

const emailAddress = 'mumallaeng@icloud.com';
const phoneNumber = '010-4557-0214';
const githubUrl = 'https://github.com/mumallaeng';

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="phone-icon" fill="currentColor">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="mail-icon" fill="currentColor">
      <path d="M2.5 6.25A2.75 2.75 0 0 1 5.25 3.5h13.5A2.75 2.75 0 0 1 21.5 6.25v11.5A2.75 2.75 0 0 1 18.75 20.5H5.25A2.75 2.75 0 0 1 2.5 17.75z" />
      <path d="M4 6.5l8 6 8-6" fill="none" stroke="var(--color-bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="github-icon" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.56 1.56M6.86 17.14 5.3 18.7M18.7 18.7l-1.56-1.56M6.86 6.86 5.3 5.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon">
      <path d="M20 14.2A7.8 7.8 0 0 1 9.8 4 8.7 8.7 0 1 0 20 14.2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement | null>(null);
  const lastScrollYRef = useRef(0);
  const [language, setLanguage] = useState<UiLanguage>('en');
  const [theme, setTheme] = useState<UiTheme>('light');
  const [isVisible, setIsVisible] = useState(true);
  const navItems = [
    { href: '/resume', label: { en: 'Resume', ko: 'Resume' } },
    { href: '/cv', label: { en: 'CV', ko: 'CV' } },
    { href: '/detail', label: { en: 'Detail', ko: 'Detail' } },
    { href: '/certificate', label: { en: 'Certificate', ko: 'Certificate' } },
  ];

  const copyToClipboard = async (value: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
    } catch (error) {
      console.error('Unable to copy text to clipboard.', error);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const nextLanguage = (root.lang === 'ko' ? 'ko' : 'en') as UiLanguage;
    const nextTheme = (root.dataset.theme === 'dark' ? 'dark' : 'light') as UiTheme;
    setLanguage(nextLanguage);
    setTheme(nextTheme);
    lastScrollYRef.current = window.scrollY;
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const updateHeight = () => {
      document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight}px`);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) {
        return;
      }

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const previousY = lastScrollYRef.current;
        const delta = currentY - previousY;

        if (currentY <= 24) {
          setIsVisible(true);
        } else if (delta > 6) {
          setIsVisible(false);
        } else if (delta < -6) {
          setIsVisible(true);
        }

        lastScrollYRef.current = currentY;
        ticking = false;
      });

      ticking = true;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/detail') {
      return pathname === '/detail' || pathname.startsWith('/detail/');
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const applyLanguage = (nextLanguage: UiLanguage) => {
    setLanguage(nextLanguage);
    document.documentElement.lang = nextLanguage;
    window.localStorage.setItem('career-lang', nextLanguage);
    window.dispatchEvent(new Event('career:languagechange'));
  };

  const applyTheme = (nextTheme: UiTheme) => {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('career-theme', nextTheme);
    window.dispatchEvent(new Event('career:themechange'));
  };

  const toggleLanguage = () => {
    applyLanguage(language === 'en' ? 'ko' : 'en');
  };

  const toggleTheme = () => {
    applyTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleMailClick = async () => {
    await copyToClipboard(emailAddress);
    window.location.href = `mailto:${emailAddress}`;
  };

  const handlePhoneClick = async () => {
    await copyToClipboard(phoneNumber);
    window.location.href = `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`;
  };

  return (
    <header
      ref={headerRef}
      className={`header ${isVisible ? 'is-visible' : 'is-hidden'}`.trim()}
    >
      <nav className="nav-container">
        <div className="nav-left" aria-label="contact links">
          <button
            type="button"
            onClick={handlePhoneClick}
            className="nav-contact-link nav-phone-link"
            title="전화번호 복사"
            aria-label="전화번호 복사"
          >
            <PhoneIcon />
            <span className="nav-contact-tooltip">{phoneNumber}</span>
          </button>
          <button
            type="button"
            onClick={handleMailClick}
            className="nav-contact-link nav-mail-link"
            title={emailAddress}
            aria-label="메일 보내기"
          >
            <MailIcon />
            <span className="nav-contact-tooltip">{emailAddress}</span>
          </button>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-contact-link nav-github-link"
            title="Visit GitHub Profile"
          >
            <GithubIcon />
            <span className="nav-contact-tooltip">@mumallaeng</span>
          </a>
        </div>

        <div className="nav-menu" aria-label="primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`.trim()}
            >
              {language === 'ko' ? item.label.ko : item.label.en}
            </Link>
          ))}
        </div>

        <div className="nav-controls" aria-label="display controls">
          <button
            type="button"
            className="nav-control-button nav-language-button"
            onClick={toggleLanguage}
            aria-label={language === 'en' ? 'Switch language to Korean' : 'Switch language to English'}
            title={language === 'en' ? 'Switch language to Korean' : 'Switch language to English'}
          >
            <span className="nav-control-value">{language === 'en' ? 'EN' : '한'}</span>
          </button>

          <button
            type="button"
            className="nav-control-button nav-theme-button"
            onClick={toggleTheme}
            aria-label={
              theme === 'light'
                ? language === 'ko'
                  ? '다크 모드로 전환'
                  : 'Switch to dark mode'
                : language === 'ko'
                  ? '라이트 모드로 전환'
                  : 'Switch to light mode'
            }
            title={
              theme === 'light'
                ? language === 'ko'
                  ? '다크 모드로 전환'
                  : 'Switch to dark mode'
                : language === 'ko'
                  ? '라이트 모드로 전환'
                  : 'Switch to light mode'
            }
          >
            {theme === 'light' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </nav>
    </header>
  );
}
