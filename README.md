# Career

Public career publication repository for Gim Yeonwoo.

## Information Architecture

- `/`
- `/resume`
- `/work`

`/profile`, `/writing*`, and `/activities*` remain only as compatibility redirects into the current public surface.

## Canonical Roles

- `Career`: canonical public artifact
- `Vault`: private draft and provenance source
- `DigitalGarden`: reserved and intentionally empty in this phase

## Publication Linkage

Public content files carry:

- `content_kind`
- `work_type` for work entries
- `publication_id`

Public registry:

- `manifests/publication-manifest.csv`

Private Vault linkage:

- `../Vault/manifests/vault-career-linkage-manifest.csv`

Local development with a sibling `../Vault` performs source existence and hash checks through the private Vault linkage manifest.
CI-only builds such as Vercel fall back to public manifest consistency checks when `../Vault` is unavailable.

## Useful Commands

- `npm run validate:publication`
- `npm run sync:onedrive`
- `npm run build`
- `npm run publish:from-vault -- <vault_path> <public_path> <title> <description> [work_type]`
