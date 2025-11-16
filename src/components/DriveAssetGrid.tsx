import type { CSSProperties } from 'react';

import { ImgTag } from '@/components/MDXRenderer';
import { getDrive1AssetsByActId } from '@/data/drive1-assets';

type DriveAssetGridProps = {
  actId: string;
  className?: string;
  start?: number;
  end?: number;
  layout?: readonly number[];
};

function normalizeIndex(index: number, length: number): number {
  if (index >= 0) return Math.min(index, length);
  return Math.max(length + index, 0);
}

export default function DriveAssetGrid({ actId, className, start, end, layout }: DriveAssetGridProps) {
  let assets = getDrive1AssetsByActId(actId);

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
          <ImgTag src={asset.publicPath} alt={asset.name || asset.filename} />
        </div>
      ))}
    </div>
  );
}
