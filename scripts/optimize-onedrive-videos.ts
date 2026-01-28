import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { access, constants as fsConstants, mkdir, stat, copyFile } from 'node:fs/promises';

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

const maxDimension = Number(process.env.DEV_STORAGE_VIDEO_MAX_DIMENSION ?? '1600');
const maxFps = Number(process.env.DEV_STORAGE_VIDEO_MAX_FPS ?? '30');
const maxOutputMb = Number(process.env.DEV_STORAGE_VIDEO_MAX_MB ?? '10');
const minCrf = Number(process.env.DEV_STORAGE_VIDEO_MIN_CRF ?? '24');
const maxCrf = Number(process.env.DEV_STORAGE_VIDEO_MAX_CRF ?? '34');
const fallbackMaxDimension = Number(process.env.DEV_STORAGE_VIDEO_FALLBACK_MAX_DIMENSION ?? '1280');
const keepGifMaxMb = Number(process.env.DEV_STORAGE_KEEP_GIF_MAX_MB ?? '2');
const failOnOversize = process.env.DEV_STORAGE_FAIL_ON_VIDEO_MAX === '1';
const isDryRun = process.env.DRY_RUN === '1' || process.env.DEV_STORAGE_DRY_RUN === '1';

const keepGifSet = splitEnvList(process.env.DEV_STORAGE_KEEP_GIF_FILENAMES);
const alphaWebmSet = splitEnvList(process.env.DEV_STORAGE_ALPHA_WEBM_FILENAMES);

const devStorageRemoteBasePath = 'Photos/dev-storage/';

function normalizeRemoteBase(value: string): string {
  return value.endsWith(':') ? value : `${value}:`;
}

function splitEnvList(value?: string): Set<string> {
  if (!value) return new Set();
  return new Set(value.split(',').map(item => item.trim()).filter(Boolean));
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

async function copyOriginal(inputPath: string, outputPath: string): Promise<void> {
  await mkdir(path.dirname(outputPath), { recursive: true });
  if (!(await shouldRegenerate(inputPath, outputPath))) return;
  if (isDryRun) {
    console.info(`[dry-run] copy ${path.basename(inputPath)} -> ${outputPath}`);
    return;
  }
  await copyFile(inputPath, outputPath);
  await checkSizeLimit(outputPath);
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

async function buildTargets(): Promise<Array<{ inputPath: string; outputPath: string; remotePath: string }>> {
  const targets: Array<{ inputPath: string; outputPath: string; remotePath: string }> = [];
  const videoAssets = onedriveAssets.filter(asset => {
    const ext = getExtension(asset.filename);
    return ext === '.gif' || ext === '.mp4' || ext === '.webm';
  });

  for (const asset of videoAssets) {
    const inputPath = await resolveLocalSource(asset.remotePathOriginal);
    const ext = getExtension(asset.filename);
    const inputStat = await stat(inputPath);
    const shouldKeepGif = ext === '.gif'
      && (keepGifSet.has(asset.filename) || inputStat.size <= keepGifMaxMb * 1024 * 1024);
    const shouldWebmAlpha = ext === '.gif' && alphaWebmSet.has(asset.filename);

    let targetExt = ext;
    if (ext === '.gif') {
      if (shouldKeepGif) {
        targetExt = '.gif';
      } else if (shouldWebmAlpha) {
        targetExt = '.webm';
      } else {
        targetExt = '.mp4';
      }
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
      await copyOriginal(target.inputPath, target.outputPath);
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

  for (const target of targets) {
    const remoteSpec = `${remoteBase}${target.remotePath}`;
    console.info(`${isDryRun ? '[dry-run] ' : ''}Uploading ${path.basename(target.outputPath)} -> ${remoteSpec}`);
    runCommand('rclone', ['copyto', target.outputPath, remoteSpec]);
  }
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
