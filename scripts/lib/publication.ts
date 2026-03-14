import path from 'node:path';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';

export type PublicationKind = 'profile' | 'resume' | 'work' | 'writing';

export type PublicationFrontMatter = {
  title?: string;
  description?: string;
  content_kind?: PublicationKind;
  work_type?: string;
  publication_id?: string;
  [key: string]: string | string[] | boolean | number | undefined;
};

export type PublicationContent = {
  filePath: string;
  contentPath: string;
  publicPath: string;
  frontMatter: PublicationFrontMatter;
};

export type PublicationManifestRow = {
  publication_id: string;
  site: string;
  public_path: string;
  career_content_path: string;
  status: string;
  content_kind: string;
  work_type: string;
  notes: string;
};

export type VaultLinkageRow = {
  publication_id: string;
  site: string;
  public_path: string;
  career_content_path: string;
  vault_path: string;
  source_hash: string;
  linkage_type: string;
  status: string;
  notes: string;
};

export const careerRoot = path.resolve(__dirname, '..', '..');
export const careerContentRoot = path.join(careerRoot, 'src/content');
export const careerManifestPath = path.join(careerRoot, 'manifests/publication-manifest.csv');
export const vaultRoot = process.env.VAULT_ROOT
  ? path.resolve(process.env.VAULT_ROOT)
  : path.resolve(careerRoot, '..', 'Vault');
export const vaultLinkageManifestPath = path.join(vaultRoot, 'manifests', 'vault-career-linkage-manifest.csv');
export const digitalGardenManifestPath = path.resolve(careerRoot, '..', 'DigitalGarden', 'manifests/publication-manifest.csv');

const contentExtensions = ['.mdx', '.md'];

function toPosixPath(value: string): string {
  return value.split(path.sep).join('/');
}

function parseScalarValue(rawValue: string): string | string[] | boolean | number {
  let value = rawValue.trim();

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
    value = value.slice(1, -1);
  }

  if (value.startsWith('[') && value.endsWith(']')) {
    const body = value.slice(1, -1).trim();
    if (!body) {
      return [];
    }
    return body
      .split(',')
      .map(entry => entry.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

export function parseFrontMatter(fileContent: string): { frontMatter: PublicationFrontMatter; body: string } {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid front matter format');
  }

  const frontMatter: PublicationFrontMatter = {};
  for (const line of match[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    frontMatter[key] = parseScalarValue(value);
  }

  return { frontMatter, body: match[2] };
}

function findIndexFile(directoryPath: string): string | null {
  for (const ext of contentExtensions) {
    const candidate = path.join(directoryPath, `index${ext}`);
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

function buildPublicPathFromContentPath(contentPath: string): string {
  const normalized = toPosixPath(contentPath);
  const segments = normalized.split('/').filter(Boolean);

  if (segments[0] === 'profile') return '/profile';
  if (segments[0] === 'resume') return '/resume';
  if (segments[0] === 'writing') {
    const slug = (segments[1] ?? '').replace(/\.(md|mdx)$/i, '');
    return `/writing/${slug}`;
  }
  if (segments[0] === 'work') {
    return `/work/${segments[1] ?? ''}`;
  }

  throw new Error(`Unsupported content path: ${contentPath}`);
}

export function loadCareerPublicationContents(): PublicationContent[] {
  const items: PublicationContent[] = [];

  const singletonDirs = ['profile', 'resume'];
  for (const dirName of singletonDirs) {
    const filePath = findIndexFile(path.join(careerContentRoot, dirName));
    if (!filePath) {
      continue;
    }

    const fileContent = readFileSync(filePath, 'utf8');
    const { frontMatter } = parseFrontMatter(fileContent);
    const contentPath = toPosixPath(path.relative(careerContentRoot, filePath));
    items.push({
      filePath,
      contentPath,
      publicPath: buildPublicPathFromContentPath(contentPath),
      frontMatter,
    });
  }

  const workRoot = path.join(careerContentRoot, 'work');
  if (existsSync(workRoot)) {
    for (const entry of readdirSync(workRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const filePath = findIndexFile(path.join(workRoot, entry.name));
      if (!filePath) {
        continue;
      }

      const fileContent = readFileSync(filePath, 'utf8');
      const { frontMatter } = parseFrontMatter(fileContent);
      const contentPath = toPosixPath(path.relative(careerContentRoot, filePath));
      items.push({
        filePath,
        contentPath,
        publicPath: buildPublicPathFromContentPath(contentPath),
        frontMatter,
      });
    }
  }

  const writingRoot = path.join(careerContentRoot, 'writing');
  if (existsSync(writingRoot)) {
    for (const entry of readdirSync(writingRoot, { withFileTypes: true })) {
      if (entry.isFile() && contentExtensions.some(ext => entry.name.endsWith(ext))) {
        const filePath = path.join(writingRoot, entry.name);
        const fileContent = readFileSync(filePath, 'utf8');
        const { frontMatter } = parseFrontMatter(fileContent);
        const contentPath = toPosixPath(path.relative(careerContentRoot, filePath));
        items.push({
          filePath,
          contentPath,
          publicPath: buildPublicPathFromContentPath(contentPath),
          frontMatter,
        });
      }

      if (entry.isDirectory()) {
        const filePath = findIndexFile(path.join(writingRoot, entry.name));
        if (!filePath) {
          continue;
        }
        const fileContent = readFileSync(filePath, 'utf8');
        const { frontMatter } = parseFrontMatter(fileContent);
        const contentPath = toPosixPath(path.relative(careerContentRoot, filePath));
        items.push({
          filePath,
          contentPath,
          publicPath: buildPublicPathFromContentPath(contentPath),
          frontMatter,
        });
      }
    }
  }

  return items.sort((left, right) => left.contentPath.localeCompare(right.contentPath));
}

export function resolveVaultPath(vaultRelativePath: string): string {
  return path.join(vaultRoot, vaultRelativePath);
}

export function hashTarget(targetPath: string): string {
  if (!existsSync(targetPath)) {
    throw new Error(`Hash target does not exist: ${targetPath}`);
  }

  const stats = statSync(targetPath);
  if (stats.isFile()) {
    return createHash('sha256').update(readFileSync(targetPath)).digest('hex');
  }

  if (!stats.isDirectory()) {
    throw new Error(`Unsupported hash target: ${targetPath}`);
  }

  const hash = createHash('sha256');
  const walk = (currentPath: string) => {
    const entries = readdirSync(currentPath, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      hash.update(toPosixPath(path.relative(targetPath, fullPath)));
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        hash.update(readFileSync(fullPath));
      }
    }
  };

  walk(targetPath);
  return hash.digest('hex');
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += character;
  }

  values.push(current);
  return values;
}

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function loadCsvRows<T extends Record<string, string>>(manifestPath: string): T[] {
  if (!existsSync(manifestPath)) {
    return [];
  }

  const contents = readFileSync(manifestPath, 'utf8').trim();
  if (!contents) {
    return [];
  }

  const [headerLine, ...dataLines] = contents.split('\n');
  const headers = parseCsvLine(headerLine);

  return dataLines
    .filter(Boolean)
    .map(line => {
      const values = parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ?? '';
      });
      return row as T;
    });
}

function writeCsvRows<T extends Record<string, string>>(rows: T[], header: string[], manifestPath: string) {
  const lines = [
    header.join(','),
    ...rows.map(row => header.map(column => escapeCsvValue(row[column] ?? '')).join(',')),
  ];

  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, `${lines.join('\n')}\n`);
}

export function loadManifestRows(manifestPath = careerManifestPath): PublicationManifestRow[] {
  return loadCsvRows<PublicationManifestRow>(manifestPath);
}

export function loadVaultLinkageRows(manifestPath = vaultLinkageManifestPath): VaultLinkageRow[] {
  return loadCsvRows<VaultLinkageRow>(manifestPath);
}

export function writeManifestRows(rows: PublicationManifestRow[], manifestPath = careerManifestPath) {
  writeCsvRows(
    rows,
    [
      'publication_id',
      'site',
      'public_path',
      'career_content_path',
      'status',
      'content_kind',
      'work_type',
      'notes',
    ],
    manifestPath
  );
}

export function writeVaultLinkageRows(rows: VaultLinkageRow[], manifestPath = vaultLinkageManifestPath) {
  writeCsvRows(
    rows,
    [
      'publication_id',
      'site',
      'public_path',
      'career_content_path',
      'vault_path',
      'source_hash',
      'linkage_type',
      'status',
      'notes',
    ],
    manifestPath
  );
}

export function upsertManifestRow(row: PublicationManifestRow, manifestPath = careerManifestPath) {
  const rows = loadManifestRows(manifestPath);
  const nextRows = rows.filter(existing => existing.publication_id !== row.publication_id);
  nextRows.push(row);
  nextRows.sort((left, right) => left.public_path.localeCompare(right.public_path));
  writeManifestRows(nextRows, manifestPath);
}

export function upsertVaultLinkageRow(row: VaultLinkageRow, manifestPath = vaultLinkageManifestPath) {
  const rows = loadVaultLinkageRows(manifestPath);
  const nextRows = rows.filter(existing => existing.publication_id !== row.publication_id);
  nextRows.push(row);
  nextRows.sort((left, right) => left.public_path.localeCompare(right.public_path));
  writeVaultLinkageRows(nextRows, manifestPath);
}

export function publicPathToContentPath(publicPath: string): { contentPath: string; kind: PublicationKind; workType?: string } {
  if (publicPath === '/profile') {
    return { contentPath: 'profile/index.mdx', kind: 'profile' };
  }

  if (publicPath === '/resume') {
    return { contentPath: 'resume/index.mdx', kind: 'resume' };
  }

  if (publicPath.startsWith('/work/')) {
    const slug = publicPath.slice('/work/'.length).replace(/^\/+|\/+$/g, '');
    return { contentPath: `work/${slug}/index.mdx`, kind: 'work' };
  }

  if (publicPath.startsWith('/writing/')) {
    const slug = publicPath.slice('/writing/'.length).replace(/^\/+|\/+$/g, '');
    return { contentPath: `writing/${slug}.mdx`, kind: 'writing' };
  }

  throw new Error(`Unsupported public path: ${publicPath}`);
}
