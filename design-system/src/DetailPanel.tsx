import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

const MIN_PANEL_WIDTH = 420;
const MAX_PANEL_WIDTH = 900;
const DEFAULT_PANEL_WIDTH = 560;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeLabel?: string;
}

/**
 * Responsive detail panel: full-page slide-in on mobile, centered dimmed modal on
 * tablet, and a resizable right-side split view (drag the left edge) on wide desktop —
 * purely CSS-media-query driven, no JS viewport branching required. Mount it once at
 * the page root; it renders nothing when `isOpen` is false and no `title` was ever set.
 *
 * @example
 * <DetailPanel isOpen={open} onClose={() => setOpen(false)} title="Shoepernoma">
 *   <p>Project case study content goes here.</p>
 * </DetailPanel>
 */
export function DetailPanel({ isOpen, onClose, title, children, closeLabel = 'Close' }: DetailPanelProps) {
  const [width, setWidth] = useState(DEFAULT_PANEL_WIDTH);
  const dragRef = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: width };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [width]
  );

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const next = drag.startWidth + (drag.startX - event.clientX);
    setWidth(clamp(next, MIN_PANEL_WIDTH, MAX_PANEL_WIDTH));
  }, []);

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <>
      <div className={`portfolio-detail-backdrop${isOpen ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`portfolio-detail-panel${isOpen ? ' is-open' : ''}`}
        style={{ ['--portfolio-detail-panel-width' as string]: `${width}px` }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div
          className="portfolio-detail-resize-handle"
          role="separator"
          aria-orientation="vertical"
          aria-valuemin={MIN_PANEL_WIDTH}
          aria-valuemax={MAX_PANEL_WIDTH}
          aria-valuenow={width}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        <div className="portfolio-detail-header">
          <h2 className="portfolio-detail-title">{title}</h2>
          <button type="button" className="portfolio-detail-close" onClick={onClose} aria-label={closeLabel}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="portfolio-detail-body">{children}</div>
      </div>
    </>
  );
}
