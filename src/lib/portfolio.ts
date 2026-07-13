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
  group: 'Education' | 'Work and support' | 'Projects and open source';
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
// existing curated summary surfaces (profile.md / resume.md / work.md) and
// activity frontmatter, per the Vault/Career publication boundary: this page
// re-presents existing curated public content, it does not author new claims.

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
      title: '성일정보고등학교 디지털정보과',
      dateRange: '2017.03 - 2019.02',
      description: '소프트웨어와 정보 계열 진로의 초기 기반이 된 교육 과정입니다.',
      href: '/activities/sungil-information-high-school',
    },
    {
      group: 'Education',
      title: '인하공업전문대학 및 학점은행제 컴퓨터공학 과정',
      dateRange: '2020.03 - 2025.08',
      description: '전공 학습, 프로젝트, 오픈소스, 동아리 활동이 이어진 중심 시기입니다.',
      href: '/activities/inha-technical-college-and-academic-creditbank-system',
    },
    {
      group: 'Work and support',
      title: '인공지능 빅데이터센터 근로장학생',
      dateRange: '2021.09 - 2022.01',
      description: '서버 구축 및 운영 지원, Docker 환경 구성, 문서화와 인수인계',
      href: '/activities/itc-work-scholarship',
    },
    {
      group: 'Work and support',
      title: '강의 및 행사 보조',
      dateRange: '2021 - 2022',
      description: '교사연수와 교육 행사에서 실습 지원, 기술 보조, 운영 지원',
      href: '/activities/assistant',
    },
    {
      group: 'Projects and open source',
      title: '2022 오픈소스컨트리뷰션아카데미 / RustPython',
      dateRange: '2022',
      description: '오픈소스 프로젝트 기여와 협업 경험, 대상 수상',
      href: '/activities/open_source_contribution_academy',
    },
    {
      group: 'Projects and open source',
      title: 'StoneSpring',
      dateRange: '2025.02 - 2025.04',
      description: '실시간 돌봄 챗봇 시스템 팀 프로젝트, 팀장',
      href: '/activities/stonespring',
    },
    {
      group: 'Projects and open source',
      title: 'Shoepernoma',
      dateRange: '2025.04 - 2025.05',
      description: 'ROS2 기반 신발 피킹 로봇 시스템 팀 프로젝트, 팀장',
      href: '/activities/shoepernoma',
    },
  ];
}

const CURATED_PROJECT_SLUGS = ['shoepernoma', 'stonespring', 'pdf-to-question-bank', 'codeb'] as const;

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
