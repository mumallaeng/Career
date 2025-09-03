import { getActivitiesData } from '@/lib/content';
import Card from '@/components/Card';

export async function generateStaticParams() {
  return [
    { locale: 'ko' },
    { locale: 'en' }
  ];
}

export default async function ActivitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const activities = getActivitiesData(locale as 'ko' | 'en');

  return (
    <div className="activities-container">
      {/* Section Header */}
      <header className="section-header">
        <h1 className="section-title">
          {locale === 'ko' ? '활동' : 'Activities'}
        </h1>
        <div className="section-description">
          {locale === 'ko' ? '자격증과 수상 내역을 포함한 사회 활동' : 'Various activities and achievements I\'ve participated in.'}
        </div>
      </header>

      {/* Activities Grid */}
      <div className="activities-grid">
        {activities.map((activity, index) => (
          <Card 
            key={activity.slug}
            item={activity}
            index={index}
            type="activity"
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}