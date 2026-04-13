# OneDrive Multi-Asset Probe Baseline

## Scope

- repository: `~/git/Career`
- bounded worktree: `~/git/.worktrees/Career/career-realignment-baseline`
- verification date: `2026-04-07`

## Purpose

이 문서는 OneDrive path remap이 단일 샘플 하나가 아니라, 서로 다른 lane 성격을 가진 asset들에 대해 어떻게 해석되는지 bounded하게 고정한다.

목적은 다음 세 가지를 함께 확인하는 것이다.

1. local live root가 canonical tree를 실제로 가지고 있는가
2. repo asset definition이 어떤 authoritative remote path를 바라보는가
3. `rclone` remote에서도 같은 canonical path가 실제로 보이는가

## Probe Set

### 1. Highlight original

- filename:
  - `해커톤-발표.mp4`
- normalized asset fields:
  - `remotePath = media/photos/misc/Highlight/해커톤-발표.mp4`
  - `remotePathOriginal = media/photos/misc/Highlight/해커톤-발표.mp4`
  - `publicPath = /import-data/highlight/해커톤-발표.mp4`
- local existence:
  - `/Users/mumallaeng/Library/CloudStorage/OneDrive-Personal/media/photos/misc/Highlight/해커톤-발표.mp4`
- remote existence:
  - `rclone lsf 'oow214-onedrive:media/photos/misc/Highlight' --max-depth 1 | rg '^해커톤-발표\.mp4$'`
  - result: matched

### 2. Dev-storage derivative

- filename:
  - `020309-네임컴작명연구소-0_copy.jpg`
- normalized asset fields:
  - `remotePath = media/photos/misc/dev-storage/020309-네임컴작명연구소-0_copy.jpg`
  - `remotePathOriginal = media/photos/misc/Highlight/020309-네임컴작명연구소-0_copy.jpg`
  - `publicPath = /import-data/dev-storage/020309-네임컴작명연구소-0_copy.jpg`
- local existence:
  - `/Users/mumallaeng/Library/CloudStorage/OneDrive-Personal/media/photos/misc/dev-storage/020309-네임컴작명연구소-0_copy.jpg`
- repo local-root probe result:
  - symlink created at:
    - `public/import-data/dev-storage/020309-네임컴작명연구소-0_copy.jpg`
  - symlink target resolved to the canonical local dev-storage path
- remote existence:
  - `rclone lsf 'oow214-onedrive:media/photos/misc/dev-storage' --max-depth 1 | rg '^020309-네임컴작명연구소-0_copy\.jpg$'`
  - result: matched

### 3. Project-sourced image with derivative lane

- filename:
  - `Shoepernoma_판넬.jpg`
- normalized asset fields:
  - `remotePath = media/photos/misc/dev-storage/Shoepernoma_판넬.jpg`
  - `remotePathOriginal = media/photos/projects/Shoepernoma/Shoepernoma_판넬.jpg`
  - `publicPath = /import-data/dev-storage/Shoepernoma_판넬.jpg`
- local existence:
  - original:
    - `/Users/mumallaeng/Library/CloudStorage/OneDrive-Personal/media/photos/projects/Shoepernoma/Shoepernoma_판넬.jpg`
  - derivative:
    - `/Users/mumallaeng/Library/CloudStorage/OneDrive-Personal/media/photos/misc/dev-storage/Shoepernoma_판넬.jpg`
- repo local-root probe result:
  - symlink created at:
    - `public/import-data/dev-storage/Shoepernoma_판넬.jpg`
  - symlink target resolved to the canonical local dev-storage derivative path
- remote existence:
  - `rclone lsf 'oow214-onedrive:media/photos/projects/Shoepernoma' --max-depth 1 | rg '^Shoepernoma_판넬\.jpg$'`
  - result: matched

## Interpretation

- local authoritative OneDrive root and remote canonical tree are aligned for three different asset patterns:
  - direct highlight original
  - dev-storage derivative
  - project-origin plus dev-storage derivative
- the path-remap change is no longer only a top-level tree assumption
- the repo now has bounded evidence that:
  - `Highlight` assets resolve under `media/photos/misc/Highlight`
  - `dev-storage` assets resolve under `media/photos/misc/dev-storage`
  - project-origin assets may keep their original under `media/photos/projects/...` while publish-time default paths still point at a derivative lane under `dev-storage`

## Operational Note

- this probe is intentionally bounded
- it does not replace a full publication batch
- it is sufficient to support the current realignment and path-remap baseline without reopening legacy `Photos/...` assumptions
- `sync:onedrive` with `ONEDRIVE_LOCAL_ROOT` still proceeds into remote inspection later in the script
- therefore this baseline was recorded from:
  - normalized asset-definition inspection
  - direct local-path existence checks
  - selected `rclone lsf` verification against authoritative remote directories
  rather than from waiting for a broad sync batch to finish
