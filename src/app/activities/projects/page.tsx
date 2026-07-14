import type { Metadata } from 'next';
import Link from 'next/link';
import ActivitiesFilter from '@/components/ActivitiesFilter';
import { getActivitiesData } from '@/lib/content';

export const metadata: Metadata = {
  title: '직무 관련 경험 | 김연우',
  description: '김연우의 프로젝트 기반 직무 관련 경험',
};

export default function ProjectsCollectionPage() {
  const projects = getActivitiesData().filter(
    activity => activity.frontMatter.content_type === 'project'
  );

  return (
    <main className="activities-container">
      <header className="activities-collection-header">
        <Link href="/#projects" className="activities-collection-back">
          ← 홈 직무 관련 경험으로
        </Link>
        <h1 className="activities-collection-title">직무 관련 경험</h1>
        <p className="activities-collection-description">
          프로젝트로 수행한 직무 관련 경험을 모았습니다.
        </p>
      </header>

      <ActivitiesFilter activities={projects} showContentTypeFilter={false} />
    </main>
  );
}
