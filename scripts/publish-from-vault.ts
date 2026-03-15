import path from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import {
  careerContentRoot,
  hashTarget,
  parseFrontMatter,
  publicPathToContentPath,
  resolveVaultPath,
  upsertManifestRow,
  upsertVaultLinkageRow,
} from './lib/publication';

function usage(): never {
  console.error('Usage: tsx scripts/publish-from-vault.ts <vault_path> <public_path> <title> <description> [work_type]');
  process.exit(1);
}

function quote(value: string): string {
  return JSON.stringify(value);
}

function inferLinkageType(kind: string): string {
  return kind === 'resume' ? 'draft-source' : 'provenance-anchor';
}

function main() {
  const [vaultPath, publicPath, title, description, workTypeArg] = process.argv.slice(2);
  if (!vaultPath || !publicPath || !title || !description) {
    usage();
  }

  const normalizedPublicPath = publicPath.startsWith('/') ? publicPath : `/${publicPath}`;
  const { contentPath, kind } = publicPathToContentPath(normalizedPublicPath);
  const workType = kind === 'work' ? (workTypeArg ?? 'project') : '';
  const publicationId = `career${normalizedPublicPath}`.replace(/\/+/g, '/');
  const resolvedVaultPath = resolveVaultPath(vaultPath);

  if (!existsSync(resolvedVaultPath)) {
    throw new Error(`Vault source does not exist: ${vaultPath}`);
  }

  const sourceHash = hashTarget(resolvedVaultPath);
  const targetPath = path.join(careerContentRoot, ...contentPath.split('/'));
  mkdirSync(path.dirname(targetPath), { recursive: true });

  const frontMatterLines = [
    `title: ${quote(title)}`,
    `description: ${quote(description)}`,
    'tags: []',
    `categories: [${quote(kind)}]`,
    'startDate: "2026-03-14"',
    'endDate: "2026-03-14"',
    `content_kind: ${quote(kind)}`,
    kind === 'work' ? `work_type: ${quote(workType)}` : null,
    `publication_id: ${quote(publicationId)}`,
  ].filter(Boolean);

  if (existsSync(targetPath)) {
    const currentContents = readFileSync(targetPath, 'utf8');
    const { body } = parseFrontMatter(currentContents);
    writeFileSync(targetPath, `---\n${frontMatterLines.join('\n')}\n---\n${body}`);
  } else {
    writeFileSync(
      targetPath,
      `---\n${frontMatterLines.join('\n')}\n---\n\n# ${title}\n\n${description}\n`
    );
  }

  upsertManifestRow({
    publication_id: publicationId,
    site: 'career',
    public_path: normalizedPublicPath,
    career_content_path: contentPath,
    status: 'active',
    content_kind: kind,
    work_type: workType,
    notes: 'managed-by-publish-from-vault',
  });

  upsertVaultLinkageRow({
    publication_id: publicationId,
    site: 'career',
    public_path: normalizedPublicPath,
    career_content_path: contentPath,
    vault_path: vaultPath,
    source_hash: sourceHash,
    linkage_type: inferLinkageType(kind),
    status: 'linked',
    notes: 'managed-by-publish-from-vault',
  });

  console.info(`Published ${vaultPath} -> ${normalizedPublicPath}`);
}

main();
