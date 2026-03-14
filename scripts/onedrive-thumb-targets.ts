import fs from 'node:fs';
import path from 'node:path';

import { getOneDriveAssetByFilename, getOneDriveAssetsByActId, onedriveAssetMap, onedriveAssets } from '../src/data/onedrive-assets';

type FrontMatter = Record<string, string>;

function parseFrontMatter(fileContent: string): FrontMatter {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = fileContent.match(frontMatterRegex);
  if (!match) return {};

  const frontMatterText = match[1];
  const frontMatter: FrontMatter = {};

  frontMatterText.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (!key || valueParts.length === 0) return;
    let value = valueParts.join(':').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    frontMatter[key.trim()] = value;
  });

  return frontMatter;
}

function addThumbnailFromActId(actId: string, target: Set<string>) {
  const assets = getOneDriveAssetsByActId(actId);
  if (assets.length > 0) {
    target.add(assets[0].filename);
  }
}

function walkContentFiles(rootDir: string): string[] {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const output: string[] = [];

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) {
      continue;
    }

    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      output.push(...walkContentFiles(entryPath));
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      output.push(entryPath);
    }
  }

  return output;
}

export function buildThumbAssetSet(projectRoot: string = process.cwd()): Set<string> {
  const thumbAssets = new Set<string>();

  // Certificates are always shown as thumbnails in the grid.
  onedriveAssets
    .filter(asset => asset.type === 'certificate')
    .forEach(asset => thumbAssets.add(asset.filename));

  const contentDir = path.join(projectRoot, 'src/content');
  if (!fs.existsSync(contentDir)) {
    return thumbAssets;
  }

  const actIdRegex = /actId\s*=\s*(?:\{)?["']([^"']+)["'](?:\})?/g;

  for (const filePath of walkContentFiles(contentDir)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const frontMatter = parseFrontMatter(fileContent);

    const assetId = frontMatter.thumbnail_asset_id;
    if (assetId) {
      const asset = onedriveAssetMap[assetId];
      if (asset) {
        thumbAssets.add(asset.filename);
      }
    }

    const thumbnail = frontMatter.thumbnail;
    if (thumbnail) {
      const asset = getOneDriveAssetByFilename(thumbnail);
      if (asset) {
        thumbAssets.add(asset.filename);
      }
    }

    let match: RegExpExecArray | null;
    while ((match = actIdRegex.exec(fileContent)) !== null) {
      addThumbnailFromActId(match[1], thumbAssets);
    }
  }

  return thumbAssets;
}
