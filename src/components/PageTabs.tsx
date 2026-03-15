import Link from 'next/link';
import LocalizedText from '@/components/LocalizedText';

type PageTabItem = {
  href: string;
  label: string;
  labelKo?: string;
};

interface PageTabsProps {
  items: PageTabItem[];
  activeHref: string;
}

export default function PageTabs({ items, activeHref }: PageTabsProps) {
  return (
    <nav className="page-tabs" aria-label="페이지 탭">
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`page-tab ${item.href === activeHref ? 'active' : ''}`.trim()}
        >
          <LocalizedText en={item.label} ko={item.labelKo ?? item.label} />
        </Link>
      ))}
    </nav>
  );
}
