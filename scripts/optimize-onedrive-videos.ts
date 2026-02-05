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
const defaultRemoteBase = 'oow214-onedrive:';
const remoteBase = normalizeRemoteBase(process.env.ONEDRIVE_REMOTE_BASE ?? defaultRemoteBase);
const shouldUpload = process.env.SKIP_ONEDRIVE_UPLOAD === '1' ? false : true;
const compareRemote = process.env.ONEDRIVE_COMPARE_REMOTE === '1';
const compareRemoteOnFirstRun = true;
const onlyAssetQuery = process.env.ONEDRIVE_ONLY_ASSETS;
const onlyAssetKeys = onlyAssetQuery
  ? onlyAssetQuery.split(',').map(value => value.trim()).filter(Boolean)
  : [];

const maxDimension = Number(process.env.DEV_STORAGE_VIDEO_MAX_DIMENSION ?? '1600');
const maxFps = Number(process.env.DEV_STORAGE_VIDEO_MAX_FPS ?? '30');
const maxOutputMb = Number(process.env.DEV_STORAGE_VIDEO_MAX_MB ?? '10');
const minCrf = Number(process.env.DEV_STORAGE_VIDEO_MIN_CRF ?? '24');
const maxCrf = Number(process.env.DEV_STORAGE_VIDEO_MAX_CRF ?? '34');
const fallbackMaxDimension = Number(process.env.DEV_STORAGE_VIDEO_FALLBACK_MAX_DIMENSION ?? '1280');
const gifMaxFps = Number(process.env.DEV_STORAGE_GIF_MAX_FPS ?? '15');
const gifMinFps = Number(process.env.DEV_STORAGE_GIF_MIN_FPS ?? '6');
const gifFallbackMaxDimension = Number(process.env.DEV_STORAGE_GIF_FALLBACK_MAX_DIMENSION ?? '960');
const gifMinDimension = Number(process.env.DEV_STORAGE_GIF_MIN_DIMENSION ?? '360');
const gifMaxColors = Number(process.env.DEV_STORAGE_GIF_MAX_COLORS ?? '128');
const gifMinColors = Number(process.env.DEV_STORAGE_GIF_MIN_COLORS ?? '32');
const failOnOversize = process.env.DEV_STORAGE_FAIL_ON_VIDEO_MAX === '1';
const isDryRun = process.env.DRY_RUN === '1' || process.env.DEV_STORAGE_DRY_RUN === '1';
const onlyExts = parseExtList(process.env.DEV_STORAGE_ONLY_EXTS);

const devStorageRemoteBasePath = 'Photos/dev-storage/';
const uploadManifestPath = path.join(devStorageOutputRoot, '.upload-manifest-videos.json');
type UploadManifestEntry = { hash: string; size: number; mtimeMs: number };
type UploadManifest = Record<string, UploadManifestEntry>;

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

async function resolveLocalSource(remotePath: string): Promise<string> {
  if (!localRoot) {
    throw new Error('ONEDRIVE_LOCAL_ROOT is not configured.');
  }

  const directCandidates = new Set<string>();
  getNormalizationVariants(remotePath).forEach(relative => {
    directCandidates.add(path.join(localRoot, ...relative.split('/')));
  });

  for (const candidate of directCandidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Local source not found for ${remotePath}`);
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

async function shouldRegenerate(inputPath: string, outputPath: string): Promise<boolean> {
  if (!(await pathExists(outputPath))) return true;
  const [inputStat, outputStat] = await Promise.all([stat(inputPath), stat(outputPath)]);
  if (!isDryRun && outputStat.size > maxOutputMb * 1024 * 1024) {
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
  return `${base}${targetExt}`;
}

async function checkSizeLimit(outputPath: string): Promise<void> {
  if (isDryRun) return;
  const { size } = await stat(outputPath);
  const maxBytes = maxOutputMb * 1024 * 1024;
  if (size <= maxBytes) return;
  const message = `${path.basename(outputPath)} is ${(size / 1024 / 1024).toFixed(1)}MB (max ${maxOutputMb}MB)`;
  if (failOnOversize) {
    throw new Error(message);
  }
  console.warn(`Warning: ${message}`);
}

async function isWithinSizeLimit(outputPath: string): Promise<boolean> {
  if (isDryRun) return true;
  const { size } = await stat(outputPath);
  return size <= maxOutputMb * 1024 * 1024;
}

async function transcodeToMp4(inputPath: string, outputPath: string, options: { maxDim: number; crf: number }): Promise<void> {
  await mkdir(path.dirname(outputPath), { recursive: true });
  if (!(await shouldRegenerate(inputPath, outputPath))) return;
  runCommand('ffmpeg', [
    '-y',
    '-nostdin',
    '-i',
    inputPath,
    '-vf',
    `scale='min(${options.maxDim},iw)':-2,fps=${maxFps}`,
    '-movflags',
    '+faststart',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    `${options.crf}`,
    '-preset',
    'medium',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    outputPath,
  ]);
}

async function transcodeToWebmAlpha(inputPath: string, outputPath: string): Promise<void> {
  await mkdir(path.dirname(outputPath), { recursive: true });
  if (!(await shouldRegenerate(inputPath, outputPath))) return;
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
    if (!(await shouldRegenerate(inputPath, outputPath))) return;
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
    if (await isWithinSizeLimit(outputPath)) {
      return;
    }
    console.warn(`Retrying GIF resize (maxDim=${attempt.maxDim}, fps=${attempt.fps}) for ${path.basename(outputPath)}`);
  }

  await checkSizeLimit(outputPath);
}

async function transcodeMp4WithSizeTarget(inputPath: string, outputPath: string): Promise<void> {
  const crfSteps: number[] = [];
  for (let crf = minCrf; crf <= maxCrf; crf += 2) {
    crfSteps.push(crf);
  }

  for (const crf of crfSteps) {
    await transcodeToMp4(inputPath, outputPath, { maxDim: maxDimension, crf });
    if (await isWithinSizeLimit(outputPath)) {
      return;
    }
    console.warn(`Retrying with higher CRF (crf=${crf + 2}) for ${path.basename(outputPath)}`);
  }

  if (fallbackMaxDimension < maxDimension) {
    for (const crf of crfSteps) {
      await transcodeToMp4(inputPath, outputPath, { maxDim: fallbackMaxDimension, crf });
      if (await isWithinSizeLimit(outputPath)) {
        console.warn(`Downscaled to ${fallbackMaxDimension}px to fit size for ${path.basename(outputPath)}`);
        return;
      }
    }
  }

  await checkSizeLimit(outputPath);
}

function matchesOnlyAssets(asset: typeof onedriveAssets[number], keys: string[]): boolean {
  if (keys.length === 0) return true;
  const ids = Array.isArray(asset.act_id) ? asset.act_id : [asset.act_id];
  return keys.some(key => {
    const normalizedKey = key.toLowerCase();
    if (asset.filename.toLowerCase() === normalizedKey) return true;
    return ids.some(id => id.toLowerCase() === normalizedKey);
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
    const inputPath = await resolveLocalSource(asset.remotePathOriginal);
    const ext = getExtension(asset.filename);
    if (onlyExts.size > 0 && !onlyExts.has(ext)) {
      continue;
    }
    let targetExt = ext;
    if (ext === '.gif') {
      targetExt = '.gif';
    }

    const outputFilename = buildOutputFilename(asset.filename, targetExt);
    const outputPath = path.join(devStorageOutputRoot, outputFilename);
    const remotePath = `${devStorageRemoteBasePath}${outputFilename}`;

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
    const shouldProcess = await shouldRegenerate(target.inputPath, target.outputPath);
    if (!shouldProcess) {
      skipped += 1;
      continue;
    }
    const ext = getExtension(target.outputPath);
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
    await transcodeMp4WithSizeTarget(target.inputPath, target.outputPath);
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
