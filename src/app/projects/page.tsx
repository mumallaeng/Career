import { getProjectsData } from '@/lib/content';
import Card from '@/components/Card';

export default function ProjectsPage() {
  const projects = getProjectsData();

  return (
    <div className="projects-container">
      {/* Section Header */}
      <header className="section-header">
        <h1 className="section-title">프로젝트</h1>
      </header>

      {/* Projects Grid */}
      <div className="projects-grid">
        {projects.map((project, index) => (
          <Card
            key={project.slug}
            item={project}
            index={index}
            type="project"
          />
        ))}
      </div>
    </div>
  );
}
