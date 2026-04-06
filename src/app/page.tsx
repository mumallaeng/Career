import Link from 'next/link';
import { Analytics } from "@vercel/analytics/next";

export default function HomePage() {
  const surfaces = [
    {
      href: '/profile',
      title: 'Profile',
      description: '현재 public summary와 관심 분야를 짧게 확인하는 entry surface',
    },
    {
      href: '/resume',
      title: 'Resume',
      description: '활동 기록을 바탕으로 만든 bounded chronology',
    },
    {
      href: '/work',
      title: 'Work',
      description: '대표 프로젝트와 구현 중심 작업을 선별한 curation surface',
    },
    {
      href: '/writing',
      title: 'Writing',
      description: '문서화가 강한 프로젝트와 글 성격의 기록을 잇는 conservative surface',
    },
    {
      href: '/activities',
      title: 'Activities',
      description: '가장 상세한 supporting document와 기록이 남아 있는 canonical archive',
    },
  ];

  const highlights = [
    {
      href: '/activities/shoepernoma',
      title: 'Shoepernoma',
      description: 'ROS2 기반 매장 연동형 신발 피킹 로봇 시스템',
    },
    {
      href: '/activities/stonespring',
      title: 'StoneSpring',
      description: '실시간 돌봄 상호작용을 목표로 한 챗봇 GUI 프로젝트',
    },
    {
      href: '/activities/open_source_contribution_academy',
      title: '2022 오픈소스컨트리뷰션아카데미',
      description: 'RustPython 중심 오픈소스 기여와 협업 경험, 대상 수상',
    },
  ];

  return (
    <div className="home-landing">
      <section className="home-hero">
        <p className="home-kicker">Career</p>
        <h1 className="home-title">김연우 | Gim Yeonwoo</h1>
        <p className="home-description">
          소프트웨어 구현, 로보틱스 자동화, AI 응용, 그리고 문서화 중심의 작업을 진행합니다.
          현재 사이트는 `profile / resume / work / writing` surface를 기준으로 정리 중이며,
          상세한 supporting record는 계속 `activities`에 유지합니다.
        </p>
      </section>

      <section className="home-section">
        <header className="home-section-header">
          <h2 className="home-section-title">Public Surfaces</h2>
          <p className="home-section-description">
            공개용 summary surface와 deep archive의 역할을 분리한 현재 구조입니다.
          </p>
        </header>
        <div className="home-surface-grid">
          {surfaces.map((surface) => (
            <Link key={surface.href} href={surface.href} className="home-surface-card">
              <h3 className="home-surface-title">{surface.title}</h3>
              <p className="home-surface-description">{surface.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <header className="home-section-header">
          <h2 className="home-section-title">Highlighted Work</h2>
          <p className="home-section-description">
            현재 archive에서 대표성이 높은 항목만 first-pass 기준으로 연결했습니다.
          </p>
        </header>
        <div className="home-highlight-list">
          {highlights.map((item) => (
            <Link key={item.href} href={item.href} className="home-highlight-item">
              <h3 className="home-highlight-title">{item.title}</h3>
              <p className="home-highlight-description">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <Analytics />
    </div>
  );
}
