import type { ExperienceEntry, ProjectSummary } from '@/lib/portfolio';

export type Locale = 'ko' | 'en';

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
      kicker: '커리어',
      tagline: '온디바이스 AI 시스템반도체 설계·검증 역량을 쌓고 있는 주니어 엔지니어입니다.',
      viewProjects: '설계·검증 경험 보기',
      contact: '연락하기',
    },
    about: {
      title: '소개',
      summary:
        '온디바이스 AI 시스템반도체 설계·검증을 목표로 RTL부터 SoC와 임베디드 펌웨어까지 학습하고 있는 김연우입니다. Verilog·SystemVerilog로 디지털 회로를 설계하고 UVM으로 검증했으며, RV32I CPU와 AXI4-Lite 기반 SoC, ARM Cortex-M4 주변장치 제어를 실습했습니다. 이전에 쌓은 소프트웨어·로보틱스 경험은 설계 자동화, 보드 제어, 시스템 통합과 기술 문서화에 활용하고 있습니다.',
      bullets: [
        'Verilog 기반 디지털 회로·FSM·UART·FIFO 설계',
        'SystemVerilog·UVM 기반 testbench와 scoreboard 검증',
        'RV32I CPU, APB·AXI4-Lite, MicroBlaze SoC 구조 실습',
        'ARM Cortex-M4에서 GPIO·UART·Timer·Interrupt·I2C·SPI·ADC·DMA 제어',
        '소프트웨어·로보틱스 경험을 활용한 시스템 통합과 기술 문서화',
      ],
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
      description: '온디바이스 AI와 시스템반도체 설계·검증 관련 채용 또는 협업 제안은 아래 채널로 연락해 주세요.',
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
      kicker: 'Career',
      tagline: 'A junior engineer working toward a career in on-device AI semiconductor design and verification.',
      viewProjects: 'View Design & Verification Experience',
      contact: 'Contact',
    },
    about: {
      title: 'About Me',
      summary:
        "I'm Yeonwoo Kim, working toward on-device AI semiconductor design and verification from RTL through SoC integration and embedded firmware. I have designed digital logic in Verilog, built SystemVerilog and UVM verification environments, and worked through RV32I, AXI4-Lite, MicroBlaze, and ARM Cortex-M4 peripheral control. I use my earlier software and robotics experience as a supporting strength for design automation, board-level integration, and technical documentation.",
      bullets: [
        'Digital logic, FSM, UART, and FIFO design in Verilog',
        'SystemVerilog and UVM testbenches with scoreboard-based verification',
        'RV32I CPU, APB, AXI4-Lite, and MicroBlaze SoC practice',
        'ARM Cortex-M4 control of GPIO, UART, timers, interrupts, I2C, SPI, ADC, and DMA',
        'System integration and technical documentation supported by software and robotics experience',
      ],
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
      description: 'For opportunities related to on-device AI and semiconductor design or verification, please reach out through the channels below.',
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
    description: 'Currently completing a program spanning RTL design and verification, RV32I and AXI-based SoC integration, and ARM Cortex-M4 bare-metal peripheral control through interrupts, I2C, SPI, ADC, and DMA.',
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
