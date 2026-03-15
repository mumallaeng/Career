import DetailCollectionPage from '@/components/DetailCollectionPage';
import { getDetailData } from '@/lib/content';

export default function DetailAffiliationPage() {
  return (
    <DetailCollectionPage
      activeGroup="affiliation"
      title="Affiliation"
      titleKo="소속·이력"
      description="Education, affiliations, programs, awards, and background records that frame the work."
      descriptionKo="학력, 소속, 프로그램, 수상과 활동 등 배경이 되는 이력을 정리합니다."
      items={getDetailData('affiliation')}
    />
  );
}
