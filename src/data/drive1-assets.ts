const remoteBasePathHighlight = 'Photos/Highlight/';
const remoteBasePathCopy = `${remoteBasePathHighlight}_copy/`;
const publicBasePath = '/import-data/';
const publicHighlightPath = `${publicBasePath}highlight/`;

type Drive1AssetBlueprint = {
  /**
   * Unique identifier used by MDX/TS files to look up metadata.
   */
  id: string;

  filename: string;

  /**
   * Optional alt text/description for convenient reuse.
   */
  name?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  organization?: string;
};

export type Drive1AssetDefinition = Drive1AssetBlueprint & {
  /**
   * Path inside Drive1 (relative to the drive root), e.g.
   * "Photos/Highlight/_copy/foo.jpg".
   */
  remotePath: string;

  /**
   * Public path served by Next.js. Must start with "/".
   */
  publicPath: string;
};

const drive1AssetBlueprints = [
  {
    id: 'kdt-addinedu-achievement-award',
    filename: '250527-애드인에듀-공로상_copy.jpg',
    name: '공로상',
    type: 'award',
    startDate: '2023-05-27',
    organization: '애드인에듀 아카데미 구로가산센터장',
  },
  {
    id: 'kdt-addinedu-grand-prize',
    filename: '250527-애드인에듀-최우수상_copy.jpg',
    name: '최우수상',
    type: 'award',
    startDate: '2023-05-27',
    organization: '애드인에듀 아카데미 구로가산센터장',
  },
  {
    id: 'kdt-addinedu-completion-certificate',
    filename: '250527-애드인에듀-수료증_copy.jpg',
    name: '수료증',
    type: 'certificate',
    startDate: '2023-05-27',
    organization: '애드인에듀 아카데미 구로가산센터장',
  },
] as const satisfies readonly Drive1AssetBlueprint[];

const buildDrive1Asset = (asset: Drive1AssetBlueprint): Drive1AssetDefinition => ({
  ...asset,
  remotePath: `${remoteBasePathCopy}${asset.filename}`,
  publicPath: `${publicHighlightPath}${asset.filename}`,
});

export const drive1Assets = drive1AssetBlueprints.map(buildDrive1Asset) as readonly Drive1AssetDefinition[];

export const drive1AssetMap = Object.fromEntries(
  drive1Assets.map(asset => [asset.id, asset]),
) as Record<Drive1AssetDefinition['id'], Drive1AssetDefinition>;

function getDrive1AssetById(id: Drive1AssetDefinition['id']): Drive1AssetDefinition {
  const asset = drive1AssetMap[id];
  if (!asset) {
    throw new Error(`Drive1 asset not found: ${id}`);
  }
  return asset;
}

export { getDrive1AssetById };
