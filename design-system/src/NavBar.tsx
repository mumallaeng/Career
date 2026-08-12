import type { ReactNode } from 'react';

export interface NavLinkItem {
  id: string;
  label: string;
}

export interface NavBarProps {
  brand?: string;
  links: NavLinkItem[];
  /** id of the currently active section/link, if any. */
  activeId?: string;
  onNavigate: (id: string) => void;
  /** Trailing content — e.g. contact icon links, a language toggle. */
  actions?: ReactNode;
}

/**
 * Sticky, backdrop-blurred top navigation bar with a horizontally scrollable link list
 * and an active-link highlight.
 *
 * @example
 * <NavBar
 *   brand="Career"
 *   links={[{ id: 'about', label: 'About' }, { id: 'projects', label: 'Projects' }]}
 *   activeId="projects"
 *   onNavigate={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
 *   actions={<ContactLink icon={<MailIcon />} label="Email" href="mailto:hello@example.com" compact />}
 * />
 */
export function NavBar({ brand, links, activeId, onNavigate, actions }: NavBarProps) {
  return (
    <nav className="portfolio-nav">
      <div className="portfolio-nav-inner">
        {brand && (
          <span className="portfolio-nav-brand">{brand}</span>
        )}
        <div className="portfolio-nav-links">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              className={`portfolio-nav-link${link.id === activeId ? ' active' : ''}`}
              onClick={() => onNavigate(link.id)}
            >
              {link.label}
            </button>
          ))}
        </div>
        {actions && <div className="portfolio-nav-contact">{actions}</div>}
      </div>
    </nav>
  );
}
