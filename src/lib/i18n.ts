import type { ExperienceEntry, ProjectSummary } from '@/lib/portfolio';

export type Locale = 'ko' | 'en';

export const homeCopy = {
  ko: {
    nav: {
      about: '소개',
      skills: '기술',
      experience: '경험',
      projects: '직무 관련 경험',
      sectionNavigation: '섹션 탐색',
    },
    hero: {
      kicker: '커리어',
      tagline: '현재 공개 활동 기록을 바탕으로 정리한 소프트웨어, 로보틱스, 문서화 중심의 작업입니다.',
      viewProjects: '프로젝트 보기',
      contact: '연락하기',
    },
    about: {
      title: '소개',
      summary:
        '서로 떨어진 기능을 하나의 흐름으로 연결하는 일을 좋아하는 개발자 김연우입니다. 로봇이 움직이고 화면이 반응하며 서버에 기록이 남는 데 필요한 부분을 직접 만들고 이어 왔습니다. ROS2 로봇 시스템, AI 챗봇, 문서 처리 도구를 만들었고, 팀 프로젝트에서는 전체 구조와 기능 통합을 주로 맡았습니다. 다른 사람이 작업을 이어받을 수 있도록 코드와 문서를 함께 정리합니다.',
      bullets: [
        '주행·인식·GUI·서버를 연결한 로봇 시스템 통합',
        'Python과 웹 기술을 활용한 반복 작업 도구화',
        '팀장으로서 전체 흐름 설계와 기능 통합 조율',
        '유지보수와 인수인계를 고려한 작업 과정 문서화',
      ],
    },
    skills: { title: '기술' },
    experience: {
      title: '경험과 활동',
      more: '경험과 활동 더보기',
      groups: {
        Education: '학력',
        Activities: '활동',
        'Work experience': '직무 관련 경험',
      },
    },
    projects: { title: '직무 관련 경험', more: '직무 관련 경험 더보기' },
    contact: {
      title: '연락하기',
      description: '새로운 프로젝트나 협업 제안은 아래 채널로 편하게 연락 주세요.',
    },
    detail: {
      project: '프로젝트',
      close: '닫기',
      resize: '상세 패널 너비 조절',
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
      about: 'About',
      skills: 'Skills',
      experience: 'Experience',
      projects: 'Work Experience',
      sectionNavigation: 'Section navigation',
    },
    hero: {
      kicker: 'Career',
      tagline: 'Software, robotics, and documentation-oriented work drawn from my current public activity archive.',
      viewProjects: 'View Projects',
      contact: 'Contact',
    },
    about: {
      title: 'About Me',
      summary:
        "I'm Yeonwoo Kim, a developer who likes connecting separate pieces until the whole thing works. I've built ROS2 robot systems, AI chatbots, and document-processing tools, often taking care of the overall structure and integration on team projects. I keep the code and documentation organized so someone else can pick up the work easily.",
      bullets: [
        'Robot system integration across navigation, perception, GUI, and server modules',
        'Python and web tools for repetitive task automation',
        'Team leadership focused on overall flow and feature integration',
        'Process documentation for maintenance and handoff',
      ],
    },
    skills: { title: 'Skills' },
    experience: {
      title: 'Experience & Activities',
      more: 'View all experience & activities',
      groups: {
        Education: 'Education',
        Activities: 'Activities',
        'Work experience': 'Work Experience',
      },
    },
    projects: { title: 'Work Experience', more: 'View all work experience' },
    contact: {
      title: 'Get in Touch',
      description: 'Feel free to reach out through the channels below for projects or collaboration opportunities.',
    },
    detail: {
      project: 'Project',
      close: 'Close',
      resize: 'Resize detail panel',
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
    description: 'Graduated after studying the foundations of programming, networking, and server administration.',
  },
  '/activities/inha-technical-college-and-academic-creditbank-system': {
    title: 'Inha Technical College · B.S. in Computer Engineering',
    description: 'Studied Computer Systems at Inha Technical College, then earned a B.S. in Computer Engineering through the Academic Credit Bank System.',
  },
  '/activities/kdt-addinedu': {
    title: 'AddinEdu IT Academy',
    description: 'Completed an ROS2 and AI autonomous robot development program, receiving the top final-project award and a contribution award.',
  },
  '/activities/korcham-ondevice-ai-semiconductor': {
    title: 'Gyeonggi Fabless Academy · On-Device AI System Semiconductor Design, Cohort 2',
    description: 'Currently completing a program covering RTL design and verification, RV32I and AXI-based SoC integration, and ARM Cortex-M4 device programming.',
  },
  '/activities/itc-work-scholarship': {
    title: 'AI & Big Data Center Work-Study Scholarship',
    description: 'Supported server and infrastructure operations, planned and presented a technical seminar, and documented the handoff.',
  },
  '/activities/assistant': {
    title: 'Course Content and Event Operations Support',
    description: 'Created and supported teacher-training and K-Digital course content, then helped operate a metaverse science festival.',
  },
  '/activities/open_source_contribution_academy': {
    title: '2022 Open Source Contribution Academy',
    description: 'Contributed to RustPython as a lead mentee, learned open-source collaboration, and received the grand prize.',
  },
  '/activities/skills-competition-cyber-security': {
    title: 'Gyeonggi Skills Competition - Cybersecurity',
    description: 'Configured Windows and Linux servers and network-security environments, earning a gold medal in cybersecurity.',
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
  greent: {
    title: 'GreenT',
    type: 'Team Project',
    role: 'System Controller Development',
    description: 'An IoT smart-farming system connecting sensors, actuators, Raspberry Pi, Arduino, and a Flask backend.',
    highlights: ['Sensor and actuator control', 'Raspberry Pi and Arduino integration', 'Flask and serial communication'],
  },
  healthcasting: {
    title: 'HealthCasting',
    type: 'Team Project',
    role: 'Team Lead / Trend Data',
    description: 'A health-alert system using search trends, weather data, and exploratory data analysis.',
    highlights: ['Search-trend data collection', 'External data integration and EDA', 'Time-series correlation analysis'],
  },
  pyodide: {
    title: 'Pyodide',
    type: 'Open Source',
    role: 'Contributor',
    description: 'An open-source contribution improving shortened representations in the WebAssembly-based Python runtime.',
    highlights: ['WebAssembly-based Python runtime', 'Representation shortening logic', 'Independent open-source contribution'],
  },
  rustpython: {
    title: 'RustPython',
    type: 'Open Source',
    role: 'Contributor',
    description: 'Open-source contributions to Python interpreter internals, standard-library behavior, and object compatibility.',
    highlights: ['Python interpreter internals', 'Standard-library compatibility', 'Code review and pull-request collaboration'],
  },
  'pdf-to-question-bank': {
    title: 'PDF to Question Bank',
    type: 'Personal Project',
    role: undefined,
    description: 'A personal CLI tool that converts PDF and image content into a reusable question-bank workflow.',
    highlights: ['Document-processing automation', 'CLI-centered implementation', 'End-to-end processing pipeline'],
  },
  codeb: {
    title: 'DIY/CodeB - Python Visual Programming for AI Education',
    type: 'Team Project',
    role: undefined,
    description: 'A browser-based visual Python programming platform designed for AI education.',
    highlights: ['Educational web tooling', 'Browser-based execution environment', 'Maintenance and classroom application'],
  },
  'inha-air': {
    title: 'INHA AIR',
    type: 'Team Project',
    role: 'User Flow and GUI Development',
    description: 'A Java Swing airline-booking application covering account flows, booking inputs, date selection, and validation.',
    highlights: ['Java Swing GUI', 'Booking input and validation flow', 'Feature integration and bug fixing'],
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
