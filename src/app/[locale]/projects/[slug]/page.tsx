import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectsData, getProjectBySlug } from '@/lib/content';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export async function generateStaticParams({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const projects = getProjectsData(locale as 'ko' | 'en');
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string }> 
}) {
  const { locale, slug } = await params;
  
  const project = getProjectBySlug(slug, locale as 'ko' | 'en');
  
  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="back-nav">
          <Link 
            href={`/${locale}/projects`}
            className="back-link"
          >
            ← {locale === 'ko' ? '프로젝트 목록으로' : 'Back to Projects'}
          </Link>
        </nav>
        
        <article>
          <header className="post-header">
            <div className="post-meta-container">
              <time className="post-date">
                {new Date(project.frontMatter.date).getFullYear()}
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