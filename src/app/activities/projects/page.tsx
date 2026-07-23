import type { Metadata } from 'next';
import Link from 'next/link';
import ActivitiesFilter from '@/components/ActivitiesFilter';
import { getActivitiesData } from '@/lib/content';

export const metadata: Metadata = {
  title: '직무 관련 경험 | 김연우',
  description: '김연우의 프로젝트, 근로 경험 및 기술 대회 기록',
};

export default function ProjectsCollectionPage() {
  const projects = getActivitiesData().filter(
    activity => ['project', 'work_experience'].includes(activity.frontMatter.content_type ?? '')
  );

  return (
    <main className="activities-container">
      <header className="activities-collection-header">
        <Link href="/#projects" className="activities-collection-back">
          ← 홈 직무 관련 경험으로
        </Link>
        <h1 className="activities-collection-title">직무 관련 경험</h1>
        <p className="activities-collection-description">
          프로젝트와 근로 경험, 기술 대회 기록을 모았습니다.
        </p>
      </header>

      <ActivitiesFilter activities={projects} showContentTypeFilter={false} />
    </main>
  );
}
