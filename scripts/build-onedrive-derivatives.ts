import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, constants as fsConstants, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';

import { onedriveAssets } from '../src/data/onedrive-assets';
import { authoritativeDevStorageRemoteBasePath } from '../src/data/onedrive-paths';

const sizes = [
  { label: 'default', maxSize: 1920, quality: 92 },
] as const;

type SizeLabel = (typeof sizes)[number]['label'];

type ResizeTarget = {
  label: SizeLabel;
  maxSize: number;
  quality: number;
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
const sourceCacheRoot = process.env.DEV_STORAGE_SOURCE_CACHE_ROOT
  ? path.resolve(process.env.DEV_STORAGE_SOURCE_CACHE_ROOT)
  : path.join(projectRoot, '.dev-storage-source-cache');
const defaultRemoteBase = 'oow214-onedrive:';
const remoteBase = normalizeRemoteBase(process.env.ONEDRIVE_REMOTE_BASE ?? defaultRemoteBase);
const shouldUpload = process.env.SKIP_ONEDRIVE_UPLOAD === '1' ? false : true;
const rcloneConfigDir = path.join(projectRoot, '.rclone-config');
const onlyAssetQuery = process.env.ONEDRIVE_ONLY_ASSETS;
const onlyAssetKeys = onlyAssetQuery
  ? onlyAssetQuery.split(',').map(value => value.trim()).filter(Boolean)
  : [];
const rcloneChunkSize = process.env.RCLONE_ONEDRIVE_CHUNK_SIZE;
const rcloneTransfers = process.env.RCLONE_TRANSFERS;
const rcloneCheckers = process.env.RCLONE_CHECKERS;
const rcloneExtraArgs = process.env.RCLONE_EXTRA_ARGS?.split(' ').filter(Boolean) ?? [];
const uploadManifestPath = path.join(devStorageOutputRoot, '.upload-manifest.json');
const compareRemote = process.env.ONEDRIVE_COMPARE_REMOTE === '1';
const compareRemoteOnFirstRun = true;
const forceRegenerate = process.env.DEV_STORAGE_IMAGE_FORCE === '1';
const useBatchUpload = process.env.DEV_STORAGE_BATCH_UPLOAD !== '0';
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

function buildRemoteLookupKey(value: string): string {
  return value.normalize('NFC').toLowerCase();
}

async function resolveSourceUnderRoot(root: string, remotePath: string): Promise<string | null> {
  const directCandidates = new Set<string>();
  getNormalizationVariants(remotePath).forEach(relative => {
    directCandidates.add(path.join(root, ...relative.split('/')));
  });

  for (const candidate of directCandidates) {
    if (await isMaterializedFile(candidate)) {
      return candidate;
    }
  }

  const remoteDirectory = path.posix.dirname(remotePath);
  const expectedFilename = path.posix.basename(remotePath);
  const localDirectory = path.join(root, ...remoteDirectory.split('/'));
  if (await pathExists(localDirectory)) {
    const matchingEntries = (await readdir(localDirectory)).filter(
      entry => buildRemoteLookupKey(entry) === buildRemoteLookupKey(expectedFilename),
    );
    if (matchingEntries.length > 1) {
      throw new Error(
        `Local source normalization collision for ${remotePath}:\n` +
          matchingEntries.map(entry => `- ${entry}`).join('\n'),
      );
    }
    if (matchingEntries.length === 1) {
      const candidate = path.join(localDirectory, matchingEntries[0]);
      if (await isMaterializedFile(candidate)) return candidate;
    }
  }

  return null;
}

async function resolveLocalSource(remotePath: string): Promise<string> {
  if (localRoot) {
    const localSource = await resolveSourceUnderRoot(localRoot, remotePath);
    if (localSource) return localSource;
  }

  const cachedSource = await resolveSourceUnderRoot(sourceCacheRoot, remotePath);
  if (cachedSource) return cachedSource;

  throw new Error(`Local source not found for ${remotePath}`);
}

async function prefetchRemoteSources(assets: readonly typeof onedriveAssets[number][]): Promise<void> {
  const needsRemote: typeof onedriveAssets[number][] = [];
  for (const asset of assets) {
    const localSource = localRoot
      ? await resolveSourceUnderRoot(localRoot, asset.remotePathOriginal)
      : null;
    if (!localSource) needsRemote.push(asset);
  }

  if (needsRemote.length === 0) return;
  if (!commandExists('rclone')) {
    throw new Error(`rclone is required to cache ${needsRemote.length} online-only image sources.`);
  }

  await ensureRcloneConfig();
  const assetsByDirectory = new Map<string, typeof onedriveAssets[number][]>();
  for (const asset of needsRemote) {
    const directory = path.posix.dirname(asset.remotePathOriginal);
    const directoryAssets = assetsByDirectory.get(directory) ?? [];
    directoryAssets.push(asset);
    assetsByDirectory.set(directory, directoryAssets);
  }

  let batchIndex = 0;
  for (const [directory, directoryAssets] of assetsByDirectory) {
    batchIndex += 1;
    const remoteSpec = `${remoteBase}${directory}`;
    const listing = runCommandCapture('rclone', [
      'lsjson',
      remoteSpec,
      '--files-only',
      '--max-depth',
      '1',
    ]);
    const remoteEntries = JSON.parse(listing) as Array<{ Path?: string; Name?: string; IsDir?: boolean }>;
    const entriesByKey = new Map<string, string[]>();
    for (const entry of remoteEntries) {
      if (entry.IsDir) continue;
      const filename = entry.Path ?? entry.Name;
      if (!filename) continue;
      const key = buildRemoteLookupKey(filename);
      entriesByKey.set(key, [...(entriesByKey.get(key) ?? []), filename]);
    }

    const actualFilenames = directoryAssets.map(asset => {
      const expectedFilename = path.posix.basename(asset.remotePathOriginal);
      const matches = entriesByKey.get(buildRemoteLookupKey(expectedFilename)) ?? [];
      if (matches.length !== 1) {
        throw new Error(
          `Expected one remote source for ${asset.remotePathOriginal}, found ${matches.length}:\n` +
            matches.map(match => `- ${match}`).join('\n'),
        );
      }
      return matches[0];
    });

    const destinationDirectory = path.join(sourceCacheRoot, ...directory.split('/'));
    await mkdir(destinationDirectory, { recursive: true });
    const filesFromPath = path.join(sourceCacheRoot, `.rclone-source-${process.pid}-${batchIndex}.txt`);
    await writeFile(filesFromPath, `${actualFilenames.sort().join('\n')}\n`);
    const args = [
      'copy',
      remoteSpec,
      destinationDirectory,
      '--files-from-raw',
      filesFromPath,
      '--max-depth',
      '1',
    ];
    if (rcloneTransfers) args.push('--transfers', rcloneTransfers);
    if (rcloneCheckers) args.push('--checkers', rcloneCheckers);
    if (rcloneExtraArgs.length > 0) args.push(...rcloneExtraArgs);
    console.info(
      `Caching ${actualFilenames.length} online-only image sources from ${remoteSpec}`,
    );
    try {
      runCommand('rclone', args);
    } finally {
      await rm(filesFromPath, { force: true });
    }
  }

  const unresolved: string[] = [];
  for (const asset of needsRemote) {
    try {
      await resolveLocalSource(asset.remotePathOriginal);
    } catch {
      unresolved.push(asset.remotePathOriginal);
    }
  }
  if (unresolved.length > 0) {
    throw new Error(
      `Unable to materialize ${unresolved.length} image sources:\n` +
        unresolved.map(source => `- ${source}`).join('\n'),
    );
  }
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
  if (forceRegenerate) return true;
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

function matchesOnlyAssets(asset: typeof onedriveAssets[number], keys: string[]): boolean {
  if (keys.length === 0) return true;
  const ids = Array.isArray(asset.act_id) ? asset.act_id : [asset.act_id];
  return keys.some(key => {
    const normalizedKey = key.normalize('NFC').toLowerCase();
    if (asset.filename.normalize('NFC').toLowerCase() === normalizedKey) return true;
    return ids.some(id => id.normalize('NFC').toLowerCase() === normalizedKey);
  });
}

async function buildTargets(): Promise<ResizeTarget[]> {
  const targets: ResizeTarget[] = [];
  const imageAssets = onedriveAssets.filter(
    asset => matchesOnlyAssets(asset, onlyAssetKeys) && asset.isResizableImage,
  );
  await prefetchRemoteSources(imageAssets);

  for (const asset of imageAssets) {
    let inputPath: string;
    try {
      inputPath = await resolveLocalSource(asset.remotePathOriginal);
    } catch (error) {
      console.warn(`Skipping missing local source: ${asset.remotePathOriginal} (${(error as Error).message})`);
      continue;
    }
    for (const { label, maxSize, quality } of sizes) {
      const outputFilename = path.posix.basename(asset.remotePath);
      const outputPath = path.join(devStorageOutputRoot, outputFilename);
      const remotePath = asset.remotePath;
      targets.push({ label, maxSize, quality, inputPath, outputPath, remotePath });
    }
  }
  return targets;
}

async function resizeImages(targets: ResizeTarget[]): Promise<void> {
  const temporaryRoot = path.join(devStorageOutputRoot, '.image-derivative-tmp');
  for (const target of targets) {
    await mkdir(path.dirname(target.outputPath), { recursive: true });
    if (!(await shouldRegenerate(target.inputPath, target.outputPath))) {
      continue;
    }
    await mkdir(temporaryRoot, { recursive: true });
    const temporaryPng = path.join(
      temporaryRoot,
      `${target.label}-${path.basename(target.outputPath, '.webp')}.png`,
    );
    console.info(
      `Encoding ${path.basename(target.inputPath)} -> ${target.label} ` +
        `(${target.maxSize}px WebP q=${target.quality})`,
    );
    try {
      runCommand('sips', [
        '-Z',
        `${target.maxSize}`,
        '-s',
        'format',
        'png',
        target.inputPath,
        '--out',
        temporaryPng,
      ]);
      runCommand('cwebp', [
        '-quiet',
        '-q',
        `${target.quality}`,
        '-m',
        '6',
        '-sharp_yuv',
        '-mt',
        '-metadata',
        'icc',
        temporaryPng,
        '-o',
        target.outputPath,
      ]);
    } finally {
      await rm(temporaryPng, { force: true });
    }
  }
  await rm(temporaryRoot, { recursive: true, force: true });
}

async function uploadDevStorageBatch(targets: ResizeTarget[]): Promise<void> {
  const remoteRootPath = authoritativeDevStorageRemoteBasePath.replace(/\/$/, '');
  const remoteSpec = `${remoteBase}${remoteRootPath}`;
  const relativeRemotePaths = targets.map(target => {
    if (!target.remotePath.startsWith(`${remoteRootPath}/`)) {
      throw new Error(`Image derivative is outside the dev-storage root: ${target.remotePath}`);
    }
    return target.remotePath.slice(remoteRootPath.length + 1);
  });
  const filesFromPath = path.join(devStorageOutputRoot, `.rclone-image-upload-${process.pid}.txt`);
  await writeFile(filesFromPath, `${relativeRemotePaths.sort().join('\n')}\n`);

  const args = [
    'copy',
    devStorageOutputRoot,
    remoteSpec,
    '--files-from-raw',
    filesFromPath,
    '--checksum',
  ];
  if (rcloneChunkSize) args.push('--onedrive-chunk-size', rcloneChunkSize);
  if (rcloneTransfers) args.push('--transfers', rcloneTransfers);
  if (rcloneCheckers) args.push('--checkers', rcloneCheckers);
  if (rcloneExtraArgs.length > 0) args.push(...rcloneExtraArgs);

  console.info(`Batch uploading ${targets.length} image derivatives -> ${remoteSpec}`);
  try {
    runCommand('rclone', args);
  } finally {
    await rm(filesFromPath, { force: true });
  }
}

async function uploadDevStorage(targets: ResizeTarget[]): Promise<void> {
  if (!shouldUpload) {
    console.info('SKIP_ONEDRIVE_UPLOAD=1 set; skipping upload.');
    return;
  }
  if (useBatchUpload) {
    await uploadDevStorageBatch(targets);
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
  if (!commandExists('cwebp')) {
    throw new Error('cwebp is required in PATH to build WebP image derivatives.');
  }
  if (shouldUpload && !commandExists('rclone')) {
    throw new Error('rclone is required in PATH to upload dev-storage assets.');
  }

  if (shouldUpload) {
    await ensureRcloneConfig();
  }
  const targets = await buildTargets();
  console.info('Image quality settings: preview/default=1920px WebP q=92 (shared file)');
  await resizeImages(targets);
  await uploadDevStorage(targets);
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
