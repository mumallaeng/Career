'use client';

import Link from 'next/link';
import type { ContentGridVariant } from '@/components/ContentGrid';
import { ContentCardData } from '@/types/content';
import { formatActivityDate } from '@/lib/utils/date';
import { getOneDriveAssetByFilename, getOneDriveAssetUrl, onedriveAssetMap } from '@/data/onedrive-assets';
import { useUiPreferences } from '@/hooks/useUiPreferences';

interface CardProps {
  item: ContentCardData;
  index: number;
  variant?: ContentGridVariant;
}

export default function Card({ item, index, variant = 'work' }: CardProps) {
  const { language } = useUiPreferences();
  const getCardClass = () => {
    if (variant === 'featured-grid') {
      return 'activity-card featured-grid';
    }

    if (index === 0) {
      return 'activity-card featured';
    }

    return 'activity-card third';
  };

  const prefersDefaultAsset = variant === 'featured-grid' || index === 0;
  const featuredAsset = prefersDefaultAsset
    ? (item.frontMatter.thumbnail_asset_id
        ? onedriveAssetMap[item.frontMatter.thumbnail_asset_id as keyof typeof onedriveAssetMap]
        : (item.frontMatter.thumbnail ? getOneDriveAssetByFilename(item.frontMatter.thumbnail) : undefined))
    : undefined;
  const thumbnailUrl = featuredAsset
    ? getOneDriveAssetUrl(featuredAsset, 'default')
    : item.thumbnailUrl;
  const hasThumbnail = Boolean(thumbnailUrl);
  const hasExplicitThumbnailSize = Boolean(item.thumbnailHasExplicitSize);
  const { startDate, endDate } = item.frontMatter;
  const activityDate = formatActivityDate(startDate, endDate, language);
  const title = language === 'ko' ? item.frontMatter.title : (item.frontMatter.title_en ?? item.frontMatter.title);

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
            {title}
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
