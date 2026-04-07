# yeonwoofolio

## Current Public Route Baseline

- `/`
- `/profile`
- `/resume`
- `/work`
- `/writing`
- `/activities`

## Current IA Note

- `/` is the bounded landing surface for the current public route set
- `/activities` remains the canonical deep archive for detailed project records and supporting documents
- the current public route contract is summarized in `docs/public-surface-baseline.md`
- the current publication-readiness boundary is summarized in `docs/publication-readiness-baseline.md`

## Suggested Reading Starts

- for quick orientation:
  - `/`
  - `/profile`
  - `/work`
- for chronology-first reading:
  - `/resume`
  - `/work`
  - `/activities`
- for documentation-first reading:
  - `/writing`
  - selected `activities/.../docs/...` entry points
  - `/activities`

Current interpretation:

- `profile` is the shortest orientation surface
- `work` is the implementation-first reading surface
- `resume` is the chronology-first reading surface
- `writing` is the document-entry reading surface

## Local Validation

- default local validation:
  - `npm run validate:local`
- build without live OneDrive sync:
  - `npm run build:local`

See:

- `docs/public-surface-baseline.md`
  - route contract and suggested reading paths
- `docs/publication-readiness-baseline.md`
  - bounded publication-safe boundary
- `docs/repo-validation-baseline.md`
  - validation commands, OneDrive assumptions, and build/sync behavior
