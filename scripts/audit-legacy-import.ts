import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const manifestPath = path.resolve(
  __dirname,
  '..',
  '..',
  'prompt',
  'operations',
  'career-consolidation',
  'legacy-harvest-manifest.csv'
);

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

function main() {
  if (!existsSync(manifestPath)) {
    throw new Error(`Legacy manifest not found: ${manifestPath}`);
  }

  const contents = readFileSync(manifestPath, 'utf8').trim();
  const [headerLine, ...dataLines] = contents.split('\n');
  const headers = parseCsvLine(headerLine);
  const rows = dataLines
    .filter(Boolean)
    .map(line => {
      const values = parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ?? '';
      });
      return row;
    });

  const outstanding = rows.filter(row => row.status !== 'done');
  const sourceRepos = Array.from(new Set(rows.map(row => row.source_repo))).sort();

  console.info(`Legacy sources: ${sourceRepos.join(', ')}`);
  console.info(`Harvest rows: ${rows.length}`);
  console.info(`Outstanding rows: ${outstanding.length}`);

  if (outstanding.length > 0) {
    outstanding.forEach(row => {
      console.info(`- ${row.source_repo}:${row.source_path} -> ${row.target_path} [${row.status}]`);
    });
    process.exitCode = 1;
  }
}

main();
