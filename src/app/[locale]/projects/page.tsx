import { getProjectsData } from '@/lib/content';
import Card from '@/components/Card';

export async function generateStaticParams() {
  return [
    { locale: 'ko' },
    { locale: 'en' }
  ];
}

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
        {/* <div className="section-description">
          {locale === 'ko' ? '프로젝트 작업물' : 'Showcase of various projects I\'ve worked on.'}
        </div> */}
      </header>

      {/* Projects Grid */}
      <div className="projects-grid">
        {projects.map((project, index) => (
          <Card 
            key={project.slug}
            item={project}
            index={index}
            type="project"
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}