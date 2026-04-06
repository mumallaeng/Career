import MDXRenderer from '@/components/MDXRenderer';
import { getStaticPageData } from '@/lib/content';

interface StaticContentPageProps {
  slug: string;
}

// Flow 2: This shared renderer keeps the first realignment stream small and route-safe.
export default function StaticContentPage({ slug }: StaticContentPageProps) {
  const page = getStaticPageData(slug);

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">Page not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <header className="post-header">
            <h1 className="post-title">{page.frontMatter.title}</h1>
            <p className="post-excerpt">{page.frontMatter.description}</p>
          </header>

          <div className="post-body">
            <MDXRenderer content={page.content} />
          </div>
        </article>
      </div>
    </div>
  );
}
