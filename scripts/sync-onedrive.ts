import path from 'node:path';
import { spawnSync, SpawnSyncOptions } from 'node:child_process';
import {
  access,
  chmod,
  constants as fsConstants,
  copyFile,
  lstat,
  mkdir,
  readdir,
  rm,
  rename,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';

import { onedriveAssets, type OneDriveAssetDefinition } from '../src/data/onedrive-assets';

type NormalizedAsset = OneDriveAssetDefinition & {
  remotePath: string;
  publicPath: string;
};

type SyncTarget = {
  asset: NormalizedAsset;
  remotePath: string;
  publicPath: string;
  fallbackRemotePath?: string;
  label: 'default' | 'poster' | 'thumb' | 'original';
};

type RemoteFileEntry = {
  actualPath: string;
  size: number;
};

type RemoteFileIndex = Map<string, RemoteFileEntry[]>;

type DownloadSelection = {
  target: SyncTarget;
  remoteFile: RemoteFileEntry;
};

type DownloadBatch = {
  remoteDirectory: string;
  destinationDirectory: string;
  filenames: Set<string>;
  selections: DownloadSelection[];
};

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, 'public');
const defaultRemoteBase = 'oow214-onedrive:';
const remoteBase = normalizeRemoteBase(process.env.ONEDRIVE_REMOTE_BASE ?? defaultRemoteBase);
const localRoot = process.env.ONEDRIVE_LOCAL_ROOT;
const legacyLocalDir = process.env.ONEDRIVE_LOCAL_SOURCE;
const shouldDownload = process.env.SKIP_ONEDRIVE_DOWNLOAD === '1' ? false : true;
const shouldSkipSync =
  process.env.SKIP_ONEDRIVE_SYNC === '1';
const shouldNormalizeNfc = process.env.ENABLE_ONEDRIVE_NFC === '1';
const rcloneCacheDir = path.join(projectRoot, '.rclone-bin');
const rcloneConfigDir = path.join(projectRoot, '.rclone-config');
const maxOptimizedMotionMb = Number(process.env.ONEDRIVE_MAX_OPTIMIZED_MOTION_MB ?? '94');
const maxOriginalMotionFallbackMb = Number(process.env.ONEDRIVE_MAX_ORIGINAL_MOTION_FALLBACK_MB ?? '25');
const maxImageAssetMb = Number(process.env.ONEDRIVE_MAX_IMAGE_ASSET_MB ?? '25');

const onlyAssetQuery = process.env.ONEDRIVE_ONLY_ASSETS;
const onlyAssetKeys = onlyAssetQuery
  ? onlyAssetQuery.split(',').map(value => value.trim()).filter(Boolean)
  : [];

function matchesOnlyAssets(asset: OneDriveAssetDefinition, keys: string[]): boolean {
  if (keys.length === 0) return true;
  const ids = Array.isArray(asset.act_id) ? asset.act_id : [asset.act_id];
  return keys.some(key => {
    const normalizedKey = buildRemoteLookupKey(key);
    if (buildRemoteLookupKey(asset.filename) === normalizedKey) return true;
    return ids.some(id => buildRemoteLookupKey(id) === normalizedKey);
  });
}

const assets: NormalizedAsset[] = onedriveAssets
  .filter(asset => matchesOnlyAssets(asset, onlyAssetKeys))
  .map(asset => ({
  ...(asset as OneDriveAssetDefinition),
  remotePath: trimSlashes(asset.remotePath),
  publicPath: ensureLeadingSlash(asset.publicPath),
  remotePathOriginal: trimSlashes(asset.remotePathOriginal),
  publicPathOriginal: ensureLeadingSlash(asset.publicPathOriginal),
  remotePathThumb: trimSlashes(asset.remotePathThumb),
  publicPathThumb: ensureLeadingSlash(asset.publicPathThumb),
}));

const syncTargets: SyncTarget[] = assets.flatMap(asset => {
  if (asset.hasOptimizedDefault) {
    const targets: SyncTarget[] = [
      {
        asset,
        remotePath: asset.remotePath,
        publicPath: asset.publicPath,
        fallbackRemotePath: asset.isResizableImage ? undefined : asset.remotePathOriginal,
        label: 'default',
      },
    ];
    if (asset.remotePathPoster && asset.publicPathPoster) {
      targets.push({
        asset,
        remotePath: asset.remotePathPoster,
        publicPath: asset.publicPathPoster,
        label: 'poster',
      });
    }
    return targets;
  }
  return [
    {
      asset,
      remotePath: asset.remotePathOriginal,
      publicPath: asset.publicPathOriginal,
      label: 'original',
    },
  ];
});

const publicDirectories = Array.from(new Set(syncTargets.map(target => getPublicDirectory(target.publicPath))));
const remoteDirectoryExpectedFilenames = buildRemoteDirectoryExpectedFilenames([
  ...syncTargets.map(target => target.remotePath),
  ...assets.map(asset => asset.remotePathOriginal),
]);

function getPublicDirectory(publicPath: string): string {
  const relative = publicPath.replace(/^\//, '');
  const parts = relative.split('/');
  if (parts.length <= 1) {
    return '';
  }
  parts.pop();
  return parts.join('/');
}

function ensureLeadingSlash(value: string): string {
  return value.startsWith('/') ? value : `/${value}`;
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+/, '').replace(/\/+$/, '');
}

function normalizeRemoteBase(value: string): string {
  return value.endsWith(':') ? value : `${value}:`;
}

function buildRemoteDirectoryExpectedFilenames(remotePaths: string[]): Map<string, Set<string>> {
  const grouped = new Map<string, Set<string>>();

  for (const remotePath of remotePaths) {
    const parts = remotePath.split('/');
    const filename = parts.pop();
    const directory = parts.join('/');

    if (!filename || !directory) {
      continue;
    }

    if (!grouped.has(directory)) {
      grouped.set(directory, new Set<string>());
    }

    const expectedNames = grouped.get(directory)!;
    getNormalizationVariants(filename).forEach(variant => {
      expectedNames.add(variant);
    });
  }

  return grouped;
}

function runCommand(
  command: string,
  args: string[],
  options: SpawnSyncOptions = {},
): { stdout: string; stderr: string } {
  const result = spawnSync(command, args, {
    stdio: 'pipe',
    encoding: 'utf8',
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(
      `Command failed: ${command} ${args.map(arg => JSON.stringify(arg)).join(' ')}\n${
        result.stderr || result.stdout || ''
      }`.trim(),
    );
  }

  return {
    stdout: (result.stdout ?? '').toString(),
    stderr: (result.stderr ?? '').toString(),
  };
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

async function fileExists(target?: string | null): Promise<boolean> {
  if (!target) return false;
  try {
    const stats = await stat(target);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function ensureLegacySymlink(): Promise<boolean> {
  if (!legacyLocalDir) return false;
  if (assets.length === 0) return false;
  if (publicDirectories.length !== 1) {
    throw new Error('Legacy ONEDRIVE_LOCAL_SOURCE can only be used when all assets share one directory.');
  }
  const targetRelative = publicDirectories[0];
  const targetDir = path.join(publicRoot, targetRelative);
  if (!(await pathExists(legacyLocalDir))) {
    throw new Error(`ONEDRIVE_LOCAL_SOURCE does not exist: ${legacyLocalDir}`);
  }

  await mkdir(path.dirname(targetDir), { recursive: true });
  await rm(targetDir, { recursive: true, force: true });
  await symlink(legacyLocalDir, targetDir, 'dir');
  console.info(`Linked legacy local source ${legacyLocalDir} -> ${targetDir}`);
  return true;
}

async function ensureLocalRootSymlinks(): Promise<boolean> {
  if (!localRoot) {
    return false;
  }

  const missingTargets: string[] = [];

  for (const target of syncTargets) {
    let sourcePath: string;
    try {
      sourcePath = await resolveLocalAssetPath(
        target.asset,
        target.remotePath,
        target.fallbackRemotePath,
      );
    } catch (error) {
      missingTargets.push(`${target.remotePath} (${(error as Error).message})`);
      continue;
    }
    const destinationPath = path.join(publicRoot, target.publicPath.replace(/^\//, ''));

    if (!(await fileExists(sourcePath))) {
      missingTargets.push(`${target.remotePath} (source missing: ${sourcePath})`);
      continue;
    }

    await mkdir(path.dirname(destinationPath), { recursive: true });
    await rm(destinationPath, { force: true });
    await symlink(sourcePath, destinationPath, 'file');
    console.info(`Linked ${target.asset.filename} -> ${destinationPath}`);
  }

  if (missingTargets.length > 0) {
    throw new Error(
      `Local OneDrive root is missing ${missingTargets.length} required delivery assets:\n` +
        missingTargets.map(target => `- ${target}`).join('\n'),
    );
  }

  for (const target of syncTargets) {
    const destinationPath = path.join(publicRoot, target.publicPath.replace(/^\//, ''));
    try {
      const stats = await lstat(destinationPath);
      if (!stats.isSymbolicLink()) {
        continue;
      }
      await stat(destinationPath);
    } catch {
      await rm(destinationPath, { force: true });
      console.warn(`Removed broken symlink: ${destinationPath}`);
    }
  }

  return true;
}

async function removeBrokenSymlinks(rootDir: string): Promise<void> {
  if (!(await pathExists(rootDir))) {
    return;
  }

  const entries = await readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      await removeBrokenSymlinks(entryPath);
      continue;
    }

    if (!entry.isSymbolicLink()) {
      continue;
    }

    try {
      await stat(entryPath);
    } catch {
      await rm(entryPath, { force: true });
      console.warn(`Removed broken symlink: ${entryPath}`);
    }
  }
}

async function ensureNfcLocalAssets(): Promise<void> {
  if (!shouldNormalizeNfc) {
    return;
  }
  if (!localRoot) {
    return;
  }

  for (const asset of assets) {
    const targetSegments = asset.remotePath.split('/').map(segment => normalizeToNfc(segment));
    const targetPath = path.join(localRoot, ...targetSegments);

    const candidates = new Set<string>();
    getNormalizationVariants(asset.remotePath).forEach(variant => {
      candidates.add(path.join(localRoot, ...variant.split('/')));
    });

    let existingPath: string | null = null;
    for (const candidate of candidates) {
      if (await fileExists(candidate)) {
        existingPath = candidate;
        break;
      }
    }

    if (!existingPath) {
      continue;
    }

    if (existingPath === targetPath) {
      continue;
    }

    if (await fileExists(targetPath)) {
      console.info(`NFC target already exists; skipping rename: ${targetPath}`);
      continue;
    }

    await mkdir(path.dirname(targetPath), { recursive: true });
    await rename(existingPath, targetPath);
    console.info(`Normalized to NFC: ${existingPath} -> ${targetPath}`);
  }
}

function buildRemoteSpec(remotePath: string): string {
  return remotePath.includes(':') ? remotePath : `${remoteBase}${remotePath}`;
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

function normalizeToNfc(value: string): string {
  try {
    return value.normalize('NFC');
  } catch {
    return value;
  }
}

type PlatformDescriptor = {
  archiveOS: string;
  archiveArch: string;
  folderToken: string;
};

function resolvePlatformDescriptor(): PlatformDescriptor {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === 'linux' && arch === 'x64') {
    return { archiveOS: 'linux', archiveArch: 'amd64', folderToken: 'linux-amd64' };
  }
  if (platform === 'linux' && arch === 'arm64') {
    return { archiveOS: 'linux', archiveArch: 'arm64', folderToken: 'linux-arm64' };
  }
  if (platform === 'darwin' && arch === 'arm64') {
    return { archiveOS: 'osx', archiveArch: 'arm64', folderToken: 'osx-arm64' };
  }
  if (platform === 'darwin' && arch === 'x64') {
    return { archiveOS: 'osx', archiveArch: 'amd64', folderToken: 'osx-amd64' };
  }

  throw new Error(`Unsupported platform for automatic rclone download: ${platform}/${arch}`);
}

function commandExists(command: string): boolean {
  try {
    const result = spawnSync(command, ['version'], { stdio: 'ignore' });
    return result.status === 0;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function downloadRcloneBinary(targetPath: string): Promise<void> {
  console.info('rclone not found. Downloading portable binary...');
  const { archiveOS, archiveArch, folderToken } = resolvePlatformDescriptor();
  const archiveName = `rclone-current-${archiveOS}-${archiveArch}.zip`;
  const url = `https://downloads.rclone.org/${archiveName}`;
  const extractDir = path.join(rcloneCacheDir, 'extracted');

  await mkdir(rcloneCacheDir, { recursive: true });
  await mkdir(extractDir, { recursive: true });

  const zipPath = path.join(rcloneCacheDir, archiveName);
  runCommand('curl', ['-fsSL', url, '-o', zipPath]);
  runCommand('unzip', ['-o', zipPath, '-d', extractDir]);

  const entries = await readdir(extractDir, { withFileTypes: true });
  const folder = entries.find(
    entry => entry.isDirectory() && entry.name.includes(folderToken) && entry.name.startsWith('rclone'),
  );

  if (!folder) {
    throw new Error('Unable to locate extracted rclone directory.');
  }

  const binaryName = process.platform === 'win32' ? 'rclone.exe' : 'rclone';
  const sourceBinary = path.join(extractDir, folder.name, binaryName);

  await copyFile(sourceBinary, targetPath);
  await chmod(targetPath, 0o755);
  console.info(`Downloaded rclone to ${targetPath}`);
}

async function ensureRcloneBinary(): Promise<string> {
  if (process.env.RCLONE_BINARY && commandExists(process.env.RCLONE_BINARY)) {
    console.info(`Using custom rclone binary: ${process.env.RCLONE_BINARY}`);
    return process.env.RCLONE_BINARY;
  }

  if (commandExists('rclone')) {
    return 'rclone';
  }

  const cachedBinary = path.join(
    rcloneCacheDir,
    process.platform === 'win32' ? 'rclone.exe' : 'rclone',
  );

  if (!(await pathExists(cachedBinary))) {
    await downloadRcloneBinary(cachedBinary);
  }

  return cachedBinary;
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function resolveLocalAssetPath(
  asset: NormalizedAsset,
  remotePath: string,
  fallbackRemotePath?: string,
): Promise<string> {
  if (!localRoot) {
    throw new Error('ONEDRIVE_LOCAL_ROOT is not configured.');
  }

  const relativeSegments = remotePath.split('/');
  const filename = relativeSegments[relativeSegments.length - 1] ?? asset.filename;
  const directCandidates = new Set<string>();
  const baseCandidate = path.join(localRoot, ...relativeSegments);
  directCandidates.add(baseCandidate);

  getNormalizationVariants(remotePath).forEach(relative => {
    directCandidates.add(path.join(localRoot, ...relative.split('/')));
  });

  for (const candidate of directCandidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  const directorySegments = [...relativeSegments];
  directorySegments.pop();
  const directoryPath = path.join(localRoot, ...directorySegments);

  if (await pathExists(directoryPath)) {
    const { name, ext } = path.parse(filename);
    const conflictPattern = new RegExp(
      `^${escapeRegExp(name)}(?:[\\s()_-].+)?${escapeRegExp(ext)}$`,
      'i',
    );
    const entries = await readdir(directoryPath);
    for (const entry of entries) {
      if (!conflictPattern.test(entry)) {
        continue;
      }
      const candidate = path.join(directoryPath, entry);
      if (await fileExists(candidate)) {
        console.info(`Resolved ${filename} to local variant ${entry}`);
        return candidate;
      }
    }
  }

  if (fallbackRemotePath && fallbackRemotePath !== remotePath) {
    return resolveLocalAssetPath(asset, fallbackRemotePath);
  }

  throw new Error(`Local OneDrive file not found: ${baseCandidate}`);
}

function buildRemoteLookupKey(remotePath: string): string {
  try {
    return remotePath.normalize('NFC').toLowerCase();
  } catch {
    return remotePath.toLowerCase();
  }
}

function addRemoteFile(remoteFiles: RemoteFileIndex, remoteFile: RemoteFileEntry): void {
  const key = buildRemoteLookupKey(remoteFile.actualPath);
  const matches = remoteFiles.get(key) ?? [];
  if (!matches.some(entry => entry.actualPath === remoteFile.actualPath)) {
    matches.push(remoteFile);
  }
  remoteFiles.set(key, matches);
}

function findRemoteFile(remoteFiles: RemoteFileIndex, remotePath: string): RemoteFileEntry | undefined {
  const matches = remoteFiles.get(buildRemoteLookupKey(remotePath)) ?? [];
  if (matches.length > 1) {
    throw new Error(
      `Remote filename normalization collision for ${remotePath}:\n` +
        matches.map(entry => `- ${entry.actualPath}`).join('\n'),
    );
  }
  return matches[0];
}

async function listRemoteFiles(rcloneBinary: string): Promise<RemoteFileIndex> {
  const remoteFiles: RemoteFileIndex = new Map();

  for (const directory of remoteDirectoryExpectedFilenames.keys()) {
    const remoteSpec = buildRemoteSpec(directory);
    const { stdout } = runCommand(rcloneBinary, [
      'lsjson',
      remoteSpec,
      '--files-only',
      '--max-depth',
      '1',
    ]);

    let entries: Array<{ Path?: string; Name?: string; Size?: number; IsDir?: boolean }>;
    try {
      entries = JSON.parse(stdout) as typeof entries;
    } catch (error) {
      throw new Error(`Unable to parse rclone listing for ${remoteSpec}: ${(error as Error).message}`);
    }

    if (!Array.isArray(entries)) {
      throw new Error(`Unexpected rclone listing for ${remoteSpec}.`);
    }

    for (const entry of entries) {
      if (entry.IsDir) continue;
      const filename = entry.Path ?? entry.Name;
      if (!filename || typeof entry.Size !== 'number' || entry.Size < 0) {
        throw new Error(`Remote file metadata is incomplete in ${remoteSpec}: ${JSON.stringify(entry)}`);
      }
      addRemoteFile(remoteFiles, {
        actualPath: directory ? `${directory}/${filename.replace(/\/$/, '')}` : filename,
        size: entry.Size,
      });
    }

    console.info(`Inspected ${entries.length} files in ${remoteSpec}`);
  }

  return remoteFiles;
}

async function uploadMissingRemoteAssets(
  rcloneBinary: string,
  remoteFiles: RemoteFileIndex,
): Promise<void> {
  const missingAssets = assets.filter(asset => !findRemoteFile(remoteFiles, asset.remotePathOriginal));

  if (missingAssets.length === 0) {
    console.info('All OneDrive assets are present on the remote.');
    return;
  }

  if (!localRoot) {
    const missingList = missingAssets.map(asset => `- ${asset.remotePathOriginal}`).join('\n');
    throw new Error(
      `Remote OneDrive storage is missing ${missingAssets.length} assets:\n${missingList}\n` +
        'Provide ONEDRIVE_LOCAL_ROOT to upload them automatically.',
    );
  }

  for (const asset of missingAssets) {
    const localSource = await resolveLocalAssetPath(asset, asset.remotePathOriginal);

    removeRemotePathIfExists(rcloneBinary, asset.remotePathOriginal);
    console.info(`Uploading missing asset ${asset.remotePathOriginal} from ${localSource}`);
    runCommand(rcloneBinary, ['copyto', localSource, buildRemoteSpec(asset.remotePathOriginal)]);
    const sourceStats = await stat(localSource);
    addRemoteFile(remoteFiles, { actualPath: asset.remotePathOriginal, size: sourceStats.size });
  }
}

function warnMissingDevStorageAssets(remoteFiles: RemoteFileIndex): void {
  const missingDevStorage = syncTargets.filter(target => {
    if (target.label === 'original') return false;
    return !findRemoteFile(remoteFiles, target.remotePath);
  });

  if (missingDevStorage.length === 0) {
    return;
  }

  const missingList = missingDevStorage
    .map(target => `- ${target.remotePath} (${target.label})`)
    .join('\n');
  console.warn(
    `Dev-storage assets missing on remote (${missingDevStorage.length}). Falling back to originals where needed:\n${missingList}`,
  );
}

function removeRemotePathIfExists(rcloneBinary: string, remotePath: string) {
  const remoteSpec = buildRemoteSpec(remotePath);
  const deleteCommands: Array<{ args: string[]; suppressErrors?: boolean }> = [
    { args: ['deletefile', remoteSpec], suppressErrors: true },
    { args: ['purge', remoteSpec], suppressErrors: true },
  ];

  for (const { args, suppressErrors } of deleteCommands) {
    try {
      runCommand(rcloneBinary, args);
    } catch (error) {
      if (!suppressErrors) {
        throw error;
      }
    }
  }
}

function getMaxDownloadBytes(target: SyncTarget, isFallback: boolean): number {
  if (/\.(jpe?g|png|webp)$/i.test(target.remotePath)) {
    return maxImageAssetMb * 1024 * 1024;
  }
  if (target.asset.isOptimizedMotion) {
    const maxMb = isFallback ? maxOriginalMotionFallbackMb : maxOptimizedMotionMb;
    return maxMb * 1024 * 1024;
  }
  return maxImageAssetMb * 1024 * 1024;
}

function validateRemoteFileSize(
  target: SyncTarget,
  remoteFile: RemoteFileEntry,
  isFallback: boolean,
): void {
  const maxBytes = getMaxDownloadBytes(target, isFallback);
  if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
    throw new Error(`Invalid media delivery size limit for ${target.remotePath}.`);
  }
  if (!Number.isFinite(remoteFile.size) || remoteFile.size < 0) {
    throw new Error(`Remote file size is unavailable for ${remoteFile.actualPath}.`);
  }
  if (remoteFile.size > maxBytes) {
    const actualMb = (remoteFile.size / 1024 / 1024).toFixed(1);
    const maxMb = (maxBytes / 1024 / 1024).toFixed(1);
    const kind = isFallback ? 'original fallback' : 'optimized asset';
    throw new Error(
      `${kind} exceeds the delivery limit: ${remoteFile.actualPath} is ${actualMb}MB (max ${maxMb}MB).`,
    );
  }
}

function chooseDownloadRemoteFile(target: SyncTarget, remoteFiles: RemoteFileIndex): RemoteFileEntry {
  const optimizedFile = findRemoteFile(remoteFiles, target.remotePath);
  if (optimizedFile) {
    validateRemoteFileSize(target, optimizedFile, false);
    return optimizedFile;
  }

  if (target.fallbackRemotePath) {
    const fallbackFile = findRemoteFile(remoteFiles, target.fallbackRemotePath);
    if (fallbackFile) {
      validateRemoteFileSize(target, fallbackFile, true);
      if (target.label !== 'original' && target.remotePath !== target.fallbackRemotePath) {
        console.warn(`Missing ${target.remotePath}; falling back to ${fallbackFile.actualPath}`);
      }
      return fallbackFile;
    }
  }

  throw new Error(`No remote delivery source found for ${target.remotePath}.`);
}

function buildDownloadBatches(remoteFiles: RemoteFileIndex): DownloadBatch[] {
  const grouped = new Map<string, DownloadBatch>();

  for (const target of syncTargets) {
    const remoteFile = chooseDownloadRemoteFile(target, remoteFiles);
    const remoteParts = remoteFile.actualPath.split('/');
    const filename = remoteParts.pop();
    const remoteDirectory = remoteParts.join('/');
    const destinationDirectory = path.join(publicRoot, path.dirname(target.publicPath.replace(/^\//, '')));

    if (!filename || !remoteDirectory) {
      continue;
    }

    const key = `${remoteDirectory} -> ${destinationDirectory}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        remoteDirectory,
        destinationDirectory,
        filenames: new Set<string>(),
        selections: [],
      });
    }

    const batch = grouped.get(key)!;
    batch.filenames.add(filename);
    batch.selections.push({ target, remoteFile });
  }

  return Array.from(grouped.values());
}

function normalizeLocalFilename(filename: string): string {
  try {
    return filename.normalize('NFC').toLowerCase();
  } catch {
    return filename.toLowerCase();
  }
}

async function materializeCanonicalTarget(selection: DownloadSelection, destinationDirectory: string): Promise<void> {
  const expectedFilename = path.basename(selection.target.publicPath);
  const remoteFilename = path.posix.basename(selection.remoteFile.actualPath);
  const entries = await readdir(destinationDirectory, { withFileTypes: true });
  const candidates = entries
    .filter(entry => !entry.isDirectory())
    .filter(entry => normalizeLocalFilename(entry.name) === normalizeLocalFilename(remoteFilename));

  if (candidates.length !== 1) {
    throw new Error(
      `Expected exactly one downloaded file for ${selection.remoteFile.actualPath}, found ${candidates.length}:\n` +
        candidates.map(entry => `- ${entry.name}`).join('\n'),
    );
  }

  const actualFilename = candidates[0].name;
  const actualPath = path.join(destinationDirectory, actualFilename);
  const expectedPath = path.join(destinationDirectory, expectedFilename);

  if (actualFilename !== expectedFilename) {
    const collisions = entries.filter(
      entry =>
        !entry.isDirectory() &&
        entry.name !== actualFilename &&
        normalizeLocalFilename(entry.name) === normalizeLocalFilename(expectedFilename),
    );
    if (collisions.length > 0) {
      throw new Error(
        `Local filename normalization collision for ${expectedPath}:\n` +
          [actualFilename, ...collisions.map(entry => entry.name)].map(name => `- ${name}`).join('\n'),
      );
    }
    await rename(actualPath, expectedPath);
  }

  const outputStats = await stat(expectedPath);
  if (outputStats.size !== selection.remoteFile.size) {
    throw new Error(
      `Downloaded size mismatch for ${expectedPath}: expected ${selection.remoteFile.size}, got ${outputStats.size}.`,
    );
  }

  if (process.platform !== 'darwin') {
    const finalEntries = await readdir(destinationDirectory);
    if (!finalEntries.includes(expectedFilename)) {
      throw new Error(`Canonical public filename was not materialized: ${expectedPath}`);
    }
  }
}

async function downloadAssets(rcloneBinary: string, remoteFiles: RemoteFileIndex) {
  if (!shouldDownload) {
    console.info('Skipping download stage (SKIP_ONEDRIVE_DOWNLOAD=1).');
    return;
  }

  const batches = buildDownloadBatches(remoteFiles);

  let batchIndex = 0;
  for (const batch of batches) {
    batchIndex += 1;
    await mkdir(batch.destinationDirectory, { recursive: true });
    await mkdir(rcloneConfigDir, { recursive: true });
    const remoteSpec = buildRemoteSpec(batch.remoteDirectory);
    const filesFromPath = path.join(rcloneConfigDir, `sync-batch-${process.pid}-${batchIndex}.txt`);
    await writeFile(filesFromPath, `${Array.from(batch.filenames).sort().join('\n')}\n`);
    const args = [
      'copy',
      remoteSpec,
      batch.destinationDirectory,
      '--max-depth',
      '1',
      '--files-from-raw',
      filesFromPath,
    ];

    console.info(`Copying ${remoteSpec} -> ${batch.destinationDirectory} (${batch.filenames.size} candidates)`);
    try {
      runCommand(rcloneBinary, args);
    } finally {
      await rm(filesFromPath, { force: true });
    }

    for (const selection of batch.selections) {
      await materializeCanonicalTarget(selection, batch.destinationDirectory);
    }
  }
}

async function main() {
  try {
    if (shouldSkipSync) {
      console.info('Skipping OneDrive sync (SKIP_ONEDRIVE_SYNC=1).');
      return;
    }
    await ensureNfcLocalAssets();
    const usingLocalRoot = await ensureLocalRootSymlinks();
    const usingLegacySource = !usingLocalRoot && (await ensureLegacySymlink());

    const shouldUseRemote =
      shouldDownload && !usingLocalRoot && !usingLegacySource;
    const needsRemoteInspection = shouldUseRemote || Boolean(localRoot);

    if (!needsRemoteInspection) {
      console.info('No remote operations required.');
      return;
    }

    await removeBrokenSymlinks(path.join(publicRoot, 'import-data'));

    await ensureRcloneConfig();
    const rcloneBinary = await ensureRcloneBinary();
    const remoteFiles = await listRemoteFiles(rcloneBinary);
    await uploadMissingRemoteAssets(rcloneBinary, remoteFiles);
    warnMissingDevStorageAssets(remoteFiles);

    if (shouldUseRemote) {
      await downloadAssets(rcloneBinary, remoteFiles);
    } else if (usingLocalRoot || usingLegacySource) {
      console.info('Local asset symlinks configured; skipping download stage.');
    } else {
      console.info('Downloads are disabled via SKIP_ONEDRIVE_DOWNLOAD=1.');
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

void main();
