/* eslint-disable @next/next/no-img-element */
'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import remarkGfm from 'remark-gfm';
import PlantUmlDiagram from '@/components/PlantUmlDiagram';
import DriveAssetGrid from '@/components/DriveAssetGrid';
import GradeGrid from '@/components/GradeGrid';
import MdxTable from '@/components/MdxTable';
import { onedriveAssetMap, getOneDriveAssetByFilename, getOneDriveAssetsByActId } from '@/data/onedrive-assets';

const handleLegacyImages = (
  container: HTMLElement | null,
  setLightboxImage: (value: string | null) => void
) => {
  if (!container) {
    return;
  }

  const images = Array.from(container.querySelectorAll<HTMLImageElement>('img:not([data-has-lightbox="true"])'));
  if (images.length === 0) {
    return;
  }

  const handleClick = (event: Event) => {
    const target = event.currentTarget as HTMLImageElement | null;
    if (!target) {
      return;
    }
    setLightboxImage(target.currentSrc || target.src || null);
  };

  images.forEach((img) => {
    if (img.dataset.lightboxBound === 'true') {
      return;
    }
    img.dataset.lightboxBound = 'true';
    if (!img.style.cursor) {
      img.style.cursor = 'zoom-in';
    }
    img.addEventListener('click', handleClick);
  });

  return () => {
    images.forEach((img) => {
      if (img.dataset.lightboxBound === 'true') {
        img.removeEventListener('click', handleClick);
        delete img.dataset.lightboxBound;
      }
    });
  };
};

interface MDXRendererProps {
  content: string;
}

// Helper function to safely render children
const safeChildren = (children: ReactNode): ReactNode => {
  if (children === null || children === undefined) {
    return '';
  }
  if (typeof children === 'number' && isNaN(children)) {
    return '';
  }
  return children;
};

const resolveActivityLink = (href: string): { href: string; isInternal: boolean } => {
  const trimmedHref = href.trim();

  if (!trimmedHref) {
    return { href: trimmedHref, isInternal: false };
  }

  if (trimmedHref.startsWith('/') || trimmedHref.startsWith('#')) {
    return { href: trimmedHref, isInternal: trimmedHref.startsWith('/') };
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmedHref)) {
    return { href: trimmedHref, isInternal: false };
  }

  let pathPart = trimmedHref;
  let query = '';
  let hash = '';

  const hashIndex = pathPart.indexOf('#');
  if (hashIndex !== -1) {
    hash = pathPart.slice(hashIndex);
    pathPart = pathPart.slice(0, hashIndex);
  }

  const queryIndex = pathPart.indexOf('?');
  if (queryIndex !== -1) {
    query = pathPart.slice(queryIndex);
    pathPart = pathPart.slice(0, queryIndex);
  }

  let normalizedPath = pathPart.replace(/^\.\//, '');
  normalizedPath = normalizedPath.replace(/\.(mdx|md)$/i, '');

  return {
    href: `/activities/${normalizedPath}${query}${hash}`,
    isInternal: true,
  };
};

const MdxLink = ({ href = '', children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const resolved = resolveActivityLink(href);

  if (resolved.isInternal) {
    return (
      <Link href={resolved.href} {...props}>
        {safeChildren(children)}
      </Link>
    );
  }

  return (
    <a href={resolved.href} {...props}>
      {safeChildren(children)}
    </a>
  );
};

interface VideoTagProps {
  filename?: string;
  src?: string;
  title?: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  poster?: string;
}

const resolveAssetByFilename = (value: string) => {
  const direct = getOneDriveAssetByFilename(value);
  if (direct) return direct;
  try {
    const nfc = value.normalize('NFC');
    const resolvedNfc = getOneDriveAssetByFilename(nfc);
    if (resolvedNfc) return resolvedNfc;
  } catch {
    // ignore
  }
  try {
    const nfd = value.normalize('NFD');
    return getOneDriveAssetByFilename(nfd);
  } catch {
    return undefined;
  }
};

const isVideoExtension = (value: string) => /\.(mp4|webm|gif)$/i.test(value);

const resolveVideoSources = (filename?: string, src?: string): string[] => {
  const rawValue = (filename ?? src ?? '').trim();
  if (!rawValue) {
    return [];
  }

  const asset = resolveAssetByFilename(rawValue);
  if (asset) {
    if (isVideoExtension(asset.filename)) {
      return [
        `/import-data/dev-storage/${asset.filename}`,
        asset.publicPath,
      ];
    }
    return [asset.publicPath];
  }

  if (isVideoExtension(rawValue)) {
    return [
      `/import-data/dev-storage/${rawValue}`,
      `/import-data/highlight/${rawValue}`,
    ];
  }

  if (rawValue.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(rawValue)) {
    return [rawValue];
  }

  return [];
};

const VideoTag = ({
  filename,
  src,
  title = '',
  className = '',
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  playsInline = true,
  poster,
}: VideoTagProps) => {
  const resolvedSources = resolveVideoSources(filename, src);
  if (resolvedSources.length === 0) {
    console.error('VideoTag: missing or invalid source', { filename, src });
    return null;
  }

  const resolvedPoster = resolveVideoSources(poster)[0];
  const titleText = title.trim();

  return (
    <video
      className={`mdx-video ${className}`.trim()}
      controls={controls}
      controlsList="nodownload"
      disablePictureInPicture
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      poster={resolvedPoster ?? undefined}
      onContextMenu={(event) => event.preventDefault()}
    >
      {resolvedSources.map(source => (
        <source key={source} src={source} type="video/mp4" />
      ))}
      {titleText ? `${titleText} 영상` : '동영상을 재생할 수 없습니다.'}
    </video>
  );
};

// Custom Image component with rotation support
const RotatedImage = ({ src, alt, style, className = '', ...props }: { src?: string; alt?: string; style?: React.CSSProperties; className?: string; [key: string]: unknown }) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <img
        src={src}
        alt={alt || ''}
        style={style}
        className={`mdx-image ${className}`.trim()}
        data-has-lightbox="true"
        loading="lazy"
        onClick={() => setLightboxImage(src ?? null)}
        {...props}
      />
      {isMounted && lightboxImage && createPortal(
        <div
          className="mdx-lightbox-overlay"
          onClick={() => setLightboxImage(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setLightboxImage(null);
            }
          }}
        >
          <img
            src={lightboxImage}
            alt={alt || 'Full size'}
            className="mdx-lightbox-image"
          />
        </div>,
        document.body
      )}
    </>
  );
};

const components = {
  h1: ({ children }: { children?: ReactNode }) => <h1 className="text-4xl font-bold mb-8 mt-16 text-gray-900 dark:text-gray-100 leading-tight">{safeChildren(children)}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2 className="text-2xl font-semibold mb-5 mt-10 text-gray-900 dark:text-gray-100 leading-tight">{safeChildren(children)}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-gray-100">{safeChildren(children)}</h3>,
  h4: ({ children }: { children?: ReactNode }) => <h4 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-gray-100">{safeChildren(children)}</h4>,
  p: ({ children }: { children?: ReactNode }) => <p className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">{safeChildren(children)}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="mb-4 space-y-2 text-gray-700 dark:text-gray-300">{safeChildren(children)}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="mb-4 space-y-2 text-gray-700 dark:text-gray-300">{safeChildren(children)}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li className="ml-4">{safeChildren(children)}</li>,
  strong: ({ children }: { children?: ReactNode }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{safeChildren(children)}</strong>,
  table: ({ children }: { children?: ReactNode }) => (
    <div className="overflow-x-auto my-8">
      <table className="min-w-full">{safeChildren(children)}</table>
    </div>
  ),
  thead: ({ children }: { children?: ReactNode }) => <thead className="bg-gray-50 dark:bg-gray-800">{safeChildren(children)}</thead>,
  tbody: ({ children }: { children?: ReactNode }) => <tbody className="bg-white dark:bg-gray-900">{safeChildren(children)}</tbody>,
  tr: ({ children }: { children?: ReactNode }) => <tr className="border-b border-gray-200 dark:border-gray-700">{safeChildren(children)}</tr>,
  th: ({ children }: { children?: ReactNode }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
      {safeChildren(children)}
    </th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 dark:text-gray-300">
      {safeChildren(children)}
    </td>
  ),
  a: MdxLink,
  VideoTag,
  img: RotatedImage,
  ImgTag,
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
      {safeChildren(children)}
    </blockquote>
  ),
  code: ({ children, className }: { children?: ReactNode; className?: string }) => {
    const isInline = !className;
    const codeContent = Array.isArray(children)
      ? children.map((child) => String(child ?? '')).join('')
      : String(children ?? '');
    const languageClass = typeof className === 'string' ? className.toLowerCase() : '';
    const isPlantUmlBlock = !isInline && (/language-plantuml/.test(languageClass) || codeContent.trim().startsWith('@startuml'));

    if (isPlantUmlBlock) {
      return (
        <PlantUmlDiagram content={codeContent} />
      );
    }

    if (isInline) {
      return (
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-600 dark:text-red-400">
          {codeContent}
        </code>
      );
    }
    return (
      <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto font-mono text-sm">
        {codeContent}
      </code>
    );
  },
  PlantUmlDiagram: (props: { content: string; alt?: string }) => (
    <PlantUmlDiagram {...props} />
  ),
  DriveAssetGrid,
  GradeGrid,
  Table: MdxTable,
};

export default function MDXRenderer({ content }: MDXRendererProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [fallbackLightboxImage, setFallbackLightboxImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function compileMDX() {
      const constants = {
        test2_end: 3 * (9 + 4) + 1,
      };

      const compiled = await serialize(content, {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
        scope: {
          onedriveAssetMap,
          getOneDriveAssetsByActId,
          constants,
        },
      });
      setMdxSource(compiled);
    }
    compileMDX();
  }, [content]);

  useEffect(() => {
    if (!mdxSource) {
      return undefined;
    }
    return handleLegacyImages(containerRef.current, setFallbackLightboxImage);
  }, [mdxSource]);

  if (!mdxSource) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div
        ref={containerRef}
        className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300"
      >
        <MDXRemote {...mdxSource} components={components} />
      </div>

      {fallbackLightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setFallbackLightboxImage(null)}
        >
          <img
            src={fallbackLightboxImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
}




// Google Drive Image Component
interface ImgTagProps {
  driveUrl?: string;
  src?: string;
  name?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

function DriveUrlToID(driveUrl: string): string | null {
  const match = driveUrl.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Google Drive URL에서 파일 ID 추출 및 duckduckgo로 이미지 링크 생성
export function ImgTag({ driveUrl, src: fallbackSrc, name = '', alt = '', className = '', ...restProps }: ImgTagProps) {
  let resolvedSrc: string | null = null;

  if (driveUrl && typeof driveUrl === 'string' && driveUrl.trim() !== '') {
    const fileId = DriveUrlToID(driveUrl.trim());

    if (!fileId) {
      console.error('Invalid Google Drive URL');
      return null;
    }

    resolvedSrc = `https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fdrive.google.com/uc?id=${fileId}`;
  } else if (fallbackSrc && typeof fallbackSrc === 'string' && fallbackSrc.trim() !== '') {
    resolvedSrc = fallbackSrc.trim();
  } else {
    return null;
  }

  return (
    <RotatedImage
      src={resolvedSrc}
      name={name}
      alt={alt}
      className={className}
      {...restProps}
    />
  );
}
