import Link from 'next/link';
import { Content } from '@/types/content';
import { formatActivityDate } from '@/lib/utils/date';

interface CardProps {
  item: Content;
  index: number;
}

export default function Card({ item, index }: CardProps) {
  // Activity layout: first featured, then groups of three
  const getCardClass = () => {
    if (index === 0) {
      return 'activity-card featured';
    }

    const position = (index - 1) % 3;
    const positions = ['left', 'center', 'right'];
    return `activity-card third ${positions[position]}`;
  };

  return (
    <Link href={`/activities/${item.slug}`} className="activity-link">
      <article
        className={getCardClass()}
        style={item.thumbnailUrl ? {
          backgroundImage: `url(${item.thumbnailUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div
          className={`activity-title-container ${item.thumbnailUrl ? 'has-thumbnail' : 'no-thumbnail'}`}
        >
          <h3 className="activity-title">
            {item.frontMatter.title}
          </h3>
        </div>
        <div className="activity-content">
          <div className="activity-meta">
            <time className="activity-date">
              {formatActivityDate(item.frontMatter.endDate || item.frontMatter.date)}
            </time>
            {item.frontMatter.categories && (
              <span className="activity-category">
                {item.frontMatter.categories[0]}
              </span>
            )}
            <div className="activity-tags">
              {item.frontMatter.tags?.map((tag) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}