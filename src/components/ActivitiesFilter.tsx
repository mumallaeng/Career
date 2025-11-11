'use client';

import { useState, useMemo } from 'react';
import Card from '@/components/Card';
import { Content } from '@/types/content';

interface ActivitiesFilterProps {
  activities: Content[];
}

export default function ActivitiesFilter({ activities }: ActivitiesFilterProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'recommended' | 'newest' | 'oldest' | 'name'>('recommended');

  // Get unique content types
  const contentTypes = useMemo(() => {
    const precedence = ['project', 'competition'];
    const rest = new Set<string>();
    activities.forEach(activity => {
      const contentType = activity.frontMatter.content_type || 'activity';
      if (!precedence.includes(contentType)) {
        rest.add(contentType);
      }
    });
    return ['all', ...precedence, ...Array.from(rest).sort()];
  }, [activities]);

  // Filter activities by content type
  const filteredActivities = useMemo(() => {
    if (selectedType === 'all') return activities;
    return activities.filter(activity => {
      const contentType = activity.frontMatter.content_type || 'activity';
      return contentType === selectedType;
    });
  }, [activities, selectedType]);

  const getDateValue = (activity: Content) => {
    const raw =
      activity.frontMatter.startDate ||
      activity.frontMatter.endDate ||
      activity.frontMatter.date ||
      '1970-01-01';
    return new Date(raw).getTime();
  };

  const getRecommendationPriority = (activity: Content) => {
    const priority = activity.frontMatter.recommendation_priority;
    if (typeof priority === 'number' && Number.isFinite(priority)) {
      return priority;
    }
    return Number.MAX_SAFE_INTEGER;
  };

  const sortedActivities = useMemo(() => {
    const list = [...filteredActivities];
    return list.sort((a, b) => {
      switch (sortOrder) {
        case 'recommended': {
          const priorityDiff = getRecommendationPriority(a) - getRecommendationPriority(b);
          if (priorityDiff !== 0) return priorityDiff;
          return getDateValue(b) - getDateValue(a);
        }
        case 'newest':
          return getDateValue(b) - getDateValue(a);
        case 'oldest':
          return getDateValue(a) - getDateValue(b);
        case 'name':
          return a.frontMatter.title.localeCompare(b.frontMatter.title, 'ko');
        default:
          return 0;
      }
    });
  }, [filteredActivities, sortOrder]);

  // Get display name for content type
  const getTypeDisplayName = (type: string) => {
    const typeNames: Record<string, string> = {
      all: '전체',
      project: '작업/프로젝트',
      competition: '활동',
      server: '서버',
      education: '교육',
      etc: '그외',
    };
    return typeNames[type] || type;
  };

  return (
    <>
      <div className="activities-filter-bar">
        <div className="sort-filter">
          <label className="sort-select-wrapper">
            <select
              id="activities-sort-select"
              className="sort-select"
              aria-label="정렬"
              value={sortOrder}
              onChange={event =>
                setSortOrder(event.target.value as 'recommended' | 'newest' | 'oldest' | 'name')
              }
            >
              <option value="recommended">추천순</option>
              <option value="newest">최신순</option>
              <option value="oldest">과거순</option>
              <option value="name">이름순</option>
            </select>
          </label>
        </div>

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
      </div>

      {/* Activities Grid */}
      <div className="activities-grid">
        {sortedActivities.map((activity, index) => (
          <Card
            key={activity.slug}
            item={activity}
            index={index}
          />
        ))}
      </div>
    </>
  );
}
