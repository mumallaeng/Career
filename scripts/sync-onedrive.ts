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
  label: 'large' | 'thumb' | 'original';
};

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, 'public');
const defaultRemoteBase = 'oow214-onedrive:';
const remoteBase = normalizeRemoteBase(process.env.ONEDRIVE_REMOTE_BASE ?? defaultRemoteBase);
const localRoot = process.env.ONEDRIVE_LOCAL_ROOT;
const legacyLocalDir = process.env.ONEDRIVE_LOCAL_SOURCE;
const shouldDownload = process.env.SKIP_ONEDRIVE_DOWNLOAD === '1' ? false : true;
const rcloneCacheDir = path.join(projectRoot, '.rclone-bin');
const rcloneConfigDir = path.join(projectRoot, '.rclone-config');

const assets: NormalizedAsset[] = onedriveAssets.map(asset => ({
  ...(asset as OneDriveAssetDefinition),
  remotePath: trimSlashes(asset.remotePath),
  publicPath: ensureLeadingSlash(asset.publicPath),
  remotePathOriginal: trimSlashes(asset.remotePathOriginal),
  publicPathOriginal: ensureLeadingSlash(asset.publicPathOriginal),
  remotePathThumb: trimSlashes(asset.remotePathThumb),
  publicPathThumb: ensureLeadingSlash(asset.publicPathThumb),
}));

const syncTargets: SyncTarget[] = assets.flatMap(asset => {
  if (asset.isResizableImage) {
    return [
      {
        asset,
        remotePath: asset.remotePath,
        publicPath: asset.publicPath,
        fallbackRemotePath: asset.remotePathOriginal,
        label: 'large',
      },
      {
        asset,
        remotePath: asset.remotePathThumb,
        publicPath: asset.publicPathThumb,
        fallbackRemotePath: asset.remotePathOriginal,
        label: 'thumb',
      },
    ];
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
const remoteDirectories = Array.from(
  new Set(
    syncTargets.map(target => {
      const parts = target.remotePath.split('/');
      parts.pop();
      return parts.join('/');
    }),
  ),
);

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

  for (const target of syncTargets) {
    let sourcePath: string;
    try {
      sourcePath = await resolveLocalAssetPath(
        target.asset,
        target.remotePath,
        target.fallbackRemotePath,
      );
    } catch (error) {
      console.warn(`Skipping missing local asset: ${target.remotePath} (${(error as Error).message})`);
      continue;
    }
    const destinationPath = path.join(publicRoot, target.publicPath.replace(/^\//, ''));

    if (!(await fileExists(sourcePath))) {
      console.warn(`Skipping local asset (source missing): ${sourcePath}`);
      continue;
    }

    await mkdir(path.dirname(destinationPath), { recursive: true });
    await rm(destinationPath, { force: true });
    await symlink(sourcePath, destinationPath, 'file');
    console.info(`Linked ${target.asset.filename} -> ${destinationPath}`);
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

function isDirectoryNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return (
    /directory not found/i.test(error.message) ||
    /found file when looking for folder/i.test(error.message) ||
    /file not found/i.test(error.message) ||
    /object not found/i.test(error.message)
  );
}

function copyRemoteAssetWithVariants(
  rcloneBinary: string,
  remotePath: string,
  destination: string,
  fallbackRemotePath?: string,
) {
  const attemptCopy = (pathToCopy: string): void => {
    const variants = getNormalizationVariants(pathToCopy);
    let lastError: Error | null = null;
    for (const variant of variants) {
      try {
        runCommand(rcloneBinary, ['copyto', buildRemoteSpec(variant), destination]);
        return;
      } catch (error) {
        if (isDirectoryNotFoundError(error)) {
          lastError = error as Error;
          continue;
        }
        throw error;
      }
    }
    if (lastError) {
      throw lastError;
    }
    throw new Error(`Failed to copy remote asset ${pathToCopy}`);
  };

  try {
    attemptCopy(remotePath);
    return;
  } catch (error) {
    if (!fallbackRemotePath || fallbackRemotePath === remotePath) {
      throw error;
    }
    if (!isDirectoryNotFoundError(error)) {
      throw error;
    }
    console.warn(`Missing derived asset ${remotePath}, falling back to ${fallbackRemotePath}`);
    attemptCopy(fallbackRemotePath);
  }
}

async function downloadAssets(rcloneBinary: string) {
  const downloadTargets = syncTargets.map(target => ({
    ...target,
    destination: path.join(publicRoot, target.publicPath.replace(/^\//, '')),
    remote: buildRemoteSpec(target.remotePath),
  }));

  for (const { asset, destination, remote, remotePath, fallbackRemotePath, label } of downloadTargets) {
    if (!shouldDownload) {
      console.info(`Skipping download for ${asset.filename} (SKIP_ONEDRIVE_DOWNLOAD=1).`);
      continue;
    }

    await mkdir(path.dirname(destination), { recursive: true });
    console.info(`Copying ${remote} -> ${destination}`);
    copyRemoteAssetWithVariants(rcloneBinary, remotePath, destination, fallbackRemotePath);
    if (label !== 'original' && remotePath === fallbackRemotePath) {
      console.info(`Downloaded fallback asset for ${asset.filename} (${label}).`);
    }
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

function addRemotePathToSet(remotePath: string, target: Set<string>) {
  getNormalizationVariants(remotePath).forEach(variant => {
    target.add(variant);
  });
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

async function listRemoteFiles(rcloneBinary: string): Promise<Set<string>> {
  const remoteFiles = new Set<string>();

  for (const directory of remoteDirectories) {
    const remoteSpec = buildRemoteSpec(directory);
    const args = ['lsf', remoteSpec, '--files-only', '--format=p', '--recursive'];

    try {
      const { stdout } = runCommand(rcloneBinary, args);
      stdout
        .split('\n')
        .map(entry => entry.trim())
        .filter(Boolean)
        .forEach(entry => {
          const normalizedEntry = entry.replace(/\/$/, '');
          const remotePath = directory ? `${directory}/${normalizedEntry}` : normalizedEntry;
          addRemotePathToSet(remotePath, remoteFiles);
        });
    } catch (error) {
      console.warn(`Unable to list remote directory ${remoteSpec}: ${(error as Error).message}`);
    }
  }

  return remoteFiles;
}

async function uploadMissingRemoteAssets(
  rcloneBinary: string,
  remoteFiles: Set<string>,
): Promise<void> {
  const missingAssets = assets.filter(asset => {
    const variants = getNormalizationVariants(asset.remotePathOriginal);
    return !variants.some(variant => remoteFiles.has(variant));
  });

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
    addRemotePathToSet(asset.remotePathOriginal, remoteFiles);
  }
}

function warnMissingDerivedAssets(remoteFiles: Set<string>): void {
  const missingDerived = syncTargets.filter(target => {
    if (target.label === 'original') return false;
    const variants = getNormalizationVariants(target.remotePath);
    return !variants.some(variant => remoteFiles.has(variant));
  });

  if (missingDerived.length === 0) {
    return;
  }

  const missingList = missingDerived
    .map(target => `- ${target.remotePath} (${target.label})`)
    .join('\n');
  console.warn(
    `Derived assets missing on remote (${missingDerived.length}). Falling back to originals where needed:\n${missingList}`,
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

async function main() {
  try {
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
    warnMissingDerivedAssets(remoteFiles);

    if (shouldUseRemote) {
      await downloadAssets(rcloneBinary);
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
