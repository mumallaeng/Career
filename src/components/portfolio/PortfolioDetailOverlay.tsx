'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import MDXRenderer from '@/components/MDXRenderer';
import ContactLinks from './ContactLinks';

const PANEL_WIDTH_STORAGE_KEY = 'portfolio-detail-panel-width-v1';
const MIN_PANEL_WIDTH = 420;
const MIN_PAGE_WIDTH = 480;
const MAX_PANEL_RATIO = 0.72;
const DEFAULT_PANEL_RATIO = 0.5;
const DEFAULT_PANEL_MIN_WIDTH = 480;
const KEYBOARD_RESIZE_STEP = 16;

interface PanelWidthMetrics {
  width: number;
  min: number;
  max: number;
}

interface ResizeDrag {
  pointerId: number;
  startX: number;
  startWidth: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getPanelWidthLimits(viewportWidth: number) {
  return {
    min: MIN_PANEL_WIDTH,
    max: Math.max(
      MIN_PANEL_WIDTH,
      Math.round(Math.min(viewportWidth * MAX_PANEL_RATIO, viewportWidth - MIN_PAGE_WIDTH))
    ),
  };
}

function getDefaultPanelWidth(viewportWidth: number) {
  const { min, max } = getPanelWidthLimits(viewportWidth);
  return Math.round(
    clamp(Math.max(viewportWidth * DEFAULT_PANEL_RATIO, DEFAULT_PANEL_MIN_WIDTH), min, max)
  );
}

export interface PortfolioDetail {
  title: string;
  href: string;
  content: string;
  description: string;
  meta: string[];
  tags?: string[];
  thumbnailUrl?: string;
  highlights?: string[];
}

interface PortfolioDetailOverlayProps {
  detail: PortfolioDetail | null;
  isOpen: boolean;
  isWideView: boolean;
  closeLabel: string;
  resizeLabel: string;
  expandLabel: string;
  collapseLabel: string;
  onClose: () => void;
}

export default function PortfolioDetailOverlay({
  detail,
  isOpen,
  isWideView,
  closeLabel,
  resizeLabel,
  expandLabel,
  collapseLabel,
  onClose,
}: PortfolioDetailOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const preferredWidthRef = useRef<number | null>(null);
  const resizeDragRef = useRef<ResizeDrag | null>(null);
  const panelWidthMetricsRef = useRef<PanelWidthMetrics>({
    width: DEFAULT_PANEL_MIN_WIDTH,
    min: MIN_PANEL_WIDTH,
    max: 720,
  });

  const applyPanelWidth = useCallback((requestedWidth: number) => {
    const { min, max } = getPanelWidthLimits(window.innerWidth);
    const width = Math.round(clamp(requestedWidth, min, max));

    document.body.style.setProperty('--portfolio-detail-panel-width', `${width}px`);
    panelWidthMetricsRef.current = { width, min, max };
    resizeHandleRef.current?.setAttribute('aria-valuemin', String(min));
    resizeHandleRef.current?.setAttribute('aria-valuemax', String(max));
    resizeHandleRef.current?.setAttribute('aria-valuenow', String(width));

    return width;
  }, []);

  const persistPanelWidth = useCallback((width: number) => {
    try {
      window.localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, String(Math.round(width)));
    } catch {
      // Resizing still works when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (!isWideView) {
      document.body.classList.remove('portfolio-split-resizing');
      document.body.style.removeProperty('--portfolio-detail-panel-width');
      resizeDragRef.current = null;
      return undefined;
    }

    let preferredWidth = getDefaultPanelWidth(window.innerWidth);
    try {
      const storedWidth = Number(window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY));
      if (Number.isFinite(storedWidth) && storedWidth > 0) {
        preferredWidth = storedWidth;
      }
    } catch {
      // Fall back to the responsive default when browser storage is unavailable.
    }

    preferredWidthRef.current = preferredWidth;
    applyPanelWidth(preferredWidth);

    const handleViewportResize = () => {
      applyPanelWidth(preferredWidthRef.current ?? getDefaultPanelWidth(window.innerWidth));
    };

    window.addEventListener('resize', handleViewportResize);
    return () => {
      window.removeEventListener('resize', handleViewportResize);
      document.body.classList.remove('portfolio-split-resizing');
      document.body.style.removeProperty('--portfolio-detail-panel-width');
      resizeDragRef.current = null;
    };
  }, [applyPanelWidth, isWideView]);

  useLayoutEffect(() => {
    if (!detail?.href || !bodyRef.current) {
      return;
    }
    bodyRef.current.scrollTop = 0;
    bodyRef.current.scrollLeft = 0;
  }, [detail?.href]);

  useEffect(() => {
    setIsExpanded(false);
  }, [detail?.href]);

  useEffect(() => {
    if (!isOpen || !isWideView) {
      setIsExpanded(false);
    }
  }, [isOpen, isWideView]);

  const handleResizePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      const currentWidth =
        panelRef.current?.getBoundingClientRect().width ?? panelWidthMetricsRef.current.width;
      resizeDragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startWidth: currentWidth,
      };
      preferredWidthRef.current = currentWidth;
      event.currentTarget.setPointerCapture(event.pointerId);
      document.body.classList.add('portfolio-split-resizing');
    },
    []
  );

  const handleResizePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = resizeDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      const nextWidth = drag.startWidth + (drag.startX - event.clientX);
      preferredWidthRef.current = applyPanelWidth(nextWidth);
    },
    [applyPanelWidth]
  );

  const finishPointerResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = resizeDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      resizeDragRef.current = null;
      document.body.classList.remove('portfolio-split-resizing');
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (preferredWidthRef.current !== null) {
        persistPanelWidth(preferredWidthRef.current);
      }
    },
    [persistPanelWidth]
  );

  const setAndPersistPanelWidth = useCallback(
    (requestedWidth: number) => {
      const width = applyPanelWidth(requestedWidth);
      preferredWidthRef.current = width;
      persistPanelWidth(width);
    },
    [applyPanelWidth, persistPanelWidth]
  );

  const handleResizeKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const step = event.shiftKey ? KEYBOARD_RESIZE_STEP * 3 : KEYBOARD_RESIZE_STEP;
      const { width, min, max } = panelWidthMetricsRef.current;
      let nextWidth: number | null = null;

      if (event.key === 'ArrowLeft') {
        nextWidth = width + step;
      } else if (event.key === 'ArrowRight') {
        nextWidth = width - step;
      } else if (event.key === 'Home') {
        nextWidth = min;
      } else if (event.key === 'End') {
        nextWidth = max;
      }

      if (nextWidth === null) {
        return;
      }

      event.preventDefault();
      setAndPersistPanelWidth(nextWidth);
    },
    [setAndPersistPanelWidth]
  );

  const resetPanelWidth = useCallback(() => {
    setAndPersistPanelWidth(getDefaultPanelWidth(window.innerWidth));
  }, [setAndPersistPanelWidth]);

  if (!detail) {
    return null;
  }

  return (
    <>
      <div
        className={`portfolio-detail-backdrop${isOpen ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        id="portfolio-detail-panel"
        className={`portfolio-detail-panel${isOpen ? ' is-open' : ''}${isExpanded ? ' is-expanded' : ''}`}
        role="dialog"
        aria-modal={!isWideView}
        aria-label={detail.title}
      >
        {isWideView && !isExpanded && (
          <div
            ref={resizeHandleRef}
            className="portfolio-detail-resize-handle"
            role="separator"
            aria-label={resizeLabel}
            aria-controls="portfolio-detail-panel"
            aria-orientation="vertical"
            aria-valuemin={panelWidthMetricsRef.current.min}
            aria-valuemax={panelWidthMetricsRef.current.max}
            aria-valuenow={panelWidthMetricsRef.current.width}
            title={resizeLabel}
            tabIndex={0}
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={finishPointerResize}
            onPointerCancel={finishPointerResize}
            onLostPointerCapture={finishPointerResize}
            onKeyDown={handleResizeKeyDown}
            onDoubleClick={resetPanelWidth}
          />
        )}
        <div className="portfolio-detail-header">
          <ContactLinks compact />
          <div className="portfolio-detail-header-actions">
            {isWideView && (
              <button
                type="button"
                className="portfolio-detail-expand"
                onClick={() => setIsExpanded((expanded) => !expanded)}
                aria-label={isExpanded ? collapseLabel : expandLabel}
                aria-pressed={isExpanded}
                title={isExpanded ? collapseLabel : expandLabel}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isExpanded ? (
                    <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
              </button>
            )}
            <button
              type="button"
              className="portfolio-detail-close"
              onClick={onClose}
              aria-label={closeLabel}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div ref={bodyRef} className="portfolio-detail-body">
          {detail.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={detail.thumbnailUrl} alt="" className="portfolio-detail-thumbnail" />
          )}

          <h2 className="portfolio-detail-title">{detail.title}</h2>
          <div className="portfolio-detail-meta">
            {detail.meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <p className="portfolio-detail-description">{detail.description}</p>

          {detail.highlights && detail.highlights.length > 0 && (
            <ul className="portfolio-detail-highlights">
              {detail.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          )}

          {detail.tags && detail.tags.length > 0 && (
            <div className="portfolio-detail-tags">
              {detail.tags.map((tag) => (
                <span key={tag} className="portfolio-project-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="portfolio-detail-content post-body">
            <MDXRenderer key={detail.href} content={detail.content} />
          </div>
        </div>
      </div>
    </>
  );
}
