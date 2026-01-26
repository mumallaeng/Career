'use client';

import Link from 'next/link';

const emailAddress = 'mumallaeng@icloud.com';
const phoneNumber = '010-4557-0214';

export default function Navigation() {
  const showNavTabs = false;
  const navItems = [
    { href: '/profile', label: '포트폴리오' },
    { href: '/activities', label: '상세' },
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

  const handleMailClick = async () => {
    await copyToClipboard(emailAddress);
    window.location.href = `mailto:${emailAddress}`;
  };

  const handlePhoneClick = async () => {
    await copyToClipboard(phoneNumber);
    window.location.href = `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`;
  };

  return (
    <header className="header">
      <nav className="nav-container">
        {/* Navigation Menu */}
        {showNavTabs && (
          <div className="nav-menu">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-item"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side - Social Icons */}
        <div className="nav-social">
          <button
            type="button"
            onClick={handlePhoneClick}
            className="phone-link"
            title="전화번호 복사"
            aria-label="전화번호 복사"
          >
            <svg className="phone-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
            </svg>
            <span className="phone-tooltip">{phoneNumber}</span>
          </button>
          <button
            type="button"
            onClick={handleMailClick}
            className="mail-link"
            title="mumallaeng@icloud.com"
            aria-label="메일 보내기"
          >
            <svg className="mail-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.5 6.25A2.75 2.75 0 0 1 5.25 3.5h13.5A2.75 2.75 0 0 1 21.5 6.25v11.5A2.75 2.75 0 0 1 18.75 20.5H5.25A2.75 2.75 0 0 1 2.5 17.75z" />
              <path d="M4 6.5l8 6 8-6" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="mail-tooltip">
              {emailAddress}
            </span>
          </button>
          {/* GitLab Icon */}
          {/* <Link
            href="https://gitlab.com/mumallaeng"
            target="_blank"
            rel="noopener noreferrer"
            className="gitlab-link"
            title="Visit GitLab Profile"
          >
            <svg className="gitlab-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.918 1.263c-.135-.423-.73-.423-.867 0L1.387 9.452L.045 13.587c-.121.375.014.789.331 1.023L12 23.054l11.624-8.443c.318-.235.453-.648.331-1.024"/>
            </svg>
          </Link> */}

          {/* GitHub Icon */}
          <Link
            href="https://github.com/mumallaeng"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            title="Visit GitHub Profile"
          >
            <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span className="github-tooltip">@mumallaeng</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
