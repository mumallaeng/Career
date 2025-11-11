import { getActivitiesData } from '@/lib/content';
import ActivitiesFilter from '@/components/ActivitiesFilter';

export default function HomePage() {
  const activities = getActivitiesData();

  return (
    <div className="activities-container">
      {/* Section Header */}
      {/* <header className="section-header">
        <h1 className="section-title">활동</h1>
      </header> */}

      {/* Activities Filter and Grid */}
      <ActivitiesFilter activities={activities} />
    </div>
  );
}