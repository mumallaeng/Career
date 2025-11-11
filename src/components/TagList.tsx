'use client';

import { useLayoutEffect, useRef, useState } from 'react';

type TagListProps = {
  tags?: string[];
  className?: string;
};

export default function TagList({ tags = [], className = '' }: TagListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) {
      return;
    }

    const calculate = () => {
      const availableWidth = container.clientWidth;
      const children = Array.from(measure.children) as HTMLElement[];
      const styles = window.getComputedStyle(measure);
      const gap = parseFloat(styles.columnGap || styles.rowGap || styles.gap || '0');

      let total = 0;
      let count = 0;
      children.forEach((child, index) => {
        const width = child.getBoundingClientRect().width;
        const extra = index > 0 ? gap : 0;
        if (total + width + extra <= availableWidth) {
          total += width + extra;
          count += 1;
        }
      });

      setVisibleCount(count);
    };

    calculate();
    const resizeObserver = new ResizeObserver(() => calculate());
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [tags]);

  const visibleTags = tags.slice(0, visibleCount);

  const renderTags = (list: string[]) => (
    list.map(tag => (
      <span key={tag} className="tag">
        #{tag}
      </span>
    ))
  );

  return (
    <>
      <div className={className} ref={containerRef}>
        {renderTags(visibleTags)}
      </div>
      <div className={`${className} tag-measure`} ref={measureRef} aria-hidden="true">
        {renderTags(tags)}
      </div>
    </>
  );
}
