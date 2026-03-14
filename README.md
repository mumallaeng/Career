# Career

Public career publication repository for Gim Yeonwoo.

## Information Architecture

- `/profile`
- `/resume`
- `/work`
- `/writing`

`/activities*` remains only as a compatibility redirect to `/work*`.

## Canonical Roles

- `Career`: canonical public artifact
- `Vault`: private draft and provenance source
- `DigitalGarden`: reserved and intentionally empty in this phase

## Publication Linkage

Every public content file carries:

- `content_kind`
- `work_type` for work entries
- `source_vault_path`
- `source_hash`
- `publication_id`

Registry files:

- `manifests/publication-manifest.csv`
- `../Vault/manifests/vault-career-linkage-manifest.csv`

Local development with a sibling `../Vault` performs full source existence and hash checks.
CI-only builds such as Vercel fall back to manifest consistency checks when `../Vault` is unavailable.

## Useful Commands

- `npm run validate:publication`
- `npm run sync:onedrive`
- `npm run build`
- `npm run publish:from-vault -- <vault_path> <public_path> <title> <description> [work_type]`
