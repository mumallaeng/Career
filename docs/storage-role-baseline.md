# Storage Role Baseline

## Purpose

This note fixes how the `Career` repo should treat cloud storage after the
Google Drive source-library migration.

The repo should keep using OneDrive as its bounded working asset surface. Google
Drive is the broader source library, not the direct build contract.

## Storage Roles

| Surface | Role for this repo |
|---|---|
| Google Drive | Full source library for photos and reference assets |
| OneDrive | Curated working mirror for `Career` build, dev, derivatives, and publication |
| HDD | Long-term backup and offline snapshots |
| Vault-Bridge | Temporary intake/handoff staging, not a repo asset contract |
| Git repo | Source, metadata, manifests, and validation logic only |

## Repo Contract

The current repo contract remains OneDrive-based:

- local root:
  - `/Users/mumallaeng/Library/CloudStorage/OneDrive-Personal`
- remote:
  - `oow214-onedrive:`
- authoritative Career asset roots:
  - `media/photos/misc/Highlight/`
  - `media/photos/misc/dev-storage/`
  - `media/photos/projects/`

The relevant code still lives in:

- `src/data/onedrive-paths.ts`
- `src/data/onedrive-assets.ts`
- `scripts/sync-onedrive.ts`
- `scripts/build-onedrive-derivatives.ts`
- `scripts/optimize-onedrive-videos.ts`

## Recommended Flow

Use this flow for new or revised media:

```text
Google Drive original
-> selected OneDrive working asset
-> Career asset registry / derivative generation
-> repo validation
```

Do not point the repo directly at the full Google Drive photo library unless the
sync scripts and validation baseline are intentionally redesigned.

Do not use OneDrive as the long-term full media archive after the Google Drive
source library is verified.

## OneDrive Subset Rule

OneDrive should keep only assets that satisfy at least one of these conditions:

- referenced by `src/data/onedrive-assets.ts`
- used as a `Career` thumbnail, project image, certificate image, or video
- generated into `media/photos/misc/dev-storage/`
- needed by the current `sync:onedrive`, derivative, or video optimization flow

Everything else should be treated as a candidate for Google-Drive-only storage
after verification.

## Validation

For routine repo work that does not mutate cloud storage:

```bash
npm run validate:local
```

For OneDrive asset sync behavior, continue to use the existing OneDrive
environment controls documented in `docs/repo-validation-baseline.md`.

## Related Notes

- `docs/repo-validation-baseline.md`
- `docs/onedrive-multi-asset-probe-baseline.md`
- prompt repo:
  - `operations/cloud-migration/cloud-storage-role-boundary-20260712.md`
  - `operations/career-publication/career-onedrive-rclone-session-boundary.md`
