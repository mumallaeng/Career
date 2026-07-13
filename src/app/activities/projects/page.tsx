import type { Metadata } from 'next';
import Link from 'next/link';
import ActivitiesFilter from '@/components/ActivitiesFilter';
import { getActivitiesData } from '@/lib/content';

export const metadata: Metadata = {
  title: '프로젝트 | 김연우',
  description: '김연우의 프로젝트 기록',
};

export default function ProjectsCollectionPage() {
  const projects = getActivitiesData().filter(
    activity => activity.frontMatter.content_type === 'project'
  );

  return (
    <main className="activities-container">
      <header className="activities-collection-header">
        <Link href="/#projects" className="activities-collection-back">
          ← 홈 프로젝트로
        </Link>
        <h1 className="activities-collection-title">프로젝트</h1>
        <p className="activities-collection-description">
          프로젝트로 분류된 전체 작업입니다.
        </p>
      </header>

      <ActivitiesFilter activities={projects} showContentTypeFilter={false} />
    </main>
  );
}
