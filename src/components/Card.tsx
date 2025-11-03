import Link from 'next/link';
import { Content } from '@/types/content';
import { formatActivityDate } from '@/lib/utils/date';

interface CardProps {
  item: Content;
  index: number;
}

export default function Card({ item, index }: CardProps) {
  // Activity layout: first featured, then groups of two
  const getCardClass = () => {
    if (index === 0) {
      return 'activity-card featured';
    }

    return 'activity-card third';
  };

  const hasThumbnail = Boolean(item.thumbnailUrl);
  const hasExplicitThumbnailSize = Boolean(item.thumbnailHasExplicitSize);

  return (
    <Link href={`/activities/${item.slug}`} className="activity-link">
      <article
        className={getCardClass()}
      >
        {hasThumbnail && (
          <div
            className={`activity-card-thumbnail ${hasExplicitThumbnailSize ? 'explicit-size' : 'cover-fit'}`}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnailUrl}
              alt=""
              loading="lazy"
              className="activity-card-thumbnail-image"
            />
          </div>
        )}
        <div
          className={`activity-title-container ${hasThumbnail ? 'has-thumbnail' : 'no-thumbnail'}`}
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
