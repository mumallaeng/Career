import path from 'node:path';
import { spawnSync, SpawnSyncOptions } from 'node:child_process';
import {
  access,
  chmod,
  constants as fsConstants,
  copyFile,
  mkdir,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';

import { drive1Assets, type Drive1AssetDefinition } from '../src/data/drive1-assets';

type NormalizedAsset = Drive1AssetDefinition & {
  remotePath: string;
  publicPath: string;
};

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, 'public');
const defaultRemoteBase = 'oow214-1drive:';
const remoteBase = normalizeRemoteBase(process.env.DRIVE1_REMOTE_BASE ?? defaultRemoteBase);
const localRoot = process.env.DRIVE1_LOCAL_ROOT;
const legacyLocalDir = process.env.DRIVE1_LOCAL_SOURCE;
const shouldDownload = process.env.SKIP_DRIVE1_DOWNLOAD === '1' ? false : true;
const rcloneCacheDir = path.join(projectRoot, '.rclone-bin');
const rcloneConfigDir = path.join(projectRoot, '.rclone-config');

const assets: NormalizedAsset[] = drive1Assets.map(asset => ({
  ...(asset as Drive1AssetDefinition),
  remotePath: trimSlashes(asset.remotePath),
  publicPath: ensureLeadingSlash(asset.publicPath),
}));
const publicDirectories = Array.from(new Set(assets.map(asset => getPublicDirectory(asset.publicPath))));

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

async function ensureLegacySymlink(): Promise<boolean> {
  if (!legacyLocalDir) return false;
  if (assets.length === 0) return false;
  if (publicDirectories.length !== 1) {
    throw new Error('Legacy DRIVE1_LOCAL_SOURCE can only be used when all assets share one directory.');
  }
  const targetRelative = publicDirectories[0];
  const targetDir = path.join(publicRoot, targetRelative);
  if (!(await pathExists(legacyLocalDir))) {
    throw new Error(`DRIVE1_LOCAL_SOURCE does not exist: ${legacyLocalDir}`);
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

  for (const asset of assets) {
    const sourcePath = path.join(localRoot, ...asset.remotePath.split('/'));
    const destinationPath = path.join(publicRoot, asset.publicPath.replace(/^\//, ''));

    if (!(await pathExists(sourcePath))) {
      throw new Error(`Local Drive1 file not found: ${sourcePath}`);
    }

    await mkdir(path.dirname(destinationPath), { recursive: true });
    await rm(destinationPath, { force: true });
    await symlink(sourcePath, destinationPath, 'file');
    console.info(`Linked ${asset.filename} -> ${destinationPath}`);
  }

  return true;
}

function buildRemoteSpec(remotePath: string): string {
  return remotePath.includes(':') ? remotePath : `${remoteBase}${remotePath}`;
}

async function downloadAssets(rcloneBinary: string) {
  const downloadTargets = assets.map(asset => ({
    asset,
    destination: path.join(publicRoot, asset.publicPath.replace(/^\//, '')),
    remote: buildRemoteSpec(asset.remotePath),
  }));

  for (const { asset, destination, remote } of downloadTargets) {
    if (!shouldDownload) {
      console.info(`Skipping download for ${asset.filename} (SKIP_DRIVE1_DOWNLOAD=1).`);
      continue;
    }

    await mkdir(path.dirname(destination), { recursive: true });
    console.info(`Copying ${remote} -> ${destination}`);
    runCommand(rcloneBinary, ['copyto', remote, destination]);
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

async function main() {
  try {
    if (await ensureLocalRootSymlinks()) {
      return;
    }

    if (await ensureLegacySymlink()) {
      return;
    }

    if (!shouldDownload) {
      console.info('No local root configured and downloads are disabled. Nothing to do.');
      return;
    }

    await ensureRcloneConfig();
    const rcloneBinary = await ensureRcloneBinary();
    await downloadAssets(rcloneBinary);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

void main();
