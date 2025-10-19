import { getActivitiesData } from '@/lib/content';
import Card from '@/components/Card';

export default function ActivitiesPage() {
  const activities = getActivitiesData();

  return (
    <div className="activities-container">
      {/* Section Header */}
      <header className="section-header">
        <h1 className="section-title">활동</h1>
        <div className="section-description">
          자격증과 수상 내역을 포함한 사회 활동
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
          />
        ))}
      </div>
    </div>
  );
}
