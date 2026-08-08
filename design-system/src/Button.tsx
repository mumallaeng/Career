import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps {
  /** Visual weight: `primary` is filled/high-emphasis, `secondary` is outlined. */
  variant?: 'primary' | 'secondary';
  /** Renders as a link (`<a>`) when set; otherwise renders as a `<button>`. */
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  anchorProps?: AnchorHTMLAttributes<HTMLAnchorElement>;
  buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * Pill-shaped call-to-action button, primary (filled) or secondary (outlined).
 *
 * @example
 * <Button variant="primary" href="#projects">View projects</Button>
 * <Button variant="secondary" onClick={() => scrollToId('contact')}>Contact</Button>
 */
export function Button({ variant = 'primary', href, onClick, children, anchorProps, buttonProps }: ButtonProps) {
  const className = `portfolio-button portfolio-button--${variant}`;

  if (href) {
    return (
      <a href={href} className={className} onClick={onClick} {...anchorProps}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick} {...buttonProps}>
      {children}
    </button>
  );
}
