import ContentGrid from '@/components/ContentGrid';
import PageTabs from '@/components/PageTabs';
import LocalizedText from '@/components/LocalizedText';
import { toContentCardData, type DetailGroup } from '@/lib/content';
import { Content } from '@/types/content';

const detailTabs = [
  { href: '/detail', label: 'All', labelKo: '전체' },
  { href: '/detail/work', label: 'Work', labelKo: '작업' },
  { href: '/detail/affiliation', label: 'Affiliation', labelKo: '소속·이력' },
];

interface DetailCollectionPageProps {
  activeGroup: DetailGroup;
  title: string;
  titleKo?: string;
  description: string;
  descriptionKo?: string;
  items: Content[];
}

function getActiveHref(group: DetailGroup): string {
  switch (group) {
    case 'work':
      return '/detail/work';
    case 'affiliation':
      return '/detail/affiliation';
    default:
      return '/detail';
  }
}

export default function DetailCollectionPage({
  activeGroup,
  title,
  titleKo,
  description,
  descriptionKo,
  items,
}: DetailCollectionPageProps) {
  return (
    <div className="activities-container">
      <header className="career-section-header page-header">
        <div>
          <p className="career-section-label">Detail</p>
          <LocalizedText as="h1" className="career-section-title" en={title} ko={titleKo ?? title} />
        </div>
        <LocalizedText as="p" className="career-summary compact" en={description} ko={descriptionKo ?? description} />
      </header>

      <PageTabs items={detailTabs} activeHref={getActiveHref(activeGroup)} />

      {items.length > 0 ? (
        <ContentGrid items={items.map(toContentCardData)} />
      ) : (
        <section className="detail-empty-state">
          <LocalizedText as="p" className="detail-empty-title" en="No items are published here yet." ko="아직 정리된 항목이 없습니다." />
          <LocalizedText as="p" className="detail-empty-copy" en="This section is still being organized." ko="이 섹션은 계속 정리 중입니다." />
        </section>
      )}
    </div>
  );
}
