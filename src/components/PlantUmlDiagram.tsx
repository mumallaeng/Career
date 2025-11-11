'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { buildPlantUmlUrl } from '@/lib/plantuml';

interface PlantUmlDiagramProps {
  content: string;
  alt?: string;
}

export default function PlantUmlDiagram({ content, alt }: PlantUmlDiagramProps) {
  const url = buildPlantUmlUrl(content);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!url) {
    return (
      <pre className="plantuml-code">
        {content}
      </pre>
    );
  }

  const handleOpen = () => setLightboxImage(url);
  const handleClose = () => setLightboxImage(null);

  return (
    <>
      <figure className="plantuml-figure">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt || 'PlantUML diagram'}
          className="plantuml-diagram"
          loading="lazy"
          data-has-lightbox="true"
          onClick={handleOpen}
        />
      </figure>

      {isMounted && lightboxImage && createPortal(
        <div
          className="plantuml-lightbox"
          onClick={handleClose}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleClose();
            }
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt={alt || 'PlantUML diagram'}
            className="plantuml-lightbox-image"
          />
        </div>,
        document.body
      )}
    </>
  );
}
