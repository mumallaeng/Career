import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

type ManifestRow = {
  publication_id: string;
  public_path: string;
  content_path: string;
  source_vault_path: string;
  source_hash: string;
  content_kind: string;
  work_type: string;
  status: string;
  notes: string;
};

type FrontMatterShape = Record<string, string | string[] | boolean>;

const REPO_ROOT = process.cwd();
const MANIFEST_PATH = path.join(REPO_ROOT, 'publication-manifest.csv');
const REQUIRED_HEADERS = [
  'publication_id',
  'public_path',
  'content_path',
  'source_vault_path',
  'source_hash',
  'content_kind',
  'work_type',
  'status',
  'notes',
] as const;

function parseCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentField = '';
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentField += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      currentRow.push(currentField);
      const isBlank = currentRow.every((value) => value === '');
      if (!isBlank) {
        rows.push(currentRow);
      }
      currentField = '';
      currentRow = [];
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    const isBlank = currentRow.every((value) => value === '');
    if (!isBlank) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function parseFrontMatter(fileContent: string): FrontMatterShape {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = fileContent.match(frontMatterRegex);

  if (!match) {
    throw new Error('Invalid front matter format');
  }

  const frontMatterText = match[1];
  const frontMatter: FrontMatterShape = {};

  frontMatterText.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':');
    if (!key || valueParts.length === 0) {
      return;
    }

    let value: string | string[] | boolean = valueParts.join(':').trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/"/g, ''));
    }

    if (value === 'true') value = true;
    if (value === 'false') value = false;

    frontMatter[key.trim()] = value;
  });

  return frontMatter;
}

function sha256(filePath: string): string {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

function resolveVaultRoot(): string | null {
  const explicit = process.env.VAULT_ROOT;
  if (explicit) {
    return fs.existsSync(explicit) ? explicit : null;
  }

  let current = REPO_ROOT;
  while (true) {
    const candidate = path.join(current, 'Vault');
    if (
      fs.existsSync(path.join(candidate, 'career-drafts')) &&
      fs.existsSync(path.join(candidate, 'provenance', 'career'))
    ) {
      return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function ensure(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function main(): void {
  ensure(fs.existsSync(MANIFEST_PATH), `Missing publication manifest: ${MANIFEST_PATH}`);

  const rows = parseCsv(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  ensure(rows.length >= 2, 'Publication manifest must contain a header row and at least one data row');

  const header = rows[0];
  ensure(
    REQUIRED_HEADERS.every((expected, index) => header[index] === expected),
    `Publication manifest headers do not match expected contract: ${REQUIRED_HEADERS.join(', ')}`,
  );

  const dataRows = rows.slice(1).map((row) => {
    const rowObject = Object.fromEntries(header.map((key, index) => [key, row[index] ?? '']));
    return rowObject as ManifestRow;
  });

  const vaultRoot = resolveVaultRoot();
  const seenPublicationIds = new Set<string>();
  const seenPublicPaths = new Set<string>();

  dataRows.forEach((row) => {
    ensure(row.publication_id.length > 0, 'publication_id must be non-empty');
    ensure(!seenPublicationIds.has(row.publication_id), `Duplicate publication_id: ${row.publication_id}`);
    seenPublicationIds.add(row.publication_id);

    ensure(row.public_path.length > 0, 'public_path must be non-empty');
    ensure(!seenPublicPaths.has(row.public_path), `Duplicate public_path: ${row.public_path}`);
    seenPublicPaths.add(row.public_path);

    const contentPath = path.join(REPO_ROOT, row.content_path);
    ensure(fs.existsSync(contentPath), `Missing content file: ${row.content_path}`);

    const frontMatter = parseFrontMatter(fs.readFileSync(contentPath, 'utf8'));
    ensure(frontMatter.publication_id === row.publication_id, `publication_id mismatch for ${row.content_path}`);
    ensure(frontMatter.source_vault_path === row.source_vault_path, `source_vault_path mismatch for ${row.content_path}`);
    ensure(frontMatter.source_hash === row.source_hash, `source_hash mismatch for ${row.content_path}`);
    ensure(frontMatter.content_kind === row.content_kind, `content_kind mismatch for ${row.content_path}`);
    ensure(frontMatter.work_type === row.work_type, `work_type mismatch for ${row.content_path}`);
  });

  if (vaultRoot) {
    dataRows.forEach((row) => {
      const sourcePath = path.join(vaultRoot, row.source_vault_path);
      ensure(fs.existsSync(sourcePath), `Missing Vault source: ${row.source_vault_path}`);
      ensure(
        sha256(sourcePath) === row.source_hash,
        `source_hash does not match Vault source for ${row.publication_id}: ${row.source_vault_path}`,
      );
    });
    console.log(`Publication validation passed for ${dataRows.length} entries with Vault source verification.`);
  } else {
    console.log(
      `Publication validation passed for ${dataRows.length} entries without Vault verification (VAULT_ROOT not found).`,
    );
  }
}

main();
