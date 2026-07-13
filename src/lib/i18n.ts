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
        '서로 떨어진 기능을 하나의 흐름으로 연결하는 일을 좋아하는 개발자 김연우입니다. 로봇이 움직이고 화면이 반응하며 서버에 기록이 남는 데 필요한 부분을 직접 만들고 이어 왔습니다. ROS2 로봇 시스템, AI 챗봇, 문서 처리 도구를 만들었고, 팀 프로젝트에서는 전체 구조와 기능 통합을 주로 맡았습니다. 다른 사람이 작업을 이어받을 수 있도록 코드와 문서를 함께 정리합니다.',
      bullets: [
        '따로 개발된 주행·인식·GUI·서버 기능을 하나의 로봇 시연으로 연결했습니다.',
        '반복하던 작업은 Python과 웹 기술로 작은 도구를 만들어 줄였습니다.',
        '팀장을 맡으면 먼저 전체 흐름을 정리하고, 팀원이 만든 기능이 맞물리도록 조율했습니다.',
        '나중에 다시 보거나 다른 사람이 이어받기 쉽도록 작업 과정을 문서로 남겼습니다.',
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
        "I'm Yeonwoo Kim, a developer who likes connecting separate pieces until the whole thing works. I've built ROS2 robot systems, AI chatbots, and document-processing tools, often taking care of the overall structure and integration on team projects. I keep the code and documentation organized so someone else can pick up the work easily.",
      bullets: [
        'Connected separately developed navigation, perception, GUI, and server modules into one robot demo.',
        'Turned repetitive work into small tools with Python and web technologies.',
        "As team lead, mapped the overall flow and helped each member's work fit together.",
        'Wrote down implementation and operating steps so the work could be handed over.',
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
