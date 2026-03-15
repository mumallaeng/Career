import DetailCollectionPage from '@/components/DetailCollectionPage';
import { getDetailData } from '@/lib/content';

export default function DetailPage() {
  return (
    <DetailCollectionPage
      activeGroup="all"
      title="All Records"
      titleKo="전체 기록"
      description="Projects, affiliations, education, awards, and activity records arranged along the timeline."
      descriptionKo="프로젝트, 소속, 교육, 수상과 활동 기록을 시간 흐름 기준으로 정리합니다."
      items={getDetailData('all')}
    />
  );
}
