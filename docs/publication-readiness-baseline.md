# Publication Readiness Baseline

## Scope

This note defines the current publication-readiness contract for the bounded
`career-realignment-baseline` worktree.

It is intentionally narrower than a full publication manifest. The goal is to
make it obvious what is already safe to publish, what remains intentionally
bounded, and which note should be read for each concern.

## Current Public Surface

The currently landed public route set is:

- `/`
- `/profile`
- `/resume`
- `/work`
- `/writing`
- `/activities`

Current interpretation:

- `/` is the bounded landing surface for the current IA
- `/profile`, `/resume`, `/work`, and `/writing` are publication-safe summary
  surfaces
- `/activities` remains the canonical deep archive for detailed records and
  supporting documents

## Read This Note Together With

- `README.md`
  - use for a short repository entry point and the current public reading order
- `docs/public-surface-baseline.md`
  - use for the public route contract and reader-oriented navigation guidance
- `docs/repo-validation-baseline.md`
  - use for validation commands, OneDrive path assumptions, and build/sync
    behavior

## Current Readiness Statement

The repository is currently publication-ready in the following bounded sense:

- the public route contract is landed
- the current summary surfaces are readable together as a coherent entry path
- the current validation contract is repeatable in a dedicated worktree
- remote-only OneDrive build validation now passes against the canonical
  `media/photos/...` tree

The repository is not yet publication-ready in the following stronger sense:

- no provenance-complete publication schema exists yet
- no publication manifest has been introduced
- no mass migration from `Vault` has been attempted
- `activities` has not been reduced or replaced as the deep archive

## Safe Default

For bounded publication work, the default safe sequence is:

1. refine only the current summary surfaces or their framing notes
2. avoid route churn or broad archive migration
3. run `npm run validate:local`
4. update the matching control-plane note in `prompt/projects/Career/`

## Current Risk Interpretation

The remaining publication risk is mostly about consistency and scope control,
not about route availability.

That means the next safe work should continue to be:

- summary-surface refinement
- publication-note hardening
- validation/readability improvements

and should not yet be:

- broad content migration
- provenance schema expansion
- large media publication batches
