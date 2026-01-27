import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { access, constants as fsConstants, mkdir, stat, writeFile } from 'node:fs/promises';

import { onedriveAssets } from '../src/data/onedrive-assets';

const sizes = [
  { label: 'thumb', maxSize: 480 },
  { label: 'large', maxSize: 1600 },
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
const derivedOutputRoot = process.env.ONEDRIVE_DERIVED_OUTPUT_ROOT
  ? path.resolve(process.env.ONEDRIVE_DERIVED_OUTPUT_ROOT)
  : path.join(projectRoot, '.derived-media');

const localRoot = process.env.ONEDRIVE_LOCAL_ROOT;
const defaultRemoteBase = 'oow214-onedrive:';
const remoteBase = normalizeRemoteBase(process.env.ONEDRIVE_REMOTE_BASE ?? defaultRemoteBase);
const shouldUpload = process.env.SKIP_ONEDRIVE_UPLOAD === '1' ? false : true;
const rcloneConfigDir = path.join(projectRoot, '.rclone-config');

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
    const inputPath = await resolveLocalSource(asset.remotePathOriginal);
    for (const { label, maxSize } of sizes) {
      const outputPath = path.join(derivedOutputRoot, label, asset.filename);
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

async function uploadDerived(targets: ResizeTarget[]): Promise<void> {
  if (!shouldUpload) {
    console.info('SKIP_ONEDRIVE_UPLOAD=1 set; skipping upload.');
    return;
  }

  for (const target of targets) {
    const remoteSpec = `${remoteBase}${target.remotePath}`;
    console.info(`Uploading ${path.basename(target.outputPath)} -> ${remoteSpec}`);
    runCommand('rclone', ['copyto', target.outputPath, remoteSpec]);
  }
}

async function main() {
  if (!localRoot) {
    throw new Error('ONEDRIVE_LOCAL_ROOT is required to build derived assets.');
  }
  if (!commandExists('sips')) {
    throw new Error('sips is required (macOS). Install ImageMagick or use a Mac environment.');
  }
  if (!commandExists('rclone')) {
    throw new Error('rclone is required in PATH to upload derived assets.');
  }

  await ensureRcloneConfig();
  const targets = await buildTargets();
  await resizeImages(targets);
  await uploadDerived(targets);
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
