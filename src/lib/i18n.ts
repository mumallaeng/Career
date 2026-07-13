import type { ExperienceEntry, ProjectSummary } from '@/lib/portfolio';

export type Locale = 'ko' | 'en';

export const homeCopy = {
  ko: {
    nav: {
      home: '홈',
      about: '소개',
      skills: '기술',
      experience: '경험',
      projects: '프로젝트',
      contact: '연락처',
      sectionNavigation: '섹션 탐색',
    },
    hero: {
      kicker: '커리어',
      tagline: '현재 공개 활동 기록을 바탕으로 정리한 소프트웨어, 로보틱스, 문서화 중심의 작업입니다.',
      viewProjects: '프로젝트 보기',
      contact: '연락하기',
    },
    about: {
      kicker: '소개',
      title: '소개',
      summary:
        '소프트웨어 구현, 로보틱스 자동화, AI 응용, 문서화 중심의 작업을 진행합니다. 상세 기록은 활동 페이지에 유지하고, 이 화면에서는 먼저 살펴볼 경험을 간결하게 정리했습니다.',
      bullets: [
        'ROS2 기반 로보틱스와 자동화 시스템',
        '음성, 인터랙션, 모델 연동이 포함된 AI 응용 프로젝트',
        '문서화와 인수인계가 중요한 구현형 작업',
        '교육, 오픈소스, 운영 지원을 포함한 개발 경험',
      ],
    },
    skills: { kicker: '기술', title: '기술' },
    experience: {
      kicker: '경험',
      title: '경험과 활동',
      groups: {
        Education: '교육',
        'Work and support': '근로 및 지원',
        'Projects and open source': '프로젝트 및 오픈소스',
      },
    },
    projects: { kicker: '프로젝트', title: '프로젝트' },
    contact: {
      kicker: '연락처',
      title: '연락하기',
      description: '새로운 프로젝트나 협업 제안은 아래 채널로 편하게 연락 주세요.',
    },
    detail: {
      project: '프로젝트',
      readCaseStudy: '프로젝트 자세히 보기 →',
      readActivity: '활동 자세히 보기 →',
      close: '닫기',
    },
    legacyNav: {
      profile: '프로필',
      resume: '이력',
      work: '작업',
      writing: '글',
      activities: '활동',
    },
    aria: {
      copyEmail: '이메일 주소 복사',
      copyPhone: '전화번호 복사',
      visitGithub: 'GitHub 프로필 방문',
      copied: '복사됨',
    },
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      skills: 'Skills',
      experience: 'Experience',
      projects: 'Projects',
      contact: 'Contact',
      sectionNavigation: 'Section navigation',
    },
    hero: {
      kicker: 'Career',
      tagline: 'Software, robotics, and documentation-oriented work drawn from my current public activity archive.',
      viewProjects: 'View Projects',
      contact: 'Contact',
    },
    about: {
      kicker: 'About',
      title: 'About Me',
      summary:
        'I work across software implementation, robotics automation, applied AI, and documentation. Detailed records remain in the activity pages, while this page highlights the best places to start.',
      bullets: [
        'ROS2-based robotics and automation systems',
        'Applied AI projects involving voice, interaction, and model integration',
        'Implementation work where documentation and handoff matter',
        'Development experience spanning education, open source, and operations support',
      ],
    },
    skills: { kicker: 'Skills', title: 'Skills' },
    experience: {
      kicker: 'Experience',
      title: 'Experience & Activities',
      groups: {
        Education: 'Education',
        'Work and support': 'Work and support',
        'Projects and open source': 'Projects and open source',
      },
    },
    projects: { kicker: 'Projects', title: 'Projects' },
    contact: {
      kicker: 'Contact',
      title: 'Get in Touch',
      description: 'Feel free to reach out through the channels below for projects or collaboration opportunities.',
    },
    detail: {
      project: 'Project',
      readCaseStudy: 'Read full case study →',
      readActivity: 'Read full activity →',
      close: 'Close',
    },
    legacyNav: {
      profile: 'Profile',
      resume: 'Resume',
      work: 'Work',
      writing: 'Writing',
      activities: 'Activities',
    },
    aria: {
      copyEmail: 'Copy email address',
      copyPhone: 'Copy phone number',
      visitGithub: 'Visit GitHub profile',
      copied: 'Copied',
    },
  },
} as const;

const experienceEnglish: Record<string, Pick<ExperienceEntry, 'title' | 'description'>> = {
  '/activities/sungil-information-high-school': {
    title: 'Sungil Information High School, Digital Information',
    description: 'The educational foundation for my early path into software and information technology.',
  },
  '/activities/inha-technical-college-and-academic-creditbank-system': {
    title: 'Inha Technical College and Computer Engineering Studies',
    description: 'A core period spanning major studies, projects, open source, and student activities.',
  },
  '/activities/itc-work-scholarship': {
    title: 'AI & Big Data Center Work-Study Scholarship',
    description: 'Server setup and operations support, Docker environments, documentation, and handoff.',
  },
  '/activities/assistant': {
    title: 'Lecture and Event Support',
    description: 'Hands-on, technical, and operational support for teacher training and education events.',
  },
  '/activities/open_source_contribution_academy': {
    title: '2022 Open Source Contribution Academy / RustPython',
    description: 'Open-source contribution, collaboration experience, and a grand prize.',
  },
  '/activities/stonespring': {
    title: 'StoneSpring',
    description: 'Team lead for a real-time care chatbot system project.',
  },
  '/activities/shoepernoma': {
    title: 'Shoepernoma',
    description: 'Team lead for a ROS2-based autonomous shoe-picking robot system.',
  },
};

const projectEnglish: Record<
  string,
  Pick<ProjectSummary, 'title' | 'description' | 'highlights' | 'type' | 'role'>
> = {
  shoepernoma: {
    title: 'Shoepernoma',
    type: 'Team Project',
    role: 'Team Lead',
    description: 'A ROS2-based autonomous shoe-picking robot system integrating perception, navigation, and precision docking.',
    highlights: ['Robotics system integration', 'Perception and control pipeline', 'Documentation-driven team delivery'],
  },
  stonespring: {
    title: 'StoneSpring',
    type: 'Team Project',
    role: 'Team Lead',
    description: 'A real-time care chatbot combining a GUI, AI model integration, and audio interaction.',
    highlights: ['GUI-based application', 'Model integration and real-time interaction', 'Team-level feature integration'],
  },
  'pdf-to-question-bank': {
    title: 'PDF to Question Bank',
    type: 'Personal Project',
    role: undefined,
    description: 'A personal CLI tool that converts PDF and image content into a reusable question-bank workflow.',
    highlights: ['Document-processing automation', 'CLI-centered implementation', 'End-to-end processing pipeline'],
  },
  codeb: {
    title: 'AI Education Python Block Programming Web Platform',
    type: 'Team Project',
    role: undefined,
    description: 'A browser-based visual Python programming platform designed for AI education.',
    highlights: ['Educational web tooling', 'Browser-based execution environment', 'Maintenance and classroom application'],
  },
};

export function localizeExperience(entry: ExperienceEntry, locale: Locale): ExperienceEntry {
  if (locale === 'ko') {
    return entry;
  }

  const translation = experienceEnglish[entry.href];
  return translation ? { ...entry, ...translation } : entry;
}

export function localizeProject(project: ProjectSummary, locale: Locale): ProjectSummary {
  if (locale === 'ko') {
    return project;
  }

  const translation = projectEnglish[project.slug];
  return translation ? { ...project, ...translation } : project;
}
