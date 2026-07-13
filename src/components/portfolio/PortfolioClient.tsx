'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Intro from './Intro';
import Skills from './Skills';
import Experience from './Experience';
import Projects from './Projects';
import PortfolioDetailOverlay, { type PortfolioDetail } from './PortfolioDetailOverlay';
import { useLanguage } from '@/components/LanguageProvider';
import { homeCopy, localizeExperience, localizeProject } from '@/lib/i18n';
import type {
  HeroContent,
  AboutContent,
  SkillGroup,
  ExperienceEntry,
  PortfolioDetailContent,
  ProjectSummary,
} from '@/lib/portfolio';

interface PortfolioClientProps {
  hero: HeroContent;
  about: AboutContent;
  skills: SkillGroup[];
  experience: ExperienceEntry[];
  projects: ProjectSummary[];
  detailContent: PortfolioDetailContent;
}

const MOBILE_QUERY = '(max-width: 768px)';
const WIDE_QUERY = '(min-width: 1200px)';
const CLOSE_ANIMATION_MS = 320;

function findDetailPath(
  pathname: string,
  projects: ProjectSummary[],
  experience: ExperienceEntry[]
): string | null {
  const normalized = pathname.replace(/\/$/, '');
  const paths = [...projects.map((project) => project.href), ...experience.map((entry) => entry.href)];
  return paths.find((path) => path.replace(/\/$/, '') === normalized) ?? null;
}

export default function PortfolioClient({
  hero,
  about,
  skills,
  experience,
  projects,
  detailContent,
}: PortfolioClientProps) {
  const { locale } = useLanguage();
  const copy = homeCopy[locale];
  const [activePath, setActivePath] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isWideViewport, setIsWideViewport] = useState(false);
  const homeUrlRef = useRef('/');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const clearDetailAfterAnimation = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setActivePath(null);
      closeTimerRef.current = null;
    }, CLOSE_ANIMATION_MS);
  }, [clearCloseTimer]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(WIDE_QUERY);
    const updateViewport = () => setIsWideViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  const closeDetail = useCallback(() => {
    setIsOpen(false);
    window.history.pushState({}, '', homeUrlRef.current || '/');
    clearDetailAfterAnimation();
  }, [clearDetailAfterAnimation]);

  const openDetail = useCallback(
    (href: string) => {
      if (window.matchMedia(MOBILE_QUERY).matches) {
        return false;
      }

      if (!findDetailPath(href, projects, experience)) {
        return false;
      }

      clearCloseTimer();
      if (!isOpen) {
        homeUrlRef.current = window.location.pathname + window.location.search + window.location.hash;
      }
      window.history.pushState({}, '', href);
      setActivePath(href);
      requestAnimationFrame(() => setIsOpen(true));
      return true;
    },
    [clearCloseTimer, experience, isOpen, projects]
  );

  const openProject = useCallback(
    (slug: string) => {
      const project = projects.find((item) => item.slug === slug);
      if (!project) {
        return false;
      }

      return openDetail(project.href);
    },
    [openDetail, projects]
  );

  useEffect(() => {
    const handlePopState = () => {
      const match = findDetailPath(window.location.pathname, projects, experience);
      if (match) {
        clearCloseTimer();
        setActivePath(match);
        setIsOpen(true);
      } else {
        setIsOpen(false);
        clearDetailAfterAnimation();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [clearCloseTimer, clearDetailAfterAnimation, experience, projects]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove('portfolio-split-open');
      return undefined;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDetail();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.classList.toggle('portfolio-split-open', isWideViewport);
    if (!isWideViewport) {
      document.body.style.overflow = 'hidden';
    }

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      document.body.classList.remove('portfolio-split-open');
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isWideViewport, closeDetail]);

  const localizedProjects = projects.map((project) => localizeProject(project, locale));
  const localizedExperience = experience.map((entry) => localizeExperience(entry, locale));
  const activeProject = localizedProjects.find((project) => project.href === activePath) ?? null;
  const activeExperience = localizedExperience.find((entry) => entry.href === activePath) ?? null;
  const activeDetail: PortfolioDetail | null = activeProject
    ? {
        eyebrow: copy.detail.project,
        title: activeProject.title,
        href: activeProject.href,
        content: detailContent[activeProject.href] ?? '',
        description: activeProject.description,
        meta: [activeProject.type, activeProject.role, activeProject.dateRange].filter(
          (item): item is string => Boolean(item)
        ),
        tags: activeProject.tags,
        thumbnailUrl: activeProject.thumbnailUrl,
        highlights: activeProject.highlights,
      }
    : activeExperience
      ? {
          eyebrow: copy.experience.groups[activeExperience.group],
          title: activeExperience.title,
          href: activeExperience.href,
          content: detailContent[activeExperience.href] ?? '',
          description: activeExperience.description,
          meta: [activeExperience.dateRange],
        }
      : null;

  return (
    <div className="portfolio-page">
      <Intro hero={hero} about={about} locale={locale} />
      <Skills groups={skills} locale={locale} />
      <Experience entries={localizedExperience} onSelect={openDetail} locale={locale} />
      <Projects projects={localizedProjects} onSelect={openProject} locale={locale} />
      <PortfolioDetailOverlay
        detail={activeDetail}
        isOpen={isOpen}
        isWideView={isWideViewport}
        closeLabel={copy.detail.close}
        resizeLabel={copy.detail.resize}
        onClose={closeDetail}
      />
    </div>
  );
}
