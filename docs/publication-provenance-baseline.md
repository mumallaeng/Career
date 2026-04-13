# Publication Provenance Baseline

## Scope

This note records the bounded publication provenance contract introduced for the
already-landed public summary surfaces.

It is intentionally smaller than a full publication schema for the whole
repository. The goal is to make the current public summary surfaces traceable to
their Vault-side drafting sources without opening a broad migration stream.

## First-Pass Coverage

The current bounded provenance baseline covers these summary surfaces only:

- `/profile`
- `/resume`
- `/work`
- `/writing`

It does not yet attempt to cover:

- `/`
- `/activities`
- all activity detail pages
- a full repository-wide publication manifest

## Repo Artifacts

The provenance baseline currently lives in two places:

1. `publication-manifest.csv`
2. front matter on:
   - `src/content/profile.md`
   - `src/content/resume.md`
   - `src/content/work.md`
   - `src/content/writing.md`

## Current Contract

Each first-pass public summary surface now carries these fields:

- `publication_id`
- `source_vault_path`
- `source_hash`
- `content_kind`
- `work_type`

Current interpretation:

- `publication_id` is the stable public identifier for the current surface
- `source_vault_path` points to the current Vault-side drafting source used as
  the bounded provenance anchor
- `source_hash` is the SHA-256 digest of that Vault-side source file
- `content_kind` identifies the publication surface class
- `work_type` identifies the summary-surface role more specifically

## Manifest Role

`publication-manifest.csv` is the repo-side registry for the bounded first pass.

It currently records:

- public route
- repo content path
- Vault source path
- Vault source hash
- content kind
- work type
- current linkage status

The manifest is intentionally small and limited to the already-landed public
summary surfaces.

## Validation

Use:

```bash
npm run validate:publication
```

The current validator checks:

- manifest shape
- uniqueness of `publication_id`
- uniqueness of `public_path`
- existence of the repo content files
- agreement between manifest values and front matter values
- Vault source existence and SHA-256 agreement when `Vault` can be resolved

## Vault Resolution Rule

The validator resolves the Vault root in this order:

1. `VAULT_ROOT` environment variable
2. the nearest ancestor sibling directory named `Vault` that contains:
   - `career-drafts`
   - `provenance/career`

This keeps the validation portable across the current multi-worktree layout.

## Boundary

This note does not claim that the repository has a full provenance-complete
publication model.

It only claims that:

- the current summary surfaces now have a bounded traceable source contract
- the contract is validated locally
- the next provenance expansion, if needed, can build on this baseline instead
  of starting from zero
