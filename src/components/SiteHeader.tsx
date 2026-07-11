'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import PortfolioNav from './portfolio/PortfolioNav';

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === '';

  return isHome ? <PortfolioNav /> : <Navigation />;
}
