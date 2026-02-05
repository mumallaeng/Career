import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, constants as fsConstants, mkdir, readFile, stat, writeFile } from 'node:fs/promises';

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
const uploadManifestPath = path.join(devStorageOutputRoot, '.upload-manifest.json');
const compareRemote = process.env.ONEDRIVE_COMPARE_REMOTE === '1';
const compareRemoteOnFirstRun = true;
type UploadManifestEntry = { hash: string; size: number; mtimeMs: number };
type UploadManifest = Record<string, UploadManifestEntry>;

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

function runCommandCapture(command: string, args: string[]): string {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
  return result.stdout ?? '';
}

async function shouldRegenerate(inputPath: string, outputPath: string): Promise<boolean> {
  if (!(await pathExists(outputPath))) return true;
  const [inputStat, outputStat] = await Promise.all([stat(inputPath), stat(outputPath)]);
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
    // Treat missing/errored remote as "needs upload".
    return null;
  }
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

  const manifest = await loadUploadManifest();
  let manifestDirty = false;
  let lastManifestWrite = 0;
  let uploaded = 0;
  let skipped = 0;
  const total = targets.length;

  const flushManifest = async () => {
    if (!manifestDirty) return;
    await writeUploadManifest(manifest);
    manifestDirty = false;
    lastManifestWrite = Date.now();
  };

  const sigintHandler = () => {
    try {
      if (manifestDirty) {
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
          manifest[remoteSpec] = snapshot;
          manifestDirty = true;
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
      `Uploading ${path.basename(target.outputPath)} -> ${remoteSpec} ` +
      `[${index}/${total}] skipped=${skipped} uploaded=${uploaded} remaining=${remaining}`
    );
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
    manifest[remoteSpec] = snapshot;
    manifestDirty = true;
    uploaded += 1;

    if (Date.now() - lastManifestWrite > 500) {
      await flushManifest();
    }
  }
  await flushManifest();

  console.info(`Upload summary: total=${total} uploaded=${uploaded} skipped=${skipped}`);
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
