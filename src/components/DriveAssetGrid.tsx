import type { CSSProperties } from 'react';

import { ImgTag } from '@/components/MDXRenderer';
import { getOneDriveAssetUrl, getOneDriveAssetsByActId, onedriveAssets } from '@/data/onedrive-assets';

function normalizeQuery(query: string | undefined): string | undefined {
  return query?.trim().toLowerCase();
}

type DriveAssetGridProps = {
  actId?: string;
  name?: string;
  className?: string;
  start?: number;
  end?: number;
  layout?: readonly number[];
};

function normalizeIndex(index: number, length: number): number {
  if (index >= 0) return Math.min(index, length);
  return Math.max(length + index, 0);
}

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp', 'avif', 'heic']);

function isImageAsset(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? imageExtensions.has(ext) : false;
}

export default function DriveAssetGrid({ actId, name, className, start, end, layout }: DriveAssetGridProps) {
  const normalizedActId = normalizeQuery(actId);
  const normalizedName = normalizeQuery(name);

  let assets: ReturnType<typeof getOneDriveAssetsByActId> = [];

  if (normalizedActId) {
    assets = getOneDriveAssetsByActId(actId!);
  }

  if ((assets.length === 0 || !normalizedActId) && normalizedName) {
    assets = onedriveAssets.filter(asset => normalizeQuery(asset.name)?.includes(normalizedName));
  }

  assets = assets.filter(asset => isImageAsset(asset.filename));

  if (start !== undefined || end !== undefined) {
    const length = assets.length;
    const startIndex = start !== undefined ? normalizeIndex(start, length) : 0;
    const endIndex = end !== undefined ? normalizeIndex(end, length) : length;
    assets = assets.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex));
  }

  if (assets.length === 0) {
    return null;
  }

  const normalizedLayout = layout?.filter(value => Number.isFinite(value) && value > 0) ?? [];
  const gridTemplateColumns =
    normalizedLayout.length > 0 ? normalizedLayout.map(value => `${value}fr`).join(' ') : undefined;
  const containerStyle: CSSProperties | undefined = gridTemplateColumns
    ? { gridTemplateColumns }
    : undefined;

  return (
    <div className={className ?? 'image-grid image-grid--uniform'} style={containerStyle}>
      {assets.map(asset => (
        <div key={asset.filename}>
          <ImgTag src={getOneDriveAssetUrl(asset, 'default')} alt={asset.name || asset.filename} />
        </div>
      ))}
    </div>
  );
}
