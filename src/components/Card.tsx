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
  const { startDate, endDate, date } = item.frontMatter;
  const activityDate = (startDate || endDate)
    ? formatActivityDate(startDate, endDate)
    : formatActivityDate(date);

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
        </div>
        <div className="activity-content">
          <h3 className="activity-title">
            {item.frontMatter.title}
          </h3>
          <div className="activity-meta">
            <time className="activity-date">
              {activityDate}
            </time>
            {/* <TagList tags={item.frontMatter.tags} className="activity-tags single-line" /> */}
          </div>
        </div>
      </article>
    </Link>
  );
}
