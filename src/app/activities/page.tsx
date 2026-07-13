import type { Metadata } from 'next';
import Link from 'next/link';
import { getActivitiesData } from '@/lib/content';
import ActivitiesFilter from '@/components/ActivitiesFilter';

export const metadata: Metadata = {
  title: '전체 기록 | 김연우',
  description: '김연우의 프로젝트, 학력, 교육·대외활동 및 직무 경험 전체 기록',
};

export default function ActivitiesPage() {
  const activities = getActivitiesData();

  return (
    <main className="activities-container">
      <header className="activities-collection-header">
        <Link href="/" className="activities-collection-back">
          ← 홈으로
        </Link>
        <h1 className="activities-collection-title">전체 기록</h1>
        <p className="activities-collection-description">
          프로젝트, 학력, 교육·대외활동, 직무 경험을 한곳에 모았습니다.
        </p>
      </header>

      <ActivitiesFilter activities={activities} />
    </main>
  );
}
