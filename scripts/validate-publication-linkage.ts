import { existsSync } from 'node:fs';
import {
  PublicationManifestRow,
  digitalGardenManifestPath,
  hashTarget,
  loadCareerPublicationContents,
  loadManifestRows,
  loadVaultLinkageRows,
  resolveVaultPath,
  vaultRoot,
  vaultLinkageManifestPath,
} from './lib/publication';

function fail(errors: string[]): never {
  errors.forEach(error => {
    console.error(`- ${error}`);
  });
  process.exit(1);
}

function collectDuplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
      continue;
    }
    seen.add(value);
  }

  return Array.from(duplicates);
}

function buildRowByPublicationId(rows: PublicationManifestRow[]) {
  const map = new Map<string, PublicationManifestRow>();
  for (const row of rows) {
    map.set(row.publication_id, row);
  }
  return map;
}

function main() {
  const errors: string[] = [];
  const contents = loadCareerPublicationContents();
  const manifestRows = loadManifestRows();
  const manifestByPublicationId = buildRowByPublicationId(manifestRows);
  const vaultRootExplicit = Boolean(process.env.VAULT_ROOT);
  const vaultAvailable = existsSync(vaultRoot) && existsSync(vaultLinkageManifestPath);
  const vaultLinkageByPublicationId = vaultAvailable
    ? new Map(loadVaultLinkageRows().map(row => [row.publication_id, row]))
    : new Map();

  if (vaultRootExplicit && !vaultAvailable) {
    errors.push(`VAULT_ROOT is unavailable or missing linkage manifest: ${vaultRoot}`);
  }

  if (!vaultAvailable && !vaultRootExplicit) {
    console.info(`Vault root not found at ${vaultRoot}; skipping source existence/hash checks.`);
  }

  const publicationIds = contents.map(item => String(item.frontMatter.publication_id ?? ''));
  const publicPaths = contents.map(item => item.publicPath);

  collectDuplicateValues(publicationIds.filter(Boolean)).forEach(value => {
    errors.push(`Duplicate publication_id in content files: ${value}`);
  });

  collectDuplicateValues(publicPaths.filter(Boolean)).forEach(value => {
    errors.push(`Duplicate public path in content files: ${value}`);
  });

  for (const item of contents) {
    const publicationId = String(item.frontMatter.publication_id ?? '');
    const contentKind = String(item.frontMatter.content_kind ?? '');
    const workType = String(item.frontMatter.work_type ?? '');

    if (!publicationId) {
      errors.push(`${item.contentPath}: missing publication_id`);
      continue;
    }

    if (!contentKind) {
      errors.push(`${item.contentPath}: missing content_kind`);
    }

    if (contentKind === 'work' && !workType) {
      errors.push(`${item.contentPath}: missing work_type`);
    }

    const manifestRow = manifestByPublicationId.get(publicationId);
    if (!manifestRow) {
      errors.push(`${item.contentPath}: missing manifest row for ${publicationId}`);
      continue;
    }

    if (manifestRow.public_path !== item.publicPath) {
      errors.push(`${item.contentPath}: manifest public_path mismatch (${manifestRow.public_path})`);
    }

    if (manifestRow.career_content_path !== item.contentPath) {
      errors.push(`${item.contentPath}: manifest career_content_path mismatch (${manifestRow.career_content_path})`);
    }

    if (manifestRow.content_kind !== contentKind) {
      errors.push(`${item.contentPath}: manifest content_kind mismatch (${manifestRow.content_kind})`);
    }

    if ((manifestRow.work_type || '') !== workType) {
      errors.push(`${item.contentPath}: manifest work_type mismatch (${manifestRow.work_type})`);
    }

    if (!vaultAvailable) {
      continue;
    }

    const vaultLinkageRow = vaultLinkageByPublicationId.get(publicationId);
    if (!vaultLinkageRow) {
      errors.push(`${item.contentPath}: missing Vault linkage row for ${publicationId}`);
      continue;
    }

    if (vaultLinkageRow.public_path !== item.publicPath) {
      errors.push(`${item.contentPath}: Vault linkage public_path mismatch (${vaultLinkageRow.public_path})`);
    }

    if (vaultLinkageRow.career_content_path !== item.contentPath) {
      errors.push(`${item.contentPath}: Vault linkage career_content_path mismatch (${vaultLinkageRow.career_content_path})`);
    }

    const resolvedVaultPath = resolveVaultPath(vaultLinkageRow.vault_path);
    if (!existsSync(resolvedVaultPath)) {
      errors.push(`${item.contentPath}: Vault source does not exist: ${vaultLinkageRow.vault_path}`);
      continue;
    }

    const actualHash = hashTarget(resolvedVaultPath);
    if (vaultLinkageRow.source_hash !== actualHash) {
      errors.push(`${item.contentPath}: Vault linkage source_hash drift detected`);
    }
  }

  const missingContentRows = manifestRows.filter(row => row.status === 'active' && !publicationIds.includes(row.publication_id));
  for (const row of missingContentRows) {
    errors.push(`Manifest row has no matching content file: ${row.publication_id}`);
  }

  if (existsSync(digitalGardenManifestPath)) {
    const gardenRows = loadManifestRows(digitalGardenManifestPath);
    const activeGardenRows = gardenRows.filter(row => row.status === 'active');
    const conflictingPublicationIds = collectDuplicateValues([
      ...manifestRows.filter(row => row.status === 'active').map(row => row.publication_id),
      ...activeGardenRows.map(row => row.publication_id),
    ]);
    conflictingPublicationIds.forEach(value => {
      errors.push(`publication_id collides with DigitalGarden manifest: ${value}`);
    });

  }

  if (errors.length > 0) {
    fail(errors);
  }

  console.info(`Validated ${contents.length} publication entries.`);
}

main();
