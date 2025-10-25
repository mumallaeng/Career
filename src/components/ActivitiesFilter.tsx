'use client';

import { useState, useMemo } from 'react';
import Card from '@/components/Card';
import { Content } from '@/types/content';

interface ActivitiesFilterProps {
  activities: Content[];
}

export default function ActivitiesFilter({ activities }: ActivitiesFilterProps) {
  const [selectedType, setSelectedType] = useState<string>('all');

  // Get unique content types
  const contentTypes = useMemo(() => {
    const types = new Set<string>();
    activities.forEach(activity => {
      const contentType = activity.frontMatter.content_type || 'activity';
      types.add(contentType);
    });
    return ['all', ...Array.from(types).sort()];
  }, [activities]);

  // Filter activities by content type
  const filteredActivities = useMemo(() => {
    if (selectedType === 'all') return activities;
    return activities.filter(activity => {
      const contentType = activity.frontMatter.content_type || 'activity';
      return contentType === selectedType;
    });
  }, [activities, selectedType]);

  // Get display name for content type
  const getTypeDisplayName = (type: string) => {
    const typeNames: Record<string, string> = {
      'all': '전체',
      'activity': '활동',
      'project': '프로젝트'
    };
    return typeNames[type] || type;
  };

  return (
    <>
      {/* Content Type Filter */}
      <div className="content-type-filter">
        {contentTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`filter-button ${selectedType === type ? 'active' : ''}`}
          >
            {getTypeDisplayName(type)}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="activities-grid">
        {filteredActivities.map((activity, index) => (
          <Card
            key={activity.slug}
            item={activity}
            index={index}
            type="activity"
          />
        ))}
      </div>
    </>
  );
}
