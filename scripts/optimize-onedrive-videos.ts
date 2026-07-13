import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { access, constants as fsConstants, mkdir, readFile, stat, writeFile } from 'node:fs/promises';

import { onedriveAssets } from '../src/data/onedrive-assets';

const projectRoot = process.cwd();
const devStorageOutputRoot = process.env.DEV_STORAGE_OUTPUT_ROOT
  ? path.resolve(process.env.DEV_STORAGE_OUTPUT_ROOT)
  : process.env.ONEDRIVE_DEV_STORAGE_OUTPUT_ROOT
    ? path.resolve(process.env.ONEDRIVE_DEV_STORAGE_OUTPUT_ROOT)
    : path.join(projectRoot, '.dev-storage-media');

const localRoot = process.env.ONEDRIVE_LOCAL_ROOT;
const sourceCacheRoot = process.env.DEV_STORAGE_SOURCE_CACHE_ROOT
  ? path.resolve(process.env.DEV_STORAGE_SOURCE_CACHE_ROOT)
  : path.join(projectRoot, '.dev-storage-source-cache');
const defaultRemoteBase = 'oow214-onedrive:';
const remoteBase = normalizeRemoteBase(process.env.ONEDRIVE_REMOTE_BASE ?? defaultRemoteBase);
const shouldUpload = process.env.SKIP_ONEDRIVE_UPLOAD === '1' ? false : true;
const compareRemote = process.env.ONEDRIVE_COMPARE_REMOTE === '1';
const compareRemoteOnFirstRun = true;
const onlyAssetQuery = process.env.ONEDRIVE_ONLY_ASSETS;
const onlyAssetKeys = onlyAssetQuery
  ? onlyAssetQuery.split(',').map(value => value.trim()).filter(Boolean)
  : [];

const maxDimension = Number(process.env.DEV_STORAGE_VIDEO_MAX_DIMENSION ?? '1920');
const maxFps = Number(process.env.DEV_STORAGE_VIDEO_MAX_FPS ?? '30');
const maxOutputMb = Number(process.env.DEV_STORAGE_VIDEO_MAX_MB ?? '90');
const videoCrf = Number(process.env.DEV_STORAGE_VIDEO_CRF ?? '20');
const videoPreset = process.env.DEV_STORAGE_VIDEO_PRESET ?? 'slow';
const videoAudioBitrate = process.env.DEV_STORAGE_VIDEO_AUDIO_BITRATE ?? '160k';
const gifMaxFps = Number(process.env.DEV_STORAGE_GIF_MAX_FPS ?? '15');
const gifMinFps = Number(process.env.DEV_STORAGE_GIF_MIN_FPS ?? '6');
const gifFallbackMaxDimension = Number(process.env.DEV_STORAGE_GIF_FALLBACK_MAX_DIMENSION ?? '960');
const gifMinDimension = Number(process.env.DEV_STORAGE_GIF_MIN_DIMENSION ?? '360');
const gifMaxColors = Number(process.env.DEV_STORAGE_GIF_MAX_COLORS ?? '128');
const gifMinColors = Number(process.env.DEV_STORAGE_GIF_MIN_COLORS ?? '32');
const gifMaxOutputMb = Number(process.env.DEV_STORAGE_GIF_MAX_MB ?? '10');
const allowOversize = process.env.DEV_STORAGE_ALLOW_OVERSIZE === '1';
const forceRegenerate = process.env.DEV_STORAGE_FORCE === '1';
const isDryRun = process.env.DRY_RUN === '1' || process.env.DEV_STORAGE_DRY_RUN === '1';
const onlyExts = parseExtList(process.env.DEV_STORAGE_ONLY_EXTS);

const uploadManifestPath = path.join(devStorageOutputRoot, '.upload-manifest-videos.json');
type UploadManifestEntry = { hash: string; size: number; mtimeMs: number };
type UploadManifest = Record<string, UploadManifestEntry>;
const remoteDirectoryListingCache = new Map<string, Map<string, string[]>>();

function normalizeRemoteBase(value: string): string {
  return value.endsWith(':') ? value : `${value}:`;
}

function parseExtList(value?: string): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(',')
      .map(item => item.trim().toLowerCase())
      .filter(Boolean)
      .map(item => (item.startsWith('.') ? item : `.${item}`))
  );
}

function commandExists(command: string): boolean {
  const result = spawnSync(command, ['-h'], { stdio: 'ignore' });
  return result.status === 0;
}

async function pathExists(target?: string | null): Promise<boolean> {
  if (!target) return false;
  try {
    await access(target, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function isMaterializedFile(target: string): Promise<boolean> {
  try {
    const fileStats = await stat(target);
    if (!fileStats.isFile()) return false;
    if (process.platform !== 'darwin' || fileStats.size === 0) return true;
    return typeof fileStats.blocks !== 'number' || fileStats.blocks > 0;
  } catch {
    return false;
  }
}

function getNormalizationVariants(value: string): string[] {
  const variants = new Set<string>();
  variants.add(value);
  try {
    variants.add(value.normalize('NFC'));
  } catch {
    // ignore
  }
  try {
    variants.add(value.normalize('NFD'));
  } catch {
    // ignore
  }
  return Array.from(variants);
}

function buildRemoteLookupKey(value: string): string {
  return value.normalize('NFC').toLowerCase();
}

function resolveRemoteActualPath(remotePath: string): string {
  const directory = path.posix.dirname(remotePath);
  const expectedFilename = path.posix.basename(remotePath);
  let entriesByKey = remoteDirectoryListingCache.get(directory);

  if (!entriesByKey) {
    const listing = runCommandCapture('rclone', [
      'lsjson',
      `${remoteBase}${directory}`,
      '--files-only',
      '--max-depth',
      '1',
    ]);
    const entries = JSON.parse(listing) as Array<{ Path?: string; Name?: string; IsDir?: boolean }>;
    entriesByKey = new Map<string, string[]>();
    for (const entry of entries) {
      if (entry.IsDir) continue;
      const filename = entry.Path ?? entry.Name;
      if (!filename) continue;
      const key = buildRemoteLookupKey(filename);
      entriesByKey.set(key, [...(entriesByKey.get(key) ?? []), filename]);
    }
    remoteDirectoryListingCache.set(directory, entriesByKey);
  }

  const matches = entriesByKey.get(buildRemoteLookupKey(expectedFilename)) ?? [];
  if (matches.length !== 1) {
    throw new Error(
      `Expected one remote video source for ${remotePath}, found ${matches.length}:\n` +
        matches.map(match => `- ${match}`).join('\n'),
    );
  }
  return `${directory}/${matches[0]}`;
}

async function resolveLocalSource(remotePath: string): Promise<string> {
  if (!localRoot) {
    throw new Error('ONEDRIVE_LOCAL_ROOT is not configured.');
  }

  const sourceRoots = [localRoot, sourceCacheRoot];
  for (const sourceRoot of sourceRoots) {
    const directCandidates = new Set<string>();
    getNormalizationVariants(remotePath).forEach(relative => {
      directCandidates.add(path.join(sourceRoot, ...relative.split('/')));
    });

    for (const candidate of directCandidates) {
      if (await isMaterializedFile(candidate)) {
        return candidate;
      }
    }
  }

  if (!commandExists('rclone')) {
    throw new Error(`rclone is required to cache online-only video source: ${remotePath}`);
  }
  const cachePath = path.join(sourceCacheRoot, ...remotePath.split('/'));
  await mkdir(path.dirname(cachePath), { recursive: true });
  console.info(`Caching online-only video source ${remotePath}`);
  const actualRemotePath = resolveRemoteActualPath(remotePath);
  runCommand('rclone', ['copyto', `${remoteBase}${actualRemotePath}`, cachePath]);
  if (!(await isMaterializedFile(cachePath))) {
    throw new Error(`Unable to materialize video source: ${remotePath}`);
  }
  return cachePath;
}

function runCommand(command: string, args: string[]) {
  if (isDryRun) {
    console.info(`[dry-run] ${command} ${args.join(' ')}`);
    return;
  }
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function runCommandCapture(command: string, args: string[]): string {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
  return result.stdout ?? '';
}

function hasAudioStream(targetPath: string): boolean {
  const result = spawnSync('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'a',
    '-show_entries',
    'stream=codec_type',
    '-of',
    'csv=p=0',
    targetPath,
  ], { encoding: 'utf8' });
  if (result.status !== 0) {
    return false;
  }
  return result.stdout.trim().length > 0;
}

async function shouldRegenerate(
  inputPath: string,
  outputPath: string,
  targetMaxMb: number = maxOutputMb,
): Promise<boolean> {
  if (forceRegenerate) return true;
  if (!(await pathExists(outputPath))) return true;
  const [inputStat, outputStat] = await Promise.all([stat(inputPath), stat(outputPath)]);
  if (!isDryRun && outputStat.size > targetMaxMb * 1024 * 1024) {
    return true;
  }
  if (!isDryRun) {
    const inputHasAudio = hasAudioStream(inputPath);
    const outputHasAudio = hasAudioStream(outputPath);
    if (inputHasAudio && !outputHasAudio) {
      return true;
    }
  }
  return inputStat.mtimeMs > outputStat.mtimeMs;
}

async function loadUploadManifest(): Promise<UploadManifest> {
  if (!(await pathExists(uploadManifestPath))) return {};
  try {
    const contents = await readFile(uploadManifestPath, 'utf8');
    const parsed = JSON.parse(contents) as UploadManifest;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeUploadManifest(manifest: UploadManifest): Promise<void> {
  await writeFile(uploadManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function hashFile(targetPath: string): Promise<{ hash: string; size: number; mtimeMs: number }> {
  const [contents, stats] = await Promise.all([readFile(targetPath), stat(targetPath)]);
  const hash = createHash('sha256').update(contents).digest('hex');
  return { hash, size: stats.size, mtimeMs: stats.mtimeMs };
}

async function hashFileSha1(targetPath: string): Promise<string> {
  const contents = await readFile(targetPath);
  return createHash('sha1').update(contents).digest('hex');
}

function parseRemoteHash(output: string): { hash?: string; size?: number } | null {
  const trimmed = output.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as Array<{ Hashes?: Record<string, string>; Size?: number }>;
    const first = parsed?.[0];
    if (!first) return null;
    const hash = first.Hashes?.SHA1 ?? first.Hashes?.sha1;
    const size = typeof first.Size === 'number' ? first.Size : undefined;
    return { hash, size };
  } catch {
    return null;
  }
}

function getRemoteSha1(remoteSpec: string): { hash?: string; size?: number } | null {
  try {
    const output = runCommandCapture('rclone', ['lsjson', '--hash', '--hash-type', 'sha1', remoteSpec]);
    return parseRemoteHash(output);
  } catch {
    return null;
  }
}

function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

function buildOutputFilename(filename: string, targetExt: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  return `${base}${targetExt}`.normalize('NFC');
}

async function checkSizeLimit(outputPath: string, maxMb: number = maxOutputMb): Promise<void> {
  if (isDryRun) return;
  const { size } = await stat(outputPath);
  const maxBytes = maxMb * 1024 * 1024;
  if (size <= maxBytes) return;
  const message = `${path.basename(outputPath)} is ${(size / 1024 / 1024).toFixed(1)}MB (max ${maxMb}MB)`;
  if (allowOversize) {
    console.warn(`Warning: ${message}`);
    return;
  }
  throw new Error(message);
}

async function isWithinSizeLimit(outputPath: string, maxMb: number = maxOutputMb): Promise<boolean> {
  if (isDryRun) return true;
  const { size } = await stat(outputPath);
  return size <= maxMb * 1024 * 1024;
}

function readVideoFrameRate(inputPath: string): number | null {
  const result = spawnSync('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=avg_frame_rate',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    inputPath,
  ], { encoding: 'utf8' });
  if (result.status !== 0) return null;
  const [numerator, denominator = '1'] = result.stdout.trim().split('/');
  const rate = Number(numerator) / Number(denominator);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

function buildVideoFilter(inputPath: string): string {
  const filters = [
    `scale='min(${maxDimension},iw)':'min(${maxDimension},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2`,
  ];
  const sourceFps = readVideoFrameRate(inputPath);
  if (sourceFps !== null && sourceFps > maxFps) {
    filters.push(`fps=${maxFps}`);
  }
  return filters.join(',');
}

async function transcodeToMp4(inputPath: string, outputPath: string): Promise<void> {
  await mkdir(path.dirname(outputPath), { recursive: true });
  runCommand('ffmpeg', [
    '-y',
    '-nostdin',
    '-i',
    inputPath,
    '-map',
    '0:v:0',
    '-map',
    '0:a:0?',
    '-vf',
    buildVideoFilter(inputPath),
    '-c:v',
    'libx264',
    '-movflags',
    '+faststart',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    `${videoCrf}`,
    '-preset',
    videoPreset,
    '-tag:v',
    'avc1',
    '-c:a',
    'aac',
    '-b:a',
    videoAudioBitrate,
    outputPath,
  ]);
  await checkSizeLimit(outputPath);
}

async function transcodeToWebmAlpha(inputPath: string, outputPath: string): Promise<void> {
  await mkdir(path.dirname(outputPath), { recursive: true });
  runCommand('ffmpeg', [
    '-y',
    '-nostdin',
    '-i',
    inputPath,
    '-vf',
    `scale='min(${maxDimension},iw)':-2,fps=${maxFps},format=yuva420p`,
    '-c:v',
    'libvpx-vp9',
    '-crf',
    '33',
    '-b:v',
    '0',
    '-c:a',
    'libopus',
    '-b:a',
    '96k',
    outputPath,
  ]);
  await checkSizeLimit(outputPath);
}

async function transcodeGifWithSizeTarget(inputPath: string, outputPath: string): Promise<void> {
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
  const clampDim = (value: number) => clamp(value, gifMinDimension, maxDimension);
  const clampFps = (value: number) => clamp(value, gifMinFps, gifMaxFps);
  const clampColors = (value: number) => clamp(value, gifMinColors, gifMaxColors);
  const attempts: Array<{ maxDim: number; fps: number; colors: number }> = [
    { maxDim: clampDim(maxDimension), fps: clampFps(gifMaxFps), colors: clampColors(gifMaxColors) },
    { maxDim: clampDim(gifFallbackMaxDimension), fps: clampFps(gifMaxFps), colors: clampColors(gifMaxColors) },
    {
      maxDim: clampDim(gifFallbackMaxDimension),
      fps: clampFps(gifMaxFps - 5),
      colors: clampColors(Math.floor(gifMaxColors * 0.75)),
    },
    { maxDim: clampDim(Math.min(gifFallbackMaxDimension, 720)), fps: clampFps(10), colors: clampColors(64) },
    { maxDim: clampDim(Math.min(gifFallbackMaxDimension, 640)), fps: clampFps(8), colors: clampColors(48) },
    { maxDim: clampDim(Math.min(gifFallbackMaxDimension, 560)), fps: clampFps(8), colors: clampColors(40) },
    { maxDim: clampDim(Math.min(gifFallbackMaxDimension, 480)), fps: clampFps(6), colors: clampColors(32) },
    { maxDim: clampDim(gifMinDimension), fps: clampFps(gifMinFps), colors: clampColors(gifMinColors) },
  ];

  const seen = new Set<string>();
  const normalizedAttempts = attempts.filter((attempt) => {
    const key = `${attempt.maxDim}:${attempt.fps}:${attempt.colors}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  for (const attempt of normalizedAttempts) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    const vf = `fps=${attempt.fps},scale='min(${attempt.maxDim},iw)':-2:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff:max_colors=${attempt.colors}[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4`;
    runCommand('ffmpeg', [
      '-y',
      '-nostdin',
      '-i',
      inputPath,
      '-vf',
      vf,
      '-gifflags',
      '-offsetting',
      outputPath,
    ]);
    if (await isWithinSizeLimit(outputPath, gifMaxOutputMb)) {
      return;
    }
    console.warn(`Retrying GIF resize (maxDim=${attempt.maxDim}, fps=${attempt.fps}) for ${path.basename(outputPath)}`);
  }

  await checkSizeLimit(outputPath, gifMaxOutputMb);
}

function matchesOnlyAssets(asset: typeof onedriveAssets[number], keys: string[]): boolean {
  if (keys.length === 0) return true;
  const ids = Array.isArray(asset.act_id) ? asset.act_id : [asset.act_id];
  return keys.some(key => {
    const normalizedKey = key.normalize('NFC').toLowerCase();
    if (asset.filename.normalize('NFC').toLowerCase() === normalizedKey) return true;
    return ids.some(id => id.normalize('NFC').toLowerCase() === normalizedKey);
  });
}

async function buildTargets(): Promise<Array<{ inputPath: string; outputPath: string; remotePath: string }>> {
  const targets: Array<{ inputPath: string; outputPath: string; remotePath: string }> = [];
  const videoAssets = onedriveAssets.filter(asset => {
    if (!matchesOnlyAssets(asset, onlyAssetKeys)) return false;
    const ext = getExtension(asset.filename);
    return ext === '.gif' || ext === '.mp4' || ext === '.webm';
  });

  for (const asset of videoAssets) {
    const ext = getExtension(asset.filename);
    if (onlyExts.size > 0 && !onlyExts.has(ext)) {
      continue;
    }
    const inputPath = await resolveLocalSource(asset.remotePathOriginal);
    let targetExt = ext;
    if (ext === '.gif') {
      targetExt = '.gif';
    }

    const outputFilename = buildOutputFilename(asset.filename, targetExt);
    const outputPath = path.join(devStorageOutputRoot, outputFilename);
    const remotePath = asset.remotePath;

    targets.push({ inputPath, outputPath, remotePath });
  }

  return targets;
}

async function optimizeVideos(targets: Array<{ inputPath: string; outputPath: string }>): Promise<{
  processed: number;
  skipped: number;
  byType: Record<string, number>;
}> {
  let processed = 0;
  let skipped = 0;
  const byType: Record<string, number> = {};
  for (const target of targets) {
    const ext = getExtension(target.outputPath);
    const targetMaxMb = ext === '.gif' ? gifMaxOutputMb : maxOutputMb;
    const shouldProcess = await shouldRegenerate(target.inputPath, target.outputPath, targetMaxMb);
    if (!shouldProcess) {
      skipped += 1;
      continue;
    }
    byType[ext] = (byType[ext] ?? 0) + 1;
    if (ext === '.gif') {
      await transcodeGifWithSizeTarget(target.inputPath, target.outputPath);
      processed += 1;
      continue;
    }
    if (ext === '.webm') {
      await transcodeToWebmAlpha(target.inputPath, target.outputPath);
      processed += 1;
      continue;
    }
    await transcodeToMp4(target.inputPath, target.outputPath);
    processed += 1;
  }
  return { processed, skipped, byType };
}

async function uploadVideos(targets: Array<{ outputPath: string; remotePath: string }>): Promise<void> {
  if (!shouldUpload) {
    console.info('SKIP_ONEDRIVE_UPLOAD=1 set; skipping upload.');
    return;
  }

  const manifest = await loadUploadManifest();
  let manifestDirty = false;
  let lastManifestWrite = 0;
  let uploaded = 0;
  let skipped = 0;
  const total = targets.length;

  const flushManifest = async () => {
    if (!manifestDirty || isDryRun) return;
    await writeUploadManifest(manifest);
    manifestDirty = false;
    lastManifestWrite = Date.now();
  };

  const sigintHandler = () => {
    try {
      if (manifestDirty && !isDryRun) {
        writeFile(uploadManifestPath, `${JSON.stringify(manifest, null, 2)}\n`).catch(() => undefined);
      }
    } finally {
      process.exit(130);
    }
  };

  process.once('SIGINT', sigintHandler);

  let index = 0;
  for (const target of targets) {
    index += 1;
    const remaining = total - index;
    const remoteSpec = `${remoteBase}${target.remotePath}`;
    const snapshot = await hashFile(target.outputPath);
    const previous = manifest[remoteSpec];
    if (!previous && compareRemoteOnFirstRun) {
      const remoteInfo = getRemoteSha1(remoteSpec);
      if (remoteInfo?.hash && typeof remoteInfo.size === 'number') {
        const localSha1 = await hashFileSha1(target.outputPath);
        if (remoteInfo.hash === localSha1 && remoteInfo.size === snapshot.size) {
          skipped += 1;
          console.info(
            `Skipping unchanged (remote) ${path.basename(target.outputPath)} -> ${remoteSpec} ` +
            `[${index}/${total}] skipped=${skipped} uploaded=${uploaded} remaining=${remaining}`
          );
          if (!isDryRun) {
            manifest[remoteSpec] = snapshot;
            manifestDirty = true;
          }
          continue;
        }
      }
    } else if (compareRemote && previous) {
      const remoteInfo = getRemoteSha1(remoteSpec);
      if (remoteInfo?.hash && typeof remoteInfo.size === 'number') {
        const localSha1 = await hashFileSha1(target.outputPath);
        if (remoteInfo.hash === localSha1 && remoteInfo.size === snapshot.size) {
          skipped += 1;
          console.info(
            `Skipping unchanged (remote) ${path.basename(target.outputPath)} -> ${remoteSpec} ` +
            `[${index}/${total}] skipped=${skipped} uploaded=${uploaded} remaining=${remaining}`
          );
          continue;
        }
      } else if (previous.hash === snapshot.hash && previous.size === snapshot.size) {
        skipped += 1;
        console.info(
          `Skipping unchanged (local) ${path.basename(target.outputPath)} -> ${remoteSpec} ` +
          `[${index}/${total}] skipped=${skipped} uploaded=${uploaded} remaining=${remaining}`
        );
        continue;
      }
    } else if (previous && previous.hash === snapshot.hash && previous.size === snapshot.size) {
      skipped += 1;
      console.info(
        `Skipping unchanged ${path.basename(target.outputPath)} -> ${remoteSpec} ` +
        `[${index}/${total}] skipped=${skipped} uploaded=${uploaded} remaining=${remaining}`
      );
      continue;
    }

    console.info(
      `${isDryRun ? '[dry-run] ' : ''}Uploading ${path.basename(target.outputPath)} -> ${remoteSpec} ` +
      `[${index}/${total}] skipped=${skipped} uploaded=${uploaded} remaining=${remaining}`
    );
    runCommand('rclone', ['copyto', target.outputPath, remoteSpec]);
    if (!isDryRun) {
      manifest[remoteSpec] = snapshot;
      manifestDirty = true;
      uploaded += 1;
      if (Date.now() - lastManifestWrite > 500) {
        await flushManifest();
      }
    }
  }

  await flushManifest();
  console.info(`Upload summary: total=${total} uploaded=${uploaded} skipped=${skipped}`);
}

async function main() {
  if (!localRoot) {
    throw new Error('ONEDRIVE_LOCAL_ROOT is required to optimize dev-storage videos.');
  }
  if (!commandExists('ffmpeg')) {
    throw new Error('ffmpeg is required in PATH to optimize video assets.');
  }
  if (shouldUpload && !commandExists('rclone')) {
    throw new Error('rclone is required in PATH to upload dev-storage videos.');
  }

  const targets = await buildTargets();
  console.info(
    `Video quality settings: max=${maxDimension}px fps<=${maxFps} crf=${videoCrf} ` +
      `preset=${videoPreset} audio=${videoAudioBitrate} limit=${maxOutputMb}MB`,
  );
  const summary = await optimizeVideos(targets);
  await uploadVideos(targets);
  const total = targets.length;
  console.info(
    `Done. total=${total} processed=${summary.processed} skipped=${summary.skipped} ` +
    `types=${Object.entries(summary.byType).map(([ext, count]) => `${ext}:${count}`).join(', ') || 'none'}`
  );
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
