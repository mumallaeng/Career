import path from 'node:path';
import { readdir, readFile, stat } from 'node:fs/promises';

import { put } from '@vercel/blob';

const projectRoot = process.cwd();
const outputRoot = process.env.DEV_STORAGE_OUTPUT_ROOT
  ? path.resolve(process.env.DEV_STORAGE_OUTPUT_ROOT)
  : process.env.ONEDRIVE_DEV_STORAGE_OUTPUT_ROOT
    ? path.resolve(process.env.ONEDRIVE_DEV_STORAGE_OUTPUT_ROOT)
    : path.join(projectRoot, '.dev-storage-media');

const blobPrefix = 'dev-storage';
const dryRun = process.argv.includes('--dry-run');

async function collectFiles(root: string, base: string, results: string[] = []): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(fullPath, base, results);
      continue;
    }
    results.push(path.relative(base, fullPath));
  }
  return results;
}

function buildBlobPath(relativePath: string): string {
  const normalized = relativePath.split(path.sep).join('/');
  return `${blobPrefix}/${normalized}`;
}

async function uploadFile(relativePath: string): Promise<void> {
  const fullPath = path.join(outputRoot, relativePath);
  const fileStat = await stat(fullPath);
  if (!fileStat.isFile()) return;

  const blobPath = buildBlobPath(relativePath);
  if (dryRun) {
    console.info(`[dry-run] ${fullPath} -> ${blobPath}`);
    return;
  }

  const contents = await readFile(fullPath);
  await put(blobPath, contents, { access: 'public', addRandomSuffix: false });
  console.info(`Uploaded ${relativePath} -> ${blobPath}`);
}

async function main(): Promise<void> {
  const files = await collectFiles(outputRoot, outputRoot);
  if (files.length === 0) {
    console.info(`No files found under ${outputRoot}`);
    return;
  }

  console.info(`Uploading ${files.length} files from ${outputRoot} to Vercel Blob...`);
  for (const relativePath of files) {
    await uploadFile(relativePath);
  }
}

void main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
