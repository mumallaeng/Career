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
SKIP_ONEDRIVE_SYNC=1 npm run build
```

- result on `2026-04-07`: passes
- interpretation:
  - `prebuild` still runs
  - `sync:onedrive` enters and exits via the skip flag
  - no live OneDrive download is required for this validation mode

## Current Caveat

- `src/content/profile.md` is still absent
- `/profile` builds because the page renders a fallback message when profile content is missing

## Practical Default

For routine repo validation that is not specifically about media sync:

1. run `npm run lint`
2. run `SKIP_ONEDRIVE_SYNC=1 npm run build`

Use the live OneDrive root and remote only when the task is explicitly about sync, derivative generation, or upload behavior.
