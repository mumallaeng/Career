import { ImgTag } from '@/components/MDXRenderer';
import { getDrive1AssetsByActId } from '@/data/drive1-assets';

type DriveAssetGridProps = {
  actId: string;
  className?: string;
  start?: number;
  end?: number;
};

function normalizeIndex(index: number, length: number): number {
  if (index >= 0) return Math.min(index, length);
  return Math.max(length + index, 0);
}

export default function DriveAssetGrid({ actId, className, start, end }: DriveAssetGridProps) {
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

  return (
    <div className={className ?? 'image-grid image-grid--uniform'}>
      {assets.map(asset => (
        <ImgTag key={asset.filename} src={asset.publicPath} alt={asset.name || asset.filename} />
      ))}
    </div>
  );
}
