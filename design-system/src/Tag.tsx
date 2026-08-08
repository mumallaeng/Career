export interface TagProps {
  label: string;
  /** `chip` (skill chip, filled text) or `tag` (project tag, muted text) — same shape, different weight. */
  variant?: 'chip' | 'tag';
}

/**
 * Small pill label for a skill or a project tag.
 *
 * @example
 * <Tag label="ROS2" variant="chip" />
 * <Tag label="Python" variant="tag" />
 */
export function Tag({ label, variant = 'chip' }: TagProps) {
  const className = variant === 'chip' ? 'portfolio-skill-chip' : 'portfolio-project-tag';
  return <span className={className}>{label}</span>;
}
