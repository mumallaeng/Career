import type { ExperienceEntry, ProjectSummary } from '@/lib/portfolio';

export type Locale = 'ko' | 'en';

export const LANGUAGE_STORAGE_KEY = 'career-language';
export const DEFAULT_LOCALE: Locale = 'ko';

export function localeFromLanguageTags(languages: readonly string[]): Locale {
  for (const language of languages) {
    const primaryLanguage = language.toLowerCase().split('-')[0];
    if (primaryLanguage === 'ko' || primaryLanguage === 'en') {
      return primaryLanguage;
    }
  }
  return DEFAULT_LOCALE;
}

export const homeCopy = {
  ko: {
    nav: {
      about: '소개',
      skills: '기술',
      experience: '활동',
      projects: '경험',
      sectionNavigation: '섹션 탐색',
    },
    hero: {
      tagline: '소프트웨어 경험으로, 시스템과 로직을 연결하는 엔지니어',
    },
    about: {
      title: '소개',
      summary:
        '소프트웨어 개발에서 출발해 RTL 설계로 영역을 넓힌 신입 하드웨어 엔지니어 김연우입니다. 관심 있던 분야를 직접 경험해 보며 AI 블록 코딩 플랫폼 개발과 서버 운영, 로봇 소프트웨어 개발을 거쳤고, 시스템반도체 설계에서 RISC-V CPU를 ISA에 맞춰 설계하며 써 온 언어가 명령으로 바뀌어 실행되는 경로가 회로에서 그대로 이어진다는 것을 직접 확인했습니다. 이후 CNN 가속기의 연산 블록과 AXI4-Lite I2C IP를 설계하고 UVM과 FPGA 보드 실측으로 검증하며, 회로부터 그 위의 시스템까지 이어지는 경로를 직접 설계하는 엔지니어를 목표로 하고 있습니다.',
      bullets: [],
    },
    skills: { title: '기술 스택' },
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
      description: '채용 또는 협업 제안은 아래 채널로 연락해 주세요.',
    },
    detail: {
      close: '닫기',
      resize: '상세 패널 너비 조절',
      expand: '상세 페이지 크게 보기',
      collapse: '분할 화면으로 돌아가기',
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
      experience: 'Activities',
      projects: 'Experience',
      sectionNavigation: 'Section navigation',
    },
    hero: {
      tagline: 'An engineer who connects systems and logic through software experience',
    },
    about: {
      title: 'About Me',
      summary:
        "I am Yeonwoo Gim, a junior hardware engineer who started in software development and expanded into RTL design. After exploring the fields I was curious about, through an AI block-coding platform, server operation, and robot software, I designed a RISC-V CPU in a system semiconductor course and saw first-hand that the path from the languages I had used to executed instructions continues directly into the circuit. I have since designed a CNN accelerator block and an AXI4-Lite I2C IP, verified them with UVM and FPGA board measurements, and aim to design the whole path from circuits up to the system.",
      bullets: [],
    },
    skills: { title: 'Technical Stack' },
    experience: {
      title: 'Experience & Activities',
      more: 'View all experience & activities',
      groups: {
        Education: 'Education',
        Activities: 'Activities',
        'Work experience': 'Work-Related Experience',
      },
    },
    projects: { title: 'Work-Related Experience', more: 'View all work-related experience' },
    contact: {
      title: 'Get in Touch',
      description: 'For hiring or collaboration, please reach out through the channels below.',
    },
    detail: {
      close: 'Close',
      resize: 'Resize detail panel',
      expand: 'Expand detail view',
      collapse: 'Return to split view',
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
  '/activities/inha-technical-college-computer-system': {
    title: 'Inha Technical College, Computer Systems',
    description: 'Studied Computer Systems at Inha Technical College (withdrew).',
  },
  '/activities/academic-creditbank-computer-engineering': {
    title: 'Academic Credit Bank System · B.S. in Computer Engineering',
    description: 'Completed accredited coursework and earned a B.S. in Computer Engineering through the Academic Credit Bank System.',
  },
  '/activities/kdt-addinedu': {
    title: 'AddinEdu IT Academy',
    description: 'Completed an ROS2 and AI autonomous robot development program, receiving the top final-project award and a contribution award.',
  },
  '/activities/korcham-ondevice-ai-semiconductor': {
    title: 'Gyeonggi Fabless Academy Cohort 1 · On-Device AI System Semiconductor Design, Cohort 2',
    description: 'A 980-hour program covering Verilog, SystemVerilog, and UVM design and verification, RV32I and AXI4-Lite SoC integration, ARM Cortex-M4 bare-metal firmware, and on-device AI on Jetson, finished with a final project that built an FPGA CNN accelerator and optical link (LightLetter).',
  },
  '/activities/assistant': {
    title: 'Course Content and Event Operations Support',
    description: 'Created and supported teacher-training and K-Digital course content, then helped operate a metaverse science festival.',
  },
  '/activities/open_source_contribution_academy': {
    title: '2022 Open Source Contribution Academy',
    description: 'Contributed to RustPython as a lead mentee, learned open-source collaboration, and received the grand prize.',
  },
};

const projectEnglish: Record<
  string,
  Pick<ProjectSummary, 'title' | 'description' | 'highlights' | 'type' | 'role'>
> = {
  'korcham-ondevice-ai-mini-projects': {
    title: 'On-Device AI System Semiconductor Design, Cohort 2 · Mini Projects',
    type: 'Course Mini Projects',
    role: undefined,
    description: 'Individual and team mini projects completed by course module during the On-Device AI System Semiconductor Design program.',
    highlights: ['RTL design and SystemVerilog/UVM verification', 'RV32I CPU and AXI4-Lite SoC integration', 'ARM Cortex-M4 bare-metal firmware'],
  },
  'open-source-contributions': {
    title: 'Open Source Contributions',
    type: 'Open Source',
    role: 'Contributor',
    description: 'A collection of issue/PR contributions to RustPython, Pyodide, pyre, Chisel, FINN, RapidWright, Xilinx tooling, and VSCode Python.',
    highlights: ['RustPython, Pyodide, and pyre contributions', 'Merged PRs on Chisel, FINN, RapidWright, and Xilinx tooling', 'Grand prize at the Open Source Contribution Academy'],
  },
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
  'itc-work-scholarship': {
    title: 'AI & Big Data Center Work-Study Scholarship',
    type: 'Work Experience',
    role: 'Work-Study Student',
    description: 'Supported server and infrastructure operations, planned and presented a technical seminar, and documented operating procedures and the handoff.',
    highlights: ['Ubuntu server and infrastructure operations', 'Docker and CUDA environment setup', 'Operating documentation and handoff'],
  },
  'skills-competition-cyber-security': {
    title: 'Gyeonggi Skills Competition - Cybersecurity',
    type: 'Skills Competition',
    role: 'Gold Medal',
    description: 'Configured Windows and Linux servers and network-security environments, earning a gold medal in cybersecurity.',
    highlights: ['Windows and Linux server configuration', 'Network security and service defense', 'Gyeonggi Skills Competition gold medal'],
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
