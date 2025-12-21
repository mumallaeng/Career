import type { ReactNode, CSSProperties } from 'react';

interface GradeGridProps {
  ratio?: number[];
  className?: string;
  children?: ReactNode;
}

const buildColumnsValue = (ratio?: number[]): string | undefined => {
  if (!ratio || ratio.length === 0) {
    return undefined;
  }

  const normalized = ratio.map((value) => (value > 0 ? value : 1));
  return normalized.map((value) => `minmax(0, ${value}fr)`).join(' ');
};

export default function GradeGrid({ ratio, className = '', children }: GradeGridProps) {
  const columnsValue = buildColumnsValue(ratio);
  const style = columnsValue
    ? ({ ['--grade-grid-columns' as const]: columnsValue } as CSSProperties)
    : undefined;

  return (
    <div className={`grade-grid ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
