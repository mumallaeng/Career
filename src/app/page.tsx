import { Analytics } from '@vercel/analytics/next';
import PortfolioClient from '@/components/portfolio/PortfolioClient';
import {
  getHeroContent,
  getAboutContent,
  getSkillGroups,
  getExperienceEntries,
  getFeaturedProjects,
  getPortfolioDetailContent,
} from '@/lib/portfolio';

export default function HomePage() {
  const hero = getHeroContent();
  const about = getAboutContent();
  const skills = getSkillGroups();
  const experience = getExperienceEntries();
  const projects = getFeaturedProjects();
  const detailContent = getPortfolioDetailContent(experience, projects);

  return (
    <>
      <PortfolioClient
        hero={hero}
        about={about}
        skills={skills}
        experience={experience}
        projects={projects}
        detailContent={detailContent}
      />
      <Analytics />
    </>
  );
}
