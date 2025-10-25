'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { deepmerge } from 'deepmerge-ts';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  // Custom sanitize schema to allow style tags, class attributes, and video
  const customSchema = deepmerge(defaultSchema, {
    attributes: {
      '*': ['className', 'class', 'style'],
      div: ['className', 'class'],
      img: ['src', 'alt', 'name', 'className', 'class'],
      video: ['src', 'controls', 'width', 'height', 'autoplay', 'loop', 'muted', 'className', 'class'],
      source: ['src', 'type'],
    },
    tagNames: ['style', 'video', 'source'],
  });

  return (
    <>
      <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300">
        <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, customSchema]]}
        components={{
          h1: ({ children }) => {
            const content = children !== null && children !== undefined ? children : '';
            return <h1 className="text-4xl font-bold mb-8 mt-16 text-gray-900 dark:text-gray-100 leading-tight">{content}</h1>;
          },
          h2: ({ children }) => {
            const content = children !== null && children !== undefined ? children : '';
            return <h2 className="text-2xl font-semibold mb-5 mt-10 text-gray-900 dark:text-gray-100 leading-tight">{content}</h2>;
          },
          h3: ({ children }) => {
            const content = children !== null && children !== undefined ? children : '';
            return <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-gray-100">{content}</h3>;
          },
          h4: ({ children }) => {
            const content = children !== null && children !== undefined ? children : '';
            return <h4 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-gray-100">{content}</h4>;
          },
          p: ({ children }) => {
            const content = children !== null && children !== undefined ? children : '';
            return <p className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">{content}</p>;
          },
          ul: ({ children }) => {
            const content = children !== null && children !== undefined ? children : '';
            return <ul className="mb-4 space-y-2 text-gray-700 dark:text-gray-300">{content}</ul>;
          },
          ol: ({ children }) => {
            const content = children !== null && children !== undefined ? children : '';
            return <ol className="mb-4 space-y-2 text-gray-700 dark:text-gray-300">{content}</ol>;
          },
          li: ({ children }) => {
            const content = children !== null && children !== undefined ? children : '';
            return <li className="ml-4">{content}</li>;
          },
          strong: ({ children }) => {
            const content = children !== null && children !== undefined ? children : '';
            return <strong className="font-semibold text-gray-900 dark:text-gray-100">{content}</strong>;
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-8">
              <table className="min-w-full">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>,
          tbody: ({ children }) => <tbody className="bg-white dark:bg-gray-900">{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-gray-200 dark:border-gray-700">{children}</tr>,
          th: ({ children }) => {
            // Safely handle children - could be text, number, or React nodes
            const content = children !== null && children !== undefined ? children : '';
            return (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {content}
              </th>
            );
          },
          td: ({ children }) => {
            // Safely handle children - could be text, number, or React nodes
            const content = children !== null && children !== undefined ? children : '';
            return (
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 dark:text-gray-300">
                {content}
              </td>
            );
          },
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ''}
              className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              loading="lazy"
              onClick={() => setLightboxImage(typeof src === 'string' ? src : null)}
            />
          ),
          blockquote: ({ children }) => {
            const content = children !== null && children !== undefined ? children : '';
            return (
              <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
                {content}
              </blockquote>
            );
          },
          code: ({ children, className }) => {
            const isInline = !className;
            // Convert children to string to avoid NaN errors
            const codeContent = String(children || '');

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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>

    {/* Lightbox Modal */}
    {lightboxImage && (
      <div
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => setLightboxImage(null)}
      >
        <img
          src={lightboxImage}
          alt="Full size"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    )}
    </>
  );
}