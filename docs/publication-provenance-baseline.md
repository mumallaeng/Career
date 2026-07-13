# Publication Provenance Baseline

## Scope

This note records the provenance contract for four retired summary sources.
They were previously rendered at standalone public routes and are now retained
only to preserve their connection to Vault-side drafting sources.

## Retired Source Coverage

- former `/profile` source: `src/content/_retired/profile.md`
- former `/resume` source: `src/content/_retired/resume.md`
- former `/work` source: `src/content/_retired/work.md`
- former `/writing` source: `src/content/_retired/writing.md`

These paths are not public pages. The current public surface is the integrated
home and activity archive described in `docs/public-surface-baseline.md`.

## Contract

Each retained source carries:

- `publication_id`
- `publication_status: retired`
- `source_vault_path`
- `source_hash`
- `content_kind`
- `work_type`

`publication-manifest.csv` keeps the former public path as historical identity,
points to the `_retired` repo path, and records `status=retired`.

## Validation

```bash
npm run validate:publication
```

The validator checks:

- manifest shape and identifier uniqueness
- retained repo-source existence
- manifest and front-matter agreement, including retired status
- Vault source existence and SHA-256 agreement when the Vault root is available

It does not treat a retained historical `public_path` as a currently generated
route. Generated-route verification belongs to the application build.

## Boundary

This is a narrow historical provenance record, not a complete publication model
for the home or activity archive. Retained sources must not be imported by page
components or restored to navigation without an explicit decision.
