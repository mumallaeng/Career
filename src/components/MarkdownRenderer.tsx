'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h1: ({ children }) => <h1 className="text-4xl font-bold mb-6 mt-8 text-gray-900 dark:text-gray-100 leading-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-semibold mb-4 mt-10 text-gray-900 dark:text-gray-100 leading-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-semibold mb-3 mt-8 text-gray-900 dark:text-gray-100">{children}</h3>,
          h4: ({ children }) => <h4 className="text-lg font-semibold mb-2 mt-6 text-gray-900 dark:text-gray-100">{children}</h4>,
          p: ({ children }) => <p className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="mb-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ol>,
          li: ({ children }) => <li className="ml-4">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-600 dark:text-red-400">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto font-mono text-sm">
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}