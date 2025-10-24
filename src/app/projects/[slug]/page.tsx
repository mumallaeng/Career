import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectsData, getProjectBySlug } from '@/lib/content';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { formatProjectDate } from '@/lib/utils/date';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const projects = getProjectsData();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found'
    };
  }

  return {
    title: project.frontMatter.title
  };
}

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="back-nav">
          <Link
            href="/projects"
            className="back-link"
          >
            ← 프로젝트 목록으로
          </Link>
        </nav>

        <article>
          <header className="post-header">
            <div className="post-meta-container">
              <time className="post-date">
                {formatProjectDate(project.frontMatter.endDate || project.frontMatter.date)}
              </time>
              {project.frontMatter.featured && (
                <span className="featured-badge">
                  Featured
                </span>
              )}
            </div>

            <h1 className="post-title">
              {project.frontMatter.title}
            </h1>

            <p className="post-excerpt">
              {project.frontMatter.description}
            </p>

            {project.frontMatter.tags && (
              <div className="tag-container">
                {project.frontMatter.tags.map((tag) => (
                  <span key={tag} className="tag-item">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="post-body">
            <MarkdownRenderer content={project.content} />
          </div>
        </article>
      </div>
    </div>
  );
}
