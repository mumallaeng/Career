import Link from 'next/link';
import { getProjectsData } from '@/lib/content';

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const projects = getProjectsData(locale as 'ko' | 'en');

  return (
    <div className="projects-container">
      {/* Section Header */}
      <header className="section-header">
        <h1 className="section-title">
          {locale === 'ko' ? '프로젝트' : 'Projects'}
        </h1>
        <div className="section-description">
          {locale === 'ko' ? '제가 작업한 다양한 프로젝트들을 소개합니다.' : 'Showcase of various projects I\'ve worked on.'}
        </div>
      </header>

      {/* Projects Grid */}
      <div className="projects-grid">
        {projects.map((project, index) => {
          if (index === 0) {
            // First project: full width featured
            return (
              <article key={project.slug} className="project-card featured">
                <Link href={`/${locale}/projects/${project.slug}`} className="project-link">
                  <div className="project-content">
                    <h2 className="project-title">
                      {project.frontMatter.title}
                    </h2>
                    <div className="project-meta">
                      <time className="project-date">
                        {new Date(project.frontMatter.date).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit' 
                        })}
                      </time>
                      <div className="project-tags">
                        {project.frontMatter.tags?.map((tag) => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="project-description">
                      {project.frontMatter.description}
                    </div>
                    <span className="read-more">
                      {locale === 'ko' ? '자세히 보기' : 'Read More'}
                    </span>
                  </div>
                </Link>
              </article>
            );
          } else if (index % 2 === 1) {
            // Odd projects (2nd, 4th, 6th...): left side of row
            return (
              <article key={project.slug} className="project-card half left">
                <Link href={`/${locale}/projects/${project.slug}`} className="project-link">
                  <div className="project-content">
                    <h2 className="project-title">
                      {project.frontMatter.title}
                    </h2>
                    <div className="project-meta">
                      <time className="project-date">
                        {new Date(project.frontMatter.date).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit' 
                        })}
                      </time>
                      <div className="project-tags">
                        {project.frontMatter.tags?.map((tag) => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="project-description">
                      {project.frontMatter.description}
                    </div>
                    <span className="read-more">
                      {locale === 'ko' ? '자세히 보기' : 'Read More'}
                    </span>
                  </div>
                </Link>
              </article>
            );
          } else {
            // Even projects (3rd, 5th, 7th...): right side of row
            return (
              <article key={project.slug} className="project-card half right">
                <Link href={`/${locale}/projects/${project.slug}`} className="project-link">
                  <div className="project-content">
                    <h2 className="project-title">
                      {project.frontMatter.title}
                    </h2>
                    <div className="project-meta">
                      <time className="project-date">
                        {new Date(project.frontMatter.date).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit' 
                        })}
                      </time>
                      <div className="project-tags">
                        {project.frontMatter.tags?.map((tag) => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="project-description">
                      {project.frontMatter.description}
                    </div>
                    <span className="read-more">
                      {locale === 'ko' ? '자세히 보기' : 'Read More'}
                    </span>
                  </div>
                </Link>
              </article>
            );
          }
        })}
      </div>
    </div>
  );
}