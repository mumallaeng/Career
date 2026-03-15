import Link from 'next/link';
import LocalizedDate from '@/components/LocalizedDate';
import LocalizedText from '@/components/LocalizedText';
import { getDetailData, getFeaturedWork, getProfileData } from '@/lib/content';

const coreStrengths = [
  {
    ko: '복잡한 시스템의 핵심 경로를 빠르게 파악합니다.',
    en: 'I identify the critical paths in complex systems quickly.',
  },
  {
    ko: '문서, 규칙, 스크립트를 함께 정리해 재사용성을 높입니다.',
    en: 'I package documents, rules, and scripts together to increase reuse.',
  },
  {
    ko: 'ROS2, AI, 데이터, 서비스 요소를 한 흐름으로 묶습니다.',
    en: 'I connect ROS2, AI, data, and service components into one working flow.',
  },
  {
    ko: '학습과 실무 기록을 구조화해 다음 작업 비용을 낮춥니다.',
    en: 'I structure learning and execution records so the next iteration costs less.',
  },
];

export default function ResumePage() {
  const profile = getProfileData();
  const featuredWork = getFeaturedWork(4);
  const affiliations = getDetailData('affiliation').slice(0, 4);

  return (
    <div className="activities-container resume-page">
      <header className="career-section-header page-header resume-page-header">
        <div>
          <p className="career-section-label">Resume</p>
          <LocalizedText as="h1" className="career-section-title" en="Condensed Career Snapshot" ko="핵심 이력 요약" />
        </div>
        <LocalizedText
          as="p"
          className="career-summary compact"
          en={profile?.frontMatter.summary_en ?? profile?.frontMatter.summary ?? 'A quick read of the core strengths, direction, and key milestones.'}
          ko={profile?.frontMatter.summary ?? '주요 역량과 이력의 핵심만 빠르게 훑어볼 수 있게 정리합니다.'}
        />
      </header>

      <section className="resume-summary-grid">
        <article className="resume-summary-panel">
          <p className="career-note-label">Summary</p>
          <div className="career-inline-copy">
            <LocalizedText
              as="p"
              className="career-inline-paragraph"
              en="I focus on reading unfamiliar systems quickly and turning them into outputs a team can reuse."
              ko="낯선 시스템의 구조를 빠르게 읽고, 팀이 다시 사용할 수 있는 결과물로 정리하는 일을 중심에 두고 있습니다."
            />
            <LocalizedText
              as="p"
              className="career-inline-paragraph"
              en="My work has moved through information security, open source, web, data, IoT, and ROS2 robotics, with implementation and operational standards handled together."
              ko="정보보안, 오픈소스, 웹, 데이터, IoT, ROS2 로보틱스를 거치며 구현과 운영 기준을 함께 다루는 방식으로 경험을 쌓아 왔습니다."
            />
          </div>
          <div className="career-actions">
            <Link href="/cv" className="career-primary-link">
              <LocalizedText en="Open CV" ko="CV 보기" />
            </Link>
            <Link href="/detail" className="career-secondary-link">
              <LocalizedText en="Open Detail" ko="Detail 보기" />
            </Link>
          </div>
        </article>

        <aside className="resume-side-panel">
          <div className="resume-facts-card">
            <LocalizedText as="p" className="career-note-label" en="At a glance" ko="한눈에 보기" />
            <dl className="resume-facts-list">
              <div>
                <LocalizedText as="dt" en="Role" ko="역할" />
                <dd>Robot System Software Engineer</dd>
              </div>
              <div>
                <LocalizedText as="dt" en="Location" ko="위치" />
                <dd>Seongnam, Gyeonggi-do, South Korea</dd>
              </div>
              <div>
                <LocalizedText as="dt" en="Email" ko="이메일" />
                <dd>mumallaeng@icloud.com</dd>
              </div>
              <div>
                <dt>GitHub</dt>
                <dd>github.com/mumallaeng</dd>
              </div>
            </dl>
          </div>
        </aside>
      </section>

      <section className="career-section">
        <div className="career-section-header">
          <div>
            <p className="career-section-label">Strength</p>
            <LocalizedText as="h2" className="career-section-title" en="Core Strengths" ko="핵심 역량" />
          </div>
        </div>
        <div className="resume-strength-grid">
          {coreStrengths.map(item => (
            <article key={item.ko} className="resume-strength-card">
              <LocalizedText as="p" en={item.en} ko={item.ko} />
            </article>
          ))}
        </div>
      </section>

      <section className="career-section">
        <div className="career-section-header">
          <div>
            <p className="career-section-label">Snapshot</p>
            <LocalizedText as="h2" className="career-section-title" en="Quick Timeline View" ko="빠르게 보는 흐름" />
          </div>
        </div>
        <div className="resume-snapshot-grid">
          <article className="resume-list-card">
            <div className="resume-list-header">
              <LocalizedText as="h3" en="Affiliation" ko="소속·이력" />
              <Link href="/detail/affiliation" className="career-section-link">
                <LocalizedText en="View all" ko="전체 보기" />
              </Link>
            </div>
            <div className="resume-linked-list">
              {affiliations.map(item => (
                <Link key={item.slug} href={item.publicPath} className="resume-linked-item">
                  <span className="resume-linked-title">
                    <LocalizedText en={item.frontMatter.title_en ?? item.frontMatter.title} ko={item.frontMatter.title} />
                  </span>
                  <LocalizedDate
                    className="resume-linked-meta"
                    startDate={item.frontMatter.startDate}
                    endDate={item.frontMatter.endDate}
                  />
                </Link>
              ))}
            </div>
          </article>

          <article className="resume-list-card">
            <div className="resume-list-header">
              <LocalizedText as="h3" en="Selected detail" ko="대표 작업" />
              <Link href="/detail/work" className="career-section-link">
                <LocalizedText en="View all" ko="전체 보기" />
              </Link>
            </div>
            <div className="resume-linked-list">
              {featuredWork.map(item => (
                <Link key={item.slug} href={item.publicPath} className="resume-linked-item">
                  <span className="resume-linked-title">
                    <LocalizedText en={item.frontMatter.title_en ?? item.frontMatter.title} ko={item.frontMatter.title} />
                  </span>
                  <LocalizedDate
                    className="resume-linked-meta"
                    startDate={item.frontMatter.startDate}
                    endDate={item.frontMatter.endDate}
                  />
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
