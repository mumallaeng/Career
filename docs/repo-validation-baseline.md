# Repo Validation Baseline

## Scope

This note captures the currently verified local validation and OneDrive path assumptions for the Career repository.

Validation commands are expected to work from the repository root or any clean linked worktree.

## OneDrive Path Baseline

- authoritative local root:
  - `/Users/mumallaeng/Library/CloudStorage/OneDrive-Personal`
- expected remote:
  - `oow214-onedrive`
- legacy remote prefixes still seen in source data:
  - `Photos/Highlight/`
  - `Photos/dev-storage/`
  - `Photos/Projects/`
- authoritative remapped prefixes used by the repo:
  - `media/photos/misc/Highlight/`
  - `media/photos/misc/dev-storage/`
  - `media/photos/projects/`

The remap logic lives in:

- `src/data/onedrive-paths.ts`
- `src/data/onedrive-assets.ts`

Operationally important branch note:

- `main` does not contain the remap landing commit `8114bac`
- therefore any deploy/build log that still lists legacy remote paths like `Photos/Highlight/...` or `Photos/Projects/...`
  should be treated as a stale-branch signal, not as evidence that the current `work/career-realignment-baseline`
  worktree is still generating legacy paths

## Verified Environment Controls

The current repo scripts support these controls:

- `ONEDRIVE_REMOTE_BASE`
- `ONEDRIVE_LOCAL_ROOT`
- `ONEDRIVE_LOCAL_SOURCE`
- `SKIP_ONEDRIVE_SYNC`
- `SKIP_ONEDRIVE_DOWNLOAD`
- `ENABLE_ONEDRIVE_NFC`

## Verified Commands

### Publication Provenance Validation

```bash
npm run validate:publication
```

- result on `2026-07-13`: passes
- current contract:
  - validates `publication-manifest.csv`
  - checks manifest/front-matter agreement for the retained provenance sources:
    - `profile`
    - `resume`
    - `work`
    - `writing`
  - confirms those entries are recorded as retired rather than current public pages
  - verifies Vault-side source hashes when the current environment can resolve
    the `Vault` root
- reference:
  - `docs/publication-provenance-baseline.md`

### Lint

```bash
npm run lint
```

- result on `2026-04-07`: passes

### Build Without Live Sync

```bash
npm run build:local
```

- result on `2026-04-07`: passes
- interpretation:
  - `prebuild` still runs
  - `sync:onedrive` enters and exits via the skip flag
  - no live OneDrive download is required for this validation mode

### Combined Local Validation

```bash
npm run validate:local
```

- current contract:
  - runs `npm run validate:publication`
  - runs `npm run lint`
  - then runs `npm run build:local`
- purpose:
  - gives future sessions one bounded command for publication metadata, lint, and repo-local validation without live OneDrive sync

### Full Remote-Only Build

```bash
env -u ONEDRIVE_LOCAL_ROOT npm run build
```

- result on `2026-04-07`: passes
- observed behavior:
  - `sync:onedrive` confirms all expected assets exist on `oow214-onedrive`
  - download now runs as bounded directory batches instead of spawning `rclone copyto` once per asset
  - the representative `2026-04-07` timed rerun completed in about `110s`
- interpretation:
  - the current bounded branch no longer depends on `ONEDRIVE_LOCAL_ROOT` for a successful production build
  - the practical problem behind the old failing Vercel logs was stale branch state plus per-file remote copy overhead, not the `ONEDRIVE_REMOTE_BASE` value itself

### Bounded Local-Root Sync Probe

```bash
ONEDRIVE_LOCAL_ROOT=/Users/mumallaeng/Library/CloudStorage/OneDrive-Personal \
ONEDRIVE_ONLY_ASSETS='020309-네임컴작명연구소-0_copy.jpg' \
SKIP_ONEDRIVE_DOWNLOAD=1 \
npm run sync:onedrive
```

- result on `2026-04-07`:
  - the target asset was linked successfully into:
    - `public/import-data/dev-storage/020309-네임컴작명연구소-0_copy.jpg`
  - the symlink resolved to:
    - `/Users/mumallaeng/Library/CloudStorage/OneDrive-Personal/media/photos/misc/dev-storage/020309-네임컴작명연구소-0_copy.jpg`
- interpretation:
  - the repo can resolve canonical local OneDrive media paths through `ONEDRIVE_LOCAL_ROOT`
  - bounded local-root probing no longer depends on the legacy `Photos/...` tree shape
  - because `public/import-data/*` is git-ignored, this validation does not dirty the repo

### Multi-Asset Path Probe

- reference:
  - `docs/onedrive-multi-asset-probe-baseline.md`
- result on `2026-04-07`:
  - bounded checks now exist for three distinct path classes:
    - `Highlight`
    - `dev-storage`
    - `projects` origin with `dev-storage` derivative
- interpretation:
  - path remap is now supported by representative evidence across more than one asset class
  - the current branch can rely on the authoritative `media/photos/...` tree without reopening legacy `Photos/...` assumptions
  - `sync:onedrive` now bounds remote inspection to the expected basenames under canonical directories instead of
    recursively listing whole remote trees
  - remote download is also now grouped into a small number of directory batches instead of hundreds of per-file `copyto`
    invocations

## Current Public-Surface Link

This note is not the primary source of truth for route-by-route public reading
guidance.

Use these notes instead:

- `docs/public-surface-baseline.md`
  - for the current route contract and reading order
- `docs/publication-provenance-baseline.md`
  - for the bounded source/provenance contract of the retired summary sources
- `docs/publication-readiness-baseline.md`
  - for the current bounded publication-safe boundary

This validation note records the commands used to check the current public
surface and its retained provenance sources.

## Practical Default

For routine repo validation that is not specifically about media sync:

1. run `npm run validate:local`

Use the live OneDrive root and remote only when the task is explicitly about sync, derivative generation, or upload behavior. For a minimal path-resolution probe, prefer the bounded single-asset command above.

For publication-facing route intent and current readiness limits, read this note
together with:

- `docs/public-surface-baseline.md`
- `docs/publication-readiness-baseline.md`
