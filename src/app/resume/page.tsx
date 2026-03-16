import Link from 'next/link';
import LocalizedDate from '@/components/LocalizedDate';
import LocalizedText from '@/components/LocalizedText';
import { getDetailData, getFeaturedWork } from '@/lib/content';
import { Content } from '@/types/content';

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

const assistantAffiliationEntries = [
  {
    key: 'assistant-2022-winter-incheon',
    startDate: '2022-01-12',
    endDate: '2022-01-21',
    organization: 'Incheon Metropolitan Office of Education / Inha Technical College',
    organizationKo: '인천광역시교육청 / 인하공업전문대학',
    group: 'AI Big Data Center',
    groupKo: '인공지능빅데이터센터',
    summary: 'Produced examples for the 2022 first-half teacher training program and participated as an assistant instructor in the first session.',
    summaryKo: '인천시 교육청 교사연수 예제 제작과 1차 강의 보조 강사로 참여',
  },
  {
    key: 'assistant-2021-service-school',
    startDate: '2021-12-20',
    endDate: '2022-01-11',
    organization: 'Inha Technical College',
    organizationKo: '인하공업전문대학',
    group: 'AI Big Data Center',
    groupKo: '인공지능빅데이터센터',
    summary: 'Created data analysis teaching examples for the Service Division curriculum.',
    summaryKo: '서비스 학부를 위한 데이터 분석 예제 제작',
  },
  {
    key: 'assistant-2021-jeollanamdo',
    startDate: '2021-11-06',
    endDate: '2021-11-27',
    organization: 'Jeollanam-do Office of Education / Inha Technical College',
    organizationKo: '전라남도교육청 / 인하공업전문대학',
    group: 'AI Big Data Center',
    groupKo: '인공지능빅데이터센터',
    summary: 'Supported the Jeollanam-do teacher training sessions with technical assistance and class operations.',
    summaryKo: '전라남도 교육청 교사연수 지원 및 운영 보조',
  },
  {
    key: 'assistant-2021-science-festival',
    startDate: '2021-10-23',
    endDate: '2021-10-23',
    organization: 'Incheon Metropolitan Office of Education',
    organizationKo: '인천광역시교육청',
    group: '23rd Incheon Science Festival',
    groupKo: '제23회 인천과학대제전',
    summary: 'Worked on-site as a metaverse platform manager and support staff for the opening event.',
    summaryKo: '메타버스 플랫폼 관리자 및 개막식 지원팀으로 참여',
  },
  {
    key: 'assistant-2021-metaverse-lecture',
    startDate: '2021-09-06',
    endDate: '2021-09-06',
    organization: 'Incheon Metropolitan Office of Education / Inha Technical College',
    organizationKo: '인천광역시교육청 / 인하공업전문대학',
    group: 'AI Big Data Center',
    groupKo: '인공지능빅데이터센터',
    summary: 'Delivered a metaverse lecture for representative elementary science teachers.',
    summaryKo: '초등 과학 교사 대표 대상 메타버스 강의 진행',
  },
  {
    key: 'assistant-2021-ai-training',
    startDate: '2021-07-26',
    endDate: '2021-08-06',
    organization: 'Incheon Metropolitan Office of Education / Inha Technical College',
    organizationKo: '인천광역시교육청 / 인하공업전문대학',
    group: 'AI Big Data Center',
    groupKo: '인공지능빅데이터센터',
    summary: 'Produced course materials and assisted the 2021 AI-convergence teacher training program for the basic and advanced tracks.',
    summaryKo: '2021학년도 AI융합교육 전문교원 역량 강화 직무연수(기본/심화) 콘텐츠 제작 및 조교',
  },
  {
    key: 'assistant-2021-incheon-training',
    startDate: '2021-07-01',
    endDate: '2021-07-31',
    organization: 'Incheon Metropolitan Office of Education / Inha Technical College',
    organizationKo: '인천광역시교육청 / 인하공업전문대학',
    group: 'AI Big Data Center',
    groupKo: '인공지능빅데이터센터',
    summary: 'Produced learning content and assisted the basic and advanced teacher training sessions hosted with the Incheon Metropolitan Office of Education.',
    summaryKo: '인천광역시 교육청 직무연수(기초/심화) 콘텐츠 제작 및 조교',
  },
];

type ResumeAffiliationEntry = {
  key: string;
  href: string;
  startDate?: string;
  endDate?: string;
  title: string;
  titleKo: string;
  organization?: string;
  organizationKo?: string;
  group?: string;
  groupKo?: string;
  summary?: string;
  summaryKo?: string;
};

function expandAffiliation(item: Content): ResumeAffiliationEntry[] {
  if (item.slug === 'assistant') {
    return assistantAffiliationEntries.map(entry => ({
      key: entry.key,
      href: item.publicPath,
      startDate: entry.startDate,
      endDate: entry.endDate,
      title: entry.summary,
      titleKo: entry.summaryKo,
      organization: entry.organization,
      organizationKo: entry.organizationKo,
      group: entry.group,
      groupKo: entry.groupKo,
    }));
  }

  return [
    {
      key: item.slug,
      href: item.publicPath,
      startDate: item.frontMatter.startDate,
      endDate: item.frontMatter.endDate,
      title: item.frontMatter.title_en ?? item.frontMatter.title,
      titleKo: item.frontMatter.title,
      summary: item.frontMatter.description_en ?? item.frontMatter.description,
      summaryKo: item.frontMatter.description,
    },
  ];
}

export default function ResumePage() {
  const featuredWork = getFeaturedWork(4);
  const affiliations = getDetailData('affiliation').flatMap(expandAffiliation);

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
            <Link key={item.key} href={item.href} className="resume-link-item resume-affiliation-item">
              <LocalizedDate
                className="resume-link-meta resume-affiliation-date"
                startDate={item.startDate}
                endDate={item.endDate}
              />
              <div className="resume-link-copy resume-affiliation-copy">
                {item.organization ? (
                  <span className="resume-affiliation-organization">
                    <LocalizedText en={item.organization} ko={item.organizationKo ?? item.organization} />
                  </span>
                ) : null}
                {item.group ? (
                  <span className="resume-affiliation-group">
                    <LocalizedText en={item.group} ko={item.groupKo ?? item.group} />
                  </span>
                ) : null}
                <span className="resume-link-title">
                  <LocalizedText en={item.title} ko={item.titleKo} />
                </span>
                {item.summary ? (
                  <LocalizedText
                    as="p"
                    className="resume-affiliation-summary"
                    en={item.summary}
                    ko={item.summaryKo ?? item.summary}
                  />
                ) : null}
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
