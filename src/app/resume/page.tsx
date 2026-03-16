import Link from 'next/link';
import LocalizedDate from '@/components/LocalizedDate';
import LocalizedText from '@/components/LocalizedText';
import { getDetailData, getFeaturedWork } from '@/lib/content';

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
  const featuredWork = getFeaturedWork(4);
  const affiliations = getDetailData('affiliation').slice(0, 4);

  return (
    <div className="activities-container resume-page">
      <header className="resume-document-header page-header resume-page-header">
        <LocalizedText as="h1" className="resume-name" en="Gim Yeonwoo" ko="김연우" />
        <dl className="resume-meta-list">
          <div className="resume-meta-item">
            <dd>(+82)10-4557-0214</dd>
          </div>
          <div className="resume-meta-item">
            <dd>mumallaeng@outlook.com</dd>
          </div>
          <div className="resume-meta-item">
            <dd>github.com/mumallaeng</dd>
          </div>
          <div className="resume-meta-item">
            <dd>Seongnam, Gyeonggi-do, South Korea</dd>
          </div>
        </dl>
        <div className="resume-copy">
          <LocalizedText
            as="p"
            en="I focus on reading unfamiliar systems quickly and turning them into outputs a team can reuse.\nMy work has moved through information security, open source, web, data, IoT, and ROS2 robotics, with implementation and operational standards handled together."
            ko="낯선 시스템의 구조를 빠르게 읽고, 팀이 다시 사용할 수 있는 결과물로 정리하는 일을 중심에 두고 있습니다.\n정보보안, 오픈소스, 웹, 데이터, IoT, ROS2 로보틱스를 거치며 구현과 운영 기준을 함께 다루는 방식으로 경험을 쌓아 왔습니다."
          />
        </div>
      </header>

      <section className="resume-section">
        <LocalizedText as="h2" className="resume-section-title" en="Skills" ko="기술 스택" />
        <ul className="resume-bullet-list">
          {coreStrengths.map(item => (
            <li key={item.ko}>
              <LocalizedText as="p" en={item.en} ko={item.ko} />
            </li>
          ))}
        </ul>
      </section>

      <section className="resume-section">
        <div className="resume-section-heading">
          <Link href="/detail/affiliation" className="resume-inline-link">
            <LocalizedText as="h2" className="resume-section-title" en="Affiliation" ko="소속" />
          </Link>
        </div>
        <div className="resume-link-list">
          {affiliations.map(item => (
            <Link key={item.slug} href={item.publicPath} className="resume-link-item">
              <div className="resume-link-copy">
                <span className="resume-link-title">
                  <LocalizedText en={item.frontMatter.title_en ?? item.frontMatter.title} ko={item.frontMatter.title} />
                </span>
                <LocalizedDate
                  className="resume-link-meta"
                  startDate={item.frontMatter.startDate}
                  endDate={item.frontMatter.endDate}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="resume-section">
        <div className="resume-section-heading">
          <LocalizedText as="h2" className="resume-section-title" en="Selected Work" ko="대표 작업" />
          <Link href="/detail/work" className="resume-inline-link">
            <LocalizedText en="View all" ko="전체 보기" />
          </Link>
        </div>
        <div className="resume-link-list">
          {featuredWork.map(item => (
            <Link key={item.slug} href={item.publicPath} className="resume-link-item">
              <div className="resume-link-copy">
                <span className="resume-link-title">
                  <LocalizedText en={item.frontMatter.title_en ?? item.frontMatter.title} ko={item.frontMatter.title} />
                </span>
                <LocalizedDate
                  className="resume-link-meta"
                  startDate={item.frontMatter.startDate}
                  endDate={item.frontMatter.endDate}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
