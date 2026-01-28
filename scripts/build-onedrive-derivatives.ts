import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { access, constants as fsConstants, mkdir, stat, writeFile } from 'node:fs/promises';

import { onedriveAssets } from '../src/data/onedrive-assets';
import { buildThumbAssetSet } from './onedrive-thumb-targets';

const sizes = [
  { label: 'thumb', maxSize: 480 },
  { label: 'default', maxSize: 1600 },
] as const;

type SizeLabel = (typeof sizes)[number]['label'];

type ResizeTarget = {
  label: SizeLabel;
  maxSize: number;
  inputPath: string;
  outputPath: string;
  remotePath: string;
};

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
const rcloneConfigDir = path.join(projectRoot, '.rclone-config');
const thumbAssets = buildThumbAssetSet(projectRoot);
const rcloneChunkSize = process.env.RCLONE_ONEDRIVE_CHUNK_SIZE;
const rcloneTransfers = process.env.RCLONE_TRANSFERS;
const rcloneCheckers = process.env.RCLONE_CHECKERS;
const rcloneExtraArgs = process.env.RCLONE_EXTRA_ARGS?.split(' ').filter(Boolean) ?? [];

function normalizeRemoteBase(value: string): string {
  return value.endsWith(':') ? value : `${value}:`;
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

async function ensureRcloneConfig(): Promise<void> {
  if (process.env.RCLONE_CONFIG && (await pathExists(process.env.RCLONE_CONFIG))) {
    return;
  }

  const inlineConfig = process.env.RCLONE_CONFIG_CONTENTS;
  const base64Config = process.env.RCLONE_CONFIG_BASE64;
  const configContents = inlineConfig ?? (base64Config ? Buffer.from(base64Config, 'base64').toString('utf8') : null);

  if (!configContents) {
    return;
  }

  await mkdir(rcloneConfigDir, { recursive: true });
  const configPath = path.join(rcloneConfigDir, 'rclone.conf');
  await writeFile(configPath, configContents, { mode: 0o600 });
  process.env.RCLONE_CONFIG = configPath;
  console.info(`Wrote RCLONE_CONFIG to ${configPath}`);
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
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

async function shouldRegenerate(inputPath: string, outputPath: string): Promise<boolean> {
  if (!(await pathExists(outputPath))) return true;
  const [inputStat, outputStat] = await Promise.all([stat(inputPath), stat(outputPath)]);
  return inputStat.mtimeMs > outputStat.mtimeMs;
}

async function buildTargets(): Promise<ResizeTarget[]> {
  const targets: ResizeTarget[] = [];
  for (const asset of onedriveAssets) {
    if (!asset.isResizableImage) continue;
    let inputPath: string;
    try {
      inputPath = await resolveLocalSource(asset.remotePathOriginal);
    } catch (error) {
      console.warn(`Skipping missing local source: ${asset.remotePathOriginal} (${(error as Error).message})`);
      continue;
    }
    for (const { label, maxSize } of sizes) {
      if (label === 'thumb' && !thumbAssets.has(asset.filename)) {
        continue;
      }
      const outputPath = label === 'thumb'
        ? path.join(devStorageOutputRoot, 'thumb', asset.filename)
        : path.join(devStorageOutputRoot, asset.filename);
      const remotePath = label === 'thumb' ? asset.remotePathThumb : asset.remotePath;
      targets.push({ label, maxSize, inputPath, outputPath, remotePath });
    }
  }
  return targets;
}

async function resizeImages(targets: ResizeTarget[]): Promise<void> {
  for (const target of targets) {
    await mkdir(path.dirname(target.outputPath), { recursive: true });
    if (!(await shouldRegenerate(target.inputPath, target.outputPath))) {
      continue;
    }
    console.info(`Resizing ${path.basename(target.inputPath)} -> ${target.label} (${target.maxSize}px)`);
    runCommand('sips', ['-Z', `${target.maxSize}`, target.inputPath, '--out', target.outputPath]);
  }
}

async function uploadDevStorage(targets: ResizeTarget[]): Promise<void> {
  if (!shouldUpload) {
    console.info('SKIP_ONEDRIVE_UPLOAD=1 set; skipping upload.');
    return;
  }

  for (const target of targets) {
    const remoteSpec = `${remoteBase}${target.remotePath}`;
    console.info(`Uploading ${path.basename(target.outputPath)} -> ${remoteSpec}`);
    const args = ['copyto', target.outputPath, remoteSpec];
    if (rcloneChunkSize) {
      args.push('--onedrive-chunk-size', rcloneChunkSize);
    }
    if (rcloneTransfers) {
      args.push('--transfers', rcloneTransfers);
    }
    if (rcloneCheckers) {
      args.push('--checkers', rcloneCheckers);
    }
    if (rcloneExtraArgs.length > 0) {
      args.push(...rcloneExtraArgs);
    }
    runCommand('rclone', args);
  }
}

async function main() {
  if (!localRoot) {
    throw new Error('ONEDRIVE_LOCAL_ROOT is required to build dev-storage assets.');
  }
  if (!commandExists('sips')) {
    throw new Error('sips is required (macOS). Install ImageMagick or use a Mac environment.');
  }
  if (!commandExists('rclone')) {
    throw new Error('rclone is required in PATH to upload dev-storage assets.');
  }

  await ensureRcloneConfig();
  const targets = await buildTargets();
  await resizeImages(targets);
  await uploadDevStorage(targets);
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
