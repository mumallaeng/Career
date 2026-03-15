import DetailCollectionPage from '@/components/DetailCollectionPage';
import { getDetailData } from '@/lib/content';

export default function DetailWorkPage() {
  return (
    <DetailCollectionPage
      activeGroup="work"
      title="Work"
      titleKo="작업"
      description="Projects and technical outcomes that I built, improved, and shipped myself."
      descriptionKo="직접 구현하고 발전시킨 프로젝트와 기술 결과물을 모아 둡니다."
      items={getDetailData('work')}
    />
  );
}
