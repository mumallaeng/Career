import Link from 'next/link';
import { Content } from '@/types/content';
import { formatActivityDate } from '@/lib/utils/date';
import { getOneDriveAssetByFilename, getOneDriveAssetUrl, onedriveAssetMap } from '@/data/onedrive-assets';

interface CardProps {
  item: Content;
  index: number;
}

export default function Card({ item, index }: CardProps) {
  const getCardClass = () => {
    if (index === 0) {
      return 'activity-card featured';
    }

    return 'activity-card third';
  };

  const isFeatured = index === 0;
  const featuredAsset = isFeatured
    ? (item.frontMatter.thumbnail_asset_id
        ? onedriveAssetMap[item.frontMatter.thumbnail_asset_id as keyof typeof onedriveAssetMap]
        : (item.frontMatter.thumbnail ? getOneDriveAssetByFilename(item.frontMatter.thumbnail) : undefined))
    : undefined;
  const thumbnailUrl = featuredAsset
    ? getOneDriveAssetUrl(featuredAsset, 'default')
    : item.thumbnailUrl;
  const hasThumbnail = Boolean(thumbnailUrl);
  const hasExplicitThumbnailSize = Boolean(item.thumbnailHasExplicitSize);
  const { startDate, endDate, publicationDate, updatedAt, date } = item.frontMatter;
  const activityDate = (startDate || endDate)
    ? formatActivityDate(startDate, endDate)
    : formatActivityDate(updatedAt || publicationDate || date);

  return (
    <Link href={item.publicPath} className="activity-link">
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
              src={thumbnailUrl}
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
