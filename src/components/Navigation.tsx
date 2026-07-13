'use client';

import Link from 'next/link';
import LanguageToggle from './LanguageToggle';
import NavContactActions from './NavContactActions';
import { useLanguage } from './LanguageProvider';
import { homeCopy } from '@/lib/i18n';

export default function Navigation() {
  const { locale } = useLanguage();
  const copy = homeCopy[locale];
  const navItems = [
    { href: '/profile', label: copy.legacyNav.profile },
    { href: '/resume', label: copy.legacyNav.resume },
    { href: '/work', label: copy.legacyNav.work },
    { href: '/writing', label: copy.legacyNav.writing },
    { href: '/activities', label: copy.legacyNav.activities },
  ];

  return (
    <header className="header">
      <nav className="nav-container">
        <div className="nav-menu">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-item">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="nav-social">
          <NavContactActions />
          <LanguageToggle />
        </div>
      </nav>
    </header>
  );
}
