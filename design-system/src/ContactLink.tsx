import type { MouseEvent, ReactNode } from 'react';

export interface ContactLinkProps {
  icon: ReactNode;
  label: string;
  href: string;
  /** Compact styling for use inside a tight header bar (borderless, smaller icon/text). */
  compact?: boolean;
  /** Overrides default navigation, e.g. for copy-to-clipboard-then-navigate behavior. */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Pill-shaped contact link (email, phone, GitHub, etc.) with a leading icon.
 * Wrap one or more in a `.portfolio-contact-links` (or `.portfolio-contact-links--compact`) container.
 *
 * @example
 * <div className="portfolio-contact-links">
 *   <ContactLink icon={<MailIcon />} label="hello@example.com" href="mailto:hello@example.com" />
 * </div>
 */
export function ContactLink({ icon, label, href, compact = false, onClick }: ContactLinkProps) {
  return (
    <a
      href={href}
      className="portfolio-contact-link"
      onClick={onClick}
      data-compact={compact ? 'true' : undefined}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
