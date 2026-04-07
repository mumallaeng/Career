# Public Surface Baseline

## Scope

This note records the currently intended reading contract for the bounded public surfaces that are already landed in the repository.

It is not a provenance manifest. It is a lightweight publication-facing baseline for future bounded refinement work.

## Current Route Set

- `/`
- `/profile`
- `/resume`
- `/work`
- `/writing`
- `/activities`

## Current Reading Contract

- `/` is the bounded landing surface for the current public IA
- `/profile` is the short orientation page
- `/resume` is the bounded chronology derived only from already published activity material
- `/work` is the small curated project surface for implementation-oriented reading
- `/writing` is the conservative document-entry surface
- `/activities` remains the canonical deep archive for detailed records and supporting docs

## Current Public Reading Paths

### For a quick orientation

1. `/`
2. `/profile`
3. `/work`

current interpretation:

- `profile` is now a slightly more guided orientation surface, not only a short statement page
- readers can move from interest areas to representative anchors before entering chronology or deep archive pages
- `work` is now also shaped to help readers choose between system-heavy, application-style, and smaller tool-oriented examples

### For chronology-first reading

1. `/resume`
2. `/work`
3. `/activities`

current interpretation:

- `resume` is now a slightly more guided chronology surface, not only a flat list of entries
- readers can choose to start from education, support/work, or project/open-source history depending on intent

### For documentation-first reading

1. `/writing`
2. linked `activities/.../docs/...` entry points
3. `/activities`

current interpretation:

- `writing` is now not only a document hub, but also a light reading guide that tells readers which documentation path to open first by project type

## Current Curation Limits

- no mass migration from `Vault`
- no provenance-complete publication schema yet
- no broad rewrite of `activities`
- current surfaces are intentionally summaries and entry points, not full replacements for the archive

## Validation Tie-In

When a bounded public-surface refinement lands, the minimum safe verification remains:

```bash
npm run validate:local
```

For route and publication-context assumptions, read this note together with:

- `docs/publication-readiness-baseline.md`
- `docs/repo-validation-baseline.md`
- `README.md`
