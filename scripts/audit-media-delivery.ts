import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import {
  getOneDriveAssetByFilename,
  onedriveAssets,
  type OneDriveAssetDefinition,
} from '../src/data/onedrive-assets';
import { authoritativeDevStorageRemoteBasePath } from '../src/data/onedrive-paths';

type RemoteEntry = {
  Name?: string;
  Path?: string;
  Size?: number;
  MimeType?: string;
  IsDir?: boolean;
};

const projectRoot = process.cwd();
const stagingRoot = process.env.DEV_STORAGE_OUTPUT_ROOT
  ? path.resolve(process.env.DEV_STORAGE_OUTPUT_ROOT)
  : path.join(projectRoot, '.dev-storage-media');
const remoteBase = normalizeRemoteBase(process.env.ONEDRIVE_REMOTE_BASE ?? 'oow214-onedrive:');
const skipRemote =
  process.env.MEDIA_AUDIT_SKIP_REMOTE === '1' ||
  process.env.SKIP_ONEDRIVE_SYNC === '1';
const requireStaging = process.env.MEDIA_AUDIT_REQUIRE_STAGING === '1';
const maxImageBytes = Number(process.env.ONEDRIVE_MAX_IMAGE_ASSET_MB ?? '25') * 1024 * 1024;
const maxMp4Bytes = Number(process.env.ONEDRIVE_MAX_OPTIMIZED_MOTION_MB ?? '94') * 1024 * 1024;
const maxGifBytes = Number(process.env.DEV_STORAGE_GIF_MAX_MB ?? '10') * 1024 * 1024;

function normalizeRemoteBase(value: string): string {
  return value.endsWith(':') ? value : `${value}:`;
}

function lookupKey(value: string): string {
  return value.normalize('NFC').toLowerCase();
}

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function runCapture(command: string, args: string[]): string {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(
      `Command failed: ${command} ${args.join(' ')}\n${result.stderr || result.stdout || ''}`.trim(),
    );
  }
  return result.stdout ?? '';
}

function getDeliveryLimit(asset: OneDriveAssetDefinition): number {
  const extension = path.extname(asset.remotePath).toLowerCase();
  if (extension === '.gif') return maxGifBytes;
  if (extension === '.mp4' || extension === '.webm') return maxMp4Bytes;
  return maxImageBytes;
}

function auditManifest(): number {
  const publicPaths = new Map<string, string>();

  for (const asset of onedriveAssets) {
    ensure(asset.hasOptimizedDefault, `Asset is not routed through dev-storage: ${asset.filename}`);
    ensure(
      asset.publicPath.startsWith('/import-data/dev-storage/'),
      `Asset exposes a non-dev-storage default: ${asset.publicPath}`,
    );
    ensure(asset.publicPath === asset.publicPath.normalize('NFC'), `Public path is not NFC: ${asset.publicPath}`);

    const key = lookupKey(asset.publicPath);
    const collision = publicPaths.get(key);
    ensure(!collision, `Public path collision:\n- ${collision}\n- ${asset.publicPath}`);
    publicPaths.set(key, asset.publicPath);

    if (asset.isResizableImage) {
      ensure(asset.publicPath.endsWith('.webp'), `Image default is not WebP: ${asset.publicPath}`);
      ensure(
        asset.publicPathThumb === asset.publicPath,
        `Preview image does not share the full-quality file: ${asset.filename}`,
      );
    }
  }

  return publicPaths.size;
}

function auditActiveVideoTags(): number {
  const contentDirectory = path.join(projectRoot, 'src/content/activities');
  const filenames = fs.readdirSync(contentDirectory).filter(file => /\.mdx?$/.test(file));
  let count = 0;

  for (const filename of filenames) {
    const content = fs
      .readFileSync(path.join(contentDirectory, filename), 'utf8')
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    const videoTagPattern = /<VideoTag\s+[^>]*filename=["']([^"']+)["']/g;
    for (const match of content.matchAll(videoTagPattern)) {
      count += 1;
      const asset = getOneDriveAssetByFilename(match[1]);
      ensure(asset, `Active VideoTag is not registered (${filename}): ${match[1]}`);
      ensure(/\.(mp4|webm)$/i.test(asset.filename), `VideoTag uses an unsupported format: ${asset.filename}`);
      ensure(asset.publicPath.startsWith('/import-data/dev-storage/'), `VideoTag exposes an original: ${asset.filename}`);
    }
  }

  return count;
}

function auditRemote(): { bytes: number; counts: Record<string, number> } {
  const remoteRoot = authoritativeDevStorageRemoteBasePath.replace(/\/$/, '');
  const output = runCapture('rclone', [
    'lsjson',
    `${remoteBase}${remoteRoot}`,
    '--files-only',
    '--max-depth',
    '1',
  ]);
  const entries = JSON.parse(output) as RemoteEntry[];
  const entriesByKey = new Map<string, RemoteEntry[]>();

  for (const entry of entries) {
    if (entry.IsDir) continue;
    const filename = entry.Path ?? entry.Name;
    if (!filename) continue;
    const key = lookupKey(filename);
    entriesByKey.set(key, [...(entriesByKey.get(key) ?? []), entry]);
  }

  let bytes = 0;
  const counts: Record<string, number> = {};
  for (const asset of onedriveAssets) {
    const expectedFilename = path.posix.basename(asset.remotePath);
    const matches = entriesByKey.get(lookupKey(expectedFilename)) ?? [];
    ensure(matches.length === 1, `Expected one remote delivery file for ${expectedFilename}, found ${matches.length}`);
    const entry = matches[0];
    ensure(typeof entry.Size === 'number' && entry.Size >= 0, `Remote size is unavailable: ${expectedFilename}`);
    ensure(entry.Size <= getDeliveryLimit(asset), `Remote delivery file exceeds its limit: ${expectedFilename}`);

    const extension = path.extname(expectedFilename).toLowerCase();
    const expectedMime = extension === '.mp4'
      ? 'video/mp4'
      : extension === '.gif'
        ? 'image/gif'
        : extension === '.webp'
          ? 'image/webp'
          : undefined;
    if (expectedMime && entry.MimeType) {
      ensure(entry.MimeType === expectedMime, `Unexpected MIME for ${expectedFilename}: ${entry.MimeType}`);
    }

    bytes += entry.Size;
    counts[extension] = (counts[extension] ?? 0) + 1;
  }

  return { bytes, counts };
}

function parseFrameRate(value?: string): number | null {
  if (!value) return null;
  const [numerator, denominator = '1'] = value.split('/');
  const result = Number(numerator) / Number(denominator);
  return Number.isFinite(result) ? result : null;
}

function hasFastStart(targetPath: string): boolean {
  const fileSize = fs.statSync(targetPath).size;
  const descriptor = fs.openSync(targetPath, 'r');
  let offset = 0;
  let moovOffset = -1;
  let mdatOffset = -1;
  const header = Buffer.alloc(16);

  try {
    while (offset + 8 <= fileSize) {
      fs.readSync(descriptor, header, 0, 16, offset);
      let atomSize = header.readUInt32BE(0);
      const atomType = header.toString('ascii', 4, 8);
      let headerSize = 8;
      if (atomSize === 1) {
        atomSize = Number(header.readBigUInt64BE(8));
        headerSize = 16;
      } else if (atomSize === 0) {
        atomSize = fileSize - offset;
      }
      if (atomType === 'moov') moovOffset = offset;
      if (atomType === 'mdat') mdatOffset = offset;
      if (atomSize < headerSize) break;
      offset += atomSize;
    }
  } finally {
    fs.closeSync(descriptor);
  }

  return moovOffset >= 0 && mdatOffset >= 0 && moovOffset < mdatOffset;
}

function auditStaging(): { checked: number; bytes: number } {
  if (!fs.existsSync(stagingRoot)) {
    ensure(!requireStaging, `Required staging root does not exist: ${stagingRoot}`);
    return { checked: 0, bytes: 0 };
  }

  let checked = 0;
  let bytes = 0;
  for (const asset of onedriveAssets) {
    const extension = path.extname(asset.remotePath).toLowerCase();
    if (extension !== '.webp' && extension !== '.mp4') continue;
    const filename = path.posix.basename(asset.publicPath);
    const targetPath = path.join(stagingRoot, filename);
    if (!fs.existsSync(targetPath)) {
      ensure(!requireStaging, `Required staging file is missing: ${targetPath}`);
      continue;
    }

    const size = fs.statSync(targetPath).size;
    ensure(size <= getDeliveryLimit(asset), `Staging file exceeds its limit: ${filename}`);
    bytes += size;
    checked += 1;

    if (extension === '.mp4') {
      const probe = JSON.parse(runCapture('ffprobe', [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=codec_name,width,height,avg_frame_rate',
        '-of',
        'json',
        targetPath,
      ])) as { streams?: Array<{ codec_name?: string; width?: number; height?: number; avg_frame_rate?: string }> };
      const stream = probe.streams?.[0];
      ensure(stream?.codec_name === 'h264', `Unexpected video codec: ${filename}`);
      ensure(Math.max(stream.width ?? 0, stream.height ?? 0) <= 1920, `Video exceeds 1920px: ${filename}`);
      const frameRate = parseFrameRate(stream.avg_frame_rate);
      ensure(frameRate !== null && frameRate <= 30.01, `Video exceeds 30fps: ${filename}`);
      ensure(hasFastStart(targetPath), `Video is missing faststart: ${filename}`);
    }
  }

  return { checked, bytes };
}

function main(): void {
  const manifestCount = auditManifest();
  const activeVideoCount = auditActiveVideoTags();
  const staging = auditStaging();

  let remoteSummary = 'skipped';
  if (!skipRemote) {
    const remote = auditRemote();
    remoteSummary = `${(remote.bytes / 1024 / 1024).toFixed(1)}MiB ${JSON.stringify(remote.counts)}`;
  }

  console.info(
    `Media delivery audit passed: manifest=${manifestCount} activeVideos=${activeVideoCount} ` +
      `staging=${staging.checked}/${(staging.bytes / 1024 / 1024).toFixed(1)}MiB remote=${remoteSummary}`,
  );
}

main();
