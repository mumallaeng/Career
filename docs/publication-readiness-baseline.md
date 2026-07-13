# Publication Readiness Baseline

## Scope

This note defines the bounded publication-readiness contract for the current
integrated portfolio and activity archive.

## Current Public Surface

- `/` is the integrated introduction, contact, skills, experience, and selected-project surface.
- `/activities`, `/activities/projects`, and `/activities/experience` are the archive collections.
- `/activities/<slug>` and its document routes contain the detailed public record.
- all retained routes share one portfolio navigation and visual system.

The former `/profile`, `/resume`, `/work`, and `/writing` summary routes are
retired and must not appear in navigation or generated route output.

## Current Readiness Statement

The repository is publication-ready in the following bounded sense:

- the current route contract has one primary home and one classified archive hierarchy
- activity detail and supporting-document routes remain available
- the retained public routes use a coherent layout and navigation system
- retired summary sources remain traceable without being rendered publicly
- local validation can run without a live OneDrive download

The repository does not claim a full provenance model for every activity or a
mass migration from Vault.

## Safe Default

1. refine the integrated home or an existing activity route
2. preserve the classified collection and detail hierarchy
3. keep retired source records non-public
4. run `npm run validate:local`
5. review generated routes for accidental legacy-route restoration

Read this note together with:

- `README.md`
- `docs/public-surface-baseline.md`
- `docs/publication-provenance-baseline.md`
- `docs/repo-validation-baseline.md`
