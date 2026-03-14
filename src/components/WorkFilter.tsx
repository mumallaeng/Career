'use client';

import { useMemo, useState } from 'react';
import Card from '@/components/Card';
import { Content } from '@/types/content';

interface WorkFilterProps {
  items: Content[];
}

type SortOrder = 'recommended' | 'newest' | 'oldest' | 'name';
type WorkFilterValue = 'all' | 'project' | 'case-study';

function getDateValue(item: Content) {
  const rawValue =
    item.frontMatter.updatedAt ||
    item.frontMatter.publicationDate ||
    item.frontMatter.startDate ||
    item.frontMatter.endDate ||
    item.frontMatter.date ||
    '1970-01-01';

  return new Date(rawValue).getTime();
}

function getRecommendationPriority(item: Content) {
  const priority = item.frontMatter.recommendation_priority;
  if (typeof priority === 'number' && Number.isFinite(priority)) {
    return priority;
  }

  return Number.MAX_SAFE_INTEGER;
}

export default function WorkFilter({ items }: WorkFilterProps) {
  const [selectedType, setSelectedType] = useState<WorkFilterValue>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recommended');

  const filteredItems = useMemo(() => {
    if (selectedType === 'all') {
      return items;
    }

    return items.filter(item => item.frontMatter.work_type === selectedType);
  }, [items, selectedType]);

  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    return list.sort((left, right) => {
      switch (sortOrder) {
        case 'recommended': {
          const priorityDiff = getRecommendationPriority(left) - getRecommendationPriority(right);
          if (priorityDiff !== 0) {
            return priorityDiff;
          }
          return getDateValue(right) - getDateValue(left);
        }
        case 'newest':
          return getDateValue(right) - getDateValue(left);
        case 'oldest':
          return getDateValue(left) - getDateValue(right);
        case 'name':
          return left.frontMatter.title.localeCompare(right.frontMatter.title, 'ko');
        default:
          return 0;
      }
    });
  }, [filteredItems, sortOrder]);

  return (
    <>
      <div className="activities-filter-bar">
        <div className="content-type-filter">
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`filter-button ${selectedType === 'all' ? 'active' : ''}`}
          >
            전체
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('project')}
            className={`filter-button ${selectedType === 'project' ? 'active' : ''}`}
          >
            프로젝트
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('case-study')}
            className={`filter-button ${selectedType === 'case-study' ? 'active' : ''}`}
          >
            케이스 스터디
          </button>
        </div>

        <div className="sort-filter">
          <label className="sort-select-wrapper">
            <select
              id="work-sort-select"
              className="sort-select"
              aria-label="정렬"
              value={sortOrder}
              onChange={event => setSortOrder(event.target.value as SortOrder)}
            >
              <option value="recommended">추천순</option>
              <option value="newest">최신순</option>
              <option value="oldest">과거순</option>
              <option value="name">이름순</option>
            </select>
          </label>
        </div>
      </div>

      <div className="activities-grid">
        {sortedItems.map((item, index) => (
          <Card key={item.slug} item={item} index={index} />
        ))}
      </div>
    </>
  );
}
