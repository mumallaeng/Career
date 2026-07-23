import type { Metadata } from 'next';
import Link from 'next/link';
import ActivitiesFilter from '@/components/ActivitiesFilter';
import { getActivitiesData } from '@/lib/content';

const experienceContentTypes = new Set([
  'education',
  'social_activity',
]);

export const metadata: Metadata = {
  title: '경험과 활동 | 김연우',
  description: '김연우의 학력 및 교육·대외활동 기록',
};

export default function ExperienceCollectionPage() {
  const experience = getActivitiesData().filter(activity =>
    experienceContentTypes.has(activity.frontMatter.content_type ?? '')
  );

  return (
    <main className="activities-container">
      <header className="activities-collection-header">
        <Link href="/#experience" className="activities-collection-back">
          ← 홈 경험과 활동으로
        </Link>
        <h1 className="activities-collection-title">경험과 활동</h1>
        <p className="activities-collection-description">
          학력과 교육·대외활동으로 분류된 전체 기록입니다.
        </p>
      </header>

      <ActivitiesFilter activities={experience} showContentTypeFilter={false} />
    </main>
  );
}
