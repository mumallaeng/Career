export interface SectionHeaderProps {
  title: string;
  /** Optional "see more" link shown at the header's end. */
  moreHref?: string;
  moreLabel?: string;
  /** When true, hides the title and right-aligns the "more" link (action-only header). */
  actionOnly?: boolean;
}

/**
 * Section title with an optional trailing "see more" link.
 *
 * @example
 * <SectionHeader title="Projects" moreHref="/activities/projects" moreLabel="View all" />
 */
export function SectionHeader({ title, moreHref, moreLabel = 'View all', actionOnly = false }: SectionHeaderProps) {
  return (
    <div className={`portfolio-section-header${actionOnly ? ' portfolio-section-header--action-only' : ''}`}>
      {!actionOnly && <h2 className="portfolio-section-title">{title}</h2>}
      {moreHref && (
        <a href={moreHref} className="portfolio-section-more">
          {moreLabel}
          <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}
