import { getActivityBySlug } from '@/lib/content';
import { formatActivityDate } from '@/lib/utils/date';

export interface HeroContent {
  kicker: string;
  name: string;
  tagline: string;
}

export interface AboutContent {
  summary: string;
  bullets: string[];
}

export interface SkillGroup {
  title: string;
  skills: string[];
}

export interface ExperienceEntry {
  group: 'Education' | 'Activities' | 'Work experience';
  title: string;
  dateRange: string;
  description: string;
  href: string;
}

export interface ProjectSummary {
  slug: string;
  title: string;
  dateRange: string;
  role?: string;
  type?: string;
  description: string;
  tags: string[];
  thumbnailUrl?: string;
  thumbnailHasExplicitSize: boolean;
  highlights: string[];
  href: string;
}

export type PortfolioDetailContent = Record<string, string>;

// Content below is carried over verbatim (or lightly restructured) from the
// curated career sources and activity frontmatter. This page re-presents
// existing public content; it does not author new claims.

export function getHeroContent(): HeroContent {
  return {
    kicker: 'Career',
    name: '김연우 | Gim Yeonwoo',
    tagline: 'Software, robotics, and documentation-oriented work built from the current public activity archive.',
  };
}

export function getAboutContent(): AboutContent {
  return {
    summary:
      '서로 떨어진 기능을 하나의 흐름으로 연결하는 일을 좋아하는 개발자 김연우입니다. 로봇이 움직이고 화면이 반응하며 서버에 기록이 남는 데 필요한 부분을 직접 만들고 이어 왔습니다. ROS2 로봇 시스템, AI 챗봇, 문서 처리 도구를 만들었고, 팀 프로젝트에서는 전체 구조와 기능 통합을 주로 맡았습니다. 다른 사람이 작업을 이어받을 수 있도록 코드와 문서를 함께 정리합니다.',
    bullets: [
      '주행·인식·GUI·서버를 연결한 로봇 시스템 통합',
      'Python과 웹 기술을 활용한 반복 작업 도구화',
      '팀장으로서 전체 흐름 설계와 기능 통합 조율',
      '유지보수와 인수인계를 고려한 작업 과정 문서화',
    ],
  };
}

export function getSkillGroups(): SkillGroup[] {
  return [
    {
      title: 'Robotics & Automation',
      skills: ['ROS2', 'Nav2', 'SLAM', 'ArUco', 'YOLOv8', 'Automation', 'TCP/UDP', 'Database'],
    },
    {
      title: 'AI & Interaction',
      skills: ['OpenAI / GPT', 'STT', 'TTS', 'Chatbot', 'PyQt', 'Visual Programming', 'Pyodide', 'WebAssembly'],
    },
    {
      title: 'Software & Tooling',
      skills: ['Python', 'PDF / Image Processing', 'CLI Automation', 'RustPython'],
    },
    {
      title: 'Infrastructure & Operations',
      skills: ['Docker', 'Server Operations', 'Documentation & Handoff', 'Education Support'],
    },
  ];
}

export function getExperienceEntries(): ExperienceEntry[] {
  return [
    {
      group: 'Education',
      title: '인하공업전문대학 컴퓨터시스템과 · 학점은행제 컴퓨터공학',
      dateRange: '2020.03 - 2025.08',
      description: '인하공업전문대학 컴퓨터시스템과 과정 이후 학점은행제 컴퓨터공학 학사 학위를 취득했습니다.',
      href: '/activities/inha-technical-college-and-academic-creditbank-system',
    },
    {
      group: 'Education',
      title: '성일정보고등학교 디지털정보과',
      dateRange: '2017.03 - 2020.01',
      description: '디지털정보과를 졸업하며 프로그래밍, 네트워크, 서버 기초를 익혔습니다.',
      href: '/activities/sungil-information-high-school',
    },
    {
      group: 'Activities',
      title: '경기도 팹리스 아카데미 · 온디바이스AI 시스템반도체 설계 2기',
      dateRange: '2026.03 - 2026.10',
      description: 'RTL 설계와 검증, RV32I·AXI 기반 SoC, ARM Cortex-M4 디바이스 프로그래밍을 다루는 교육과정을 수강하고 있습니다.',
      href: '/activities/korcham-ondevice-ai-semiconductor',
    },
    {
      group: 'Activities',
      title: '애드인에듀 IT 아카데미',
      dateRange: '2024.11 - 2025.05',
      description: 'ROS2와 AI를 활용한 자율주행 로봇 개발자 양성과정을 수료하고 최종 프로젝트 최우수상과 공로상을 수상했습니다.',
      href: '/activities/kdt-addinedu',
    },
    {
      group: 'Activities',
      title: '2022 오픈소스 컨트리뷰션 아카데미',
      dateRange: '2022.07 - 2022.10',
      description: 'RustPython 프로젝트 리드멘티로 활동하며 오픈소스 기여와 협업을 경험했고 대상을 수상했습니다.',
      href: '/activities/open_source_contribution_academy',
    },
    {
      group: 'Activities',
      title: '교육 콘텐츠 제작 및 행사 운영 지원',
      dateRange: '2021.07 - 2022.10',
      description: '교사 직무연수와 K-디지털 강의 콘텐츠를 제작·지원하고, 인천과학대제전 메타버스 행사를 운영했습니다.',
      href: '/activities/assistant',
    },
    {
      group: 'Work experience',
      title: '인하공업전문대학 인공지능빅데이터센터 근로장학생',
      dateRange: '2021.09 - 2022.01',
      description: '서버·인프라 운영을 지원하고, 기술 세미나 기획·발표와 인수인계 문서화를 진행했습니다.',
      href: '/activities/itc-work-scholarship',
    },
    {
      group: 'Work experience',
      title: '경기도 기능경기대회 사이버보안',
      dateRange: '2019.04',
      description: 'Windows·Linux 서버와 네트워크 보안 환경을 구성하고 사이버보안 직종 금메달을 수상했습니다.',
      href: '/activities/skills-competition-cyber-security',
    },
  ];
}

const CURATED_PROJECT_SLUGS = [
  'shoepernoma',
  'stonespring',
  'greent',
  'healthcasting',
  'pyodide',
  'rustpython',
  'codeb',
  'inha-air',
  'pdf-to-question-bank',
] as const;

const PROJECT_HIGHLIGHTS: Record<(typeof CURATED_PROJECT_SLUGS)[number], string[]> = {
  shoepernoma: [
    '로보틱스 시스템 통합',
    '인식 및 제어 파이프라인 구성',
    '문서와 구현을 함께 묶는 프로젝트 운영',
  ],
  stonespring: [
    'GUI 기반 응용 프로젝트',
    '모델 연동과 실시간 인터랙션',
    '팀 단위 기능 통합',
  ],
  greent: [
    '센서·액추에이터 제어',
    'Raspberry Pi·Arduino 연동',
    'Flask·시리얼 통신 구성',
  ],
  healthcasting: [
    '검색 트렌드 데이터 수집',
    '외부 데이터 통합과 EDA',
    '시계열 상관 분석',
  ],
  pyodide: [
    'WebAssembly 기반 Python 런타임',
    '출력 축약 로직 개선',
    '독립 오픈소스 기여',
  ],
  rustpython: [
    'Python 인터프리터 내부 구현',
    '표준 라이브러리 호환성 개선',
    '코드 리뷰와 PR 협업',
  ],
  'pdf-to-question-bank': [
    '문서 처리 자동화',
    'CLI 중심 개인 도구 구현',
    '작은 범위에서 끝까지 닫는 처리 파이프라인',
  ],
  codeb: [
    '교육용 웹 도구 개발',
    '브라우저 기반 실행 환경',
    '기능 유지보수와 현장 적용 경험',
  ],
  'inha-air': [
    'Java Swing GUI 구현',
    '예약 입력과 검증 흐름 개발',
    '팀 기능 병합과 오류 수정',
  ],
};

export function getFeaturedProjects(): ProjectSummary[] {
  const projects: ProjectSummary[] = [];

  for (const slug of CURATED_PROJECT_SLUGS) {
    const activity = getActivityBySlug(slug);
    if (!activity) {
      continue;
    }

    const { frontMatter, thumbnailUrl, thumbnailHasExplicitSize } = activity;
    const { startDate, endDate, date } = frontMatter;
    const dateRange = (startDate || endDate)
      ? formatActivityDate(startDate, endDate)
      : formatActivityDate(date);

    projects.push({
      slug,
      title: frontMatter.title,
      dateRange,
      role: frontMatter.role,
      type: frontMatter.type,
      description: frontMatter.description,
      tags: frontMatter.tech_stack ?? frontMatter.tags ?? [],
      thumbnailUrl,
      thumbnailHasExplicitSize: thumbnailHasExplicitSize ?? false,
      highlights: PROJECT_HIGHLIGHTS[slug],
      href: `/activities/${slug}`,
    });
  }

  return projects;
}

export function getPortfolioDetailContent(
  experience: ExperienceEntry[],
  projects: ProjectSummary[]
): PortfolioDetailContent {
  const paths = new Set([
    ...experience.map((entry) => entry.href),
    ...projects.map((project) => project.href),
  ]);

  return Object.fromEntries(
    Array.from(paths, (href) => {
      const slug = href.split('/').filter(Boolean).at(-1);
      const activity = slug ? getActivityBySlug(slug) : null;
      return [href, activity?.content ?? ''];
    })
  );
}
