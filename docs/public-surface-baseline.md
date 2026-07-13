# Public Surface Baseline

## Scope

This note records the intended reader-facing route and navigation contract.

## Current Route Set

- `/`
- `/activities`
- `/activities/projects`
- `/activities/experience`
- `/activities/<slug>`
- `/activities/<slug>/docs/<path>`

## Reading Contract

- `/` is the integrated portfolio and primary entry point.
- `/#about`, `/#skills`, `/#experience`, and `/#projects` are the home section anchors.
- `/activities/projects` contains all records classified as projects.
- `/activities/experience` contains education, training and external activities, and work experience.
- `/activities` remains the complete archive with content-type filtering and sorting.
- activity detail pages and supporting documents retain the deeper project record.

All retained routes use the same portfolio header, typography, spacing, and
content-width system. A reader can return from a detail page to the matching
classified collection and from any collection to the relevant home section.

## Retired Routes

The following standalone summary routes are no longer part of the public site:

- `/profile`
- `/resume`
- `/work`
- `/writing`

Their useful reader-facing content is represented by the integrated home and
activity archive. Retired Markdown sources are retained only for provenance and
must not be restored as navigation items without an explicit information-
architecture decision.

## Validation

```bash
npm run validate:local
```

Read this note together with:

- `docs/publication-readiness-baseline.md`
- `docs/publication-provenance-baseline.md`
- `docs/repo-validation-baseline.md`
