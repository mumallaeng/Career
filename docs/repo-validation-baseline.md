# Repo Validation Baseline

## Scope

This note captures the currently verified local validation and OneDrive path assumptions for the bounded `career-realignment-baseline` worktree.

## Worktree

- repository: `~/git/Career`
- branch: `work/career-realignment-baseline`
- worktree: `~/git/.worktrees/Career/career-realignment-baseline`

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
  - runs `npm run lint`
  - then runs `npm run build:local`
- purpose:
  - gives future sessions one bounded command for repo-local validation without live OneDrive sync

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

## Current Route Baseline

- realigned public content routes now present:
  - `/`
  - `/profile`
  - `/resume`
  - `/work`
  - `/writing`
- `/` now acts as the bounded landing surface for the current IA
- `/activities` remains the canonical deep archive
- `/profile` now has a real markdown backing file:
  - `src/content/profile.md`
- `/resume`, `/work`, and `/writing` currently use bounded markdown summaries and can be expanded in later streams
- `/writing` now links into selected `activities/.../docs/...` entry points rather than remaining only a placeholder summary
- the current publication-facing route contract is summarized in:
  - `docs/public-surface-baseline.md`

## Practical Default

For routine repo validation that is not specifically about media sync:

1. run `npm run validate:local`

Use the live OneDrive root and remote only when the task is explicitly about sync, derivative generation, or upload behavior. For a minimal path-resolution probe, prefer the bounded single-asset command above.
