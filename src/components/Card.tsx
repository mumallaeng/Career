import Link from 'next/link';
import { Content } from '@/types/content';
import { formatActivityDate } from '@/lib/utils/date';
import { getOneDriveAssetByFilename, getOneDriveAssetUrl, onedriveAssetMap } from '@/data/onedrive-assets';

interface CardProps {
  item: Content;
  index: number;
}

export default function Card({ item, index }: CardProps) {
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
  const { startDate, endDate, date } = item.frontMatter;
  const activityDate = (startDate || endDate)
    ? formatActivityDate(startDate, endDate)
    : formatActivityDate(date);
  const contentTypeNames: Record<string, string> = {
    project: '프로젝트',
    education: '학력',
    social_activity: '교육·대외활동',
    work_experience: '직무 경험',
    award_competition: '수상·대회',
  };
  const contentType = item.frontMatter.content_type ?? 'activity';
  const typeLabel = contentTypeNames[contentType] ?? item.frontMatter.categories?.[0] ?? '활동';

  return (
    <Link href={`/activities/${item.slug}`} className="activity-link">
      <article className={`activity-card${hasThumbnail ? '' : ' activity-card--text-only'}`}>
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
        <div className="activity-card-body">
          <div className="activity-card-meta">
            <span>{typeLabel}</span>
            <time>{activityDate}</time>
          </div>
          <h3 className="activity-title">
            {item.frontMatter.title}
          </h3>
          <p className="activity-card-description">{item.frontMatter.description}</p>
        </div>
      </article>
    </Link>
  );
}
