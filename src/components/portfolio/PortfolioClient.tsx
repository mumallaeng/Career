'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Hero from './Hero';
import About from './About';
import Skills from './Skills';
import Experience from './Experience';
import Projects from './Projects';
import Contact from './Contact';
import ProjectDetailOverlay from './ProjectDetailOverlay';
import type {
  HeroContent,
  AboutContent,
  SkillGroup,
  ExperienceEntry,
  ProjectSummary,
} from '@/lib/portfolio';

interface PortfolioClientProps {
  hero: HeroContent;
  about: AboutContent;
  skills: SkillGroup[];
  experience: ExperienceEntry[];
  projects: ProjectSummary[];
}

const MOBILE_QUERY = '(max-width: 768px)';
const WIDE_QUERY = '(min-width: 1200px)';
const CLOSE_ANIMATION_MS = 320;

function findProjectForPath(pathname: string, projects: ProjectSummary[]): ProjectSummary | null {
  const normalized = pathname.replace(/\/$/, '');
  return projects.find((project) => project.href.replace(/\/$/, '') === normalized) ?? null;
}

export default function PortfolioClient({ hero, about, skills, experience, projects }: PortfolioClientProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const homeUrlRef = useRef('/');

  const closeProject = useCallback(() => {
    setIsOpen(false);
    window.history.pushState({}, '', homeUrlRef.current || '/');
    setTimeout(() => setActiveSlug(null), CLOSE_ANIMATION_MS);
  }, []);

  const openProject = useCallback(
    (slug: string) => {
      if (window.matchMedia(MOBILE_QUERY).matches) {
        return false;
      }

      const project = projects.find((item) => item.slug === slug);
      if (!project) {
        return false;
      }

      homeUrlRef.current = window.location.pathname + window.location.search + window.location.hash;
      window.history.pushState({}, '', project.href);
      setActiveSlug(slug);
      requestAnimationFrame(() => setIsOpen(true));
      return true;
    },
    [projects]
  );

  useEffect(() => {
    const handlePopState = () => {
      const match = findProjectForPath(window.location.pathname, projects);
      if (match) {
        setActiveSlug(match.slug);
        setIsOpen(true);
      } else {
        setIsOpen(false);
        setTimeout(() => setActiveSlug(null), CLOSE_ANIMATION_MS);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [projects]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeProject();
      }
    };

    // Wide split view keeps the left page scrollable; modal/mobile lock it.
    const isWide = window.matchMedia(WIDE_QUERY).matches;
    const previousOverflow = document.body.style.overflow;
    if (!isWide) {
      document.body.style.overflow = 'hidden';
    }

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, closeProject]);

  const activeProject = projects.find((project) => project.slug === activeSlug) ?? null;

  return (
    <div className="portfolio-page">
      <Hero content={hero} />
      <About content={about} />
      <Skills groups={skills} />
      <Experience entries={experience} />
      <Projects projects={projects} onSelect={openProject} />
      <Contact />
      <ProjectDetailOverlay project={activeProject} isOpen={isOpen} onClose={closeProject} />
    </div>
  );
}
