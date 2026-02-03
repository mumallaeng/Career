import path from 'node:path';
import { readdir, readFile, stat } from 'node:fs/promises';
import fs from 'node:fs';

import { put } from '@vercel/blob';

const projectRoot = process.cwd();
const envFiles = [path.join(projectRoot, '.env.local'), path.join(projectRoot, '.env')];
const loadedEnv = new Set<string>();

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const contents = fs.readFileSync(filePath, 'utf8');
  contents.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    if (!key || loadedEnv.has(key)) return;
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
      loadedEnv.add(key);
    }
  });
}

envFiles.forEach(loadEnvFile);

const outputRoot = process.env.DEV_STORAGE_OUTPUT_ROOT
  ? path.resolve(process.env.DEV_STORAGE_OUTPUT_ROOT)
  : process.env.ONEDRIVE_DEV_STORAGE_OUTPUT_ROOT
    ? path.resolve(process.env.ONEDRIVE_DEV_STORAGE_OUTPUT_ROOT)
    : path.join(projectRoot, '.dev-storage-media');

const blobPrefix = 'dev-storage';
const dryRun = process.argv.includes('--dry-run');
const concurrencyArg = process.argv.find(arg => arg.startsWith('--concurrency='));
const concurrency = Math.max(
  1,
  Number(concurrencyArg?.split('=')[1] ?? process.env.BLOB_UPLOAD_CONCURRENCY ?? 4),
);
const allowOverwrite = process.env.BLOB_ALLOW_OVERWRITE !== '0';

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
  const normalized = relativePath.split(path.sep).join('/').normalize('NFC');
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
  await put(blobPath, contents, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite,
  });
  console.info(`Uploaded ${relativePath} -> ${blobPath}`);
}

async function main(): Promise<void> {
  console.info('Blob uploads are disabled for now. Skipping.');
  return;

  const files = await collectFiles(outputRoot, outputRoot);
  if (files.length === 0) {
    console.info(`No files found under ${outputRoot}`);
    return;
  }

  console.info(`Uploading ${files.length} files from ${outputRoot} to Vercel Blob...`);
  console.info(`Concurrency: ${concurrency}`);

  let index = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (index < files.length) {
      const current = files[index];
      index += 1;
      await uploadFile(current);
    }
  });

  await Promise.all(workers);
}

void main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
