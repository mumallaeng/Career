# yeonwoofolio

## Current Public Routes

- `/`: integrated portfolio home
- `/activities`: complete project and experience archive
- `/activities/projects`: project collection
- `/activities/experience`: education, activities, and work-experience collection
- `/activities/<slug>`: activity detail
- `/activities/<slug>/docs/<path>`: supporting project document

The former `/profile`, `/resume`, `/work`, and `/writing` summary routes were
retired after their useful content was integrated into the home and activity
archive. Their source Markdown remains under `src/content/_retired` only for
provenance verification and is not rendered as a public page.

## Current Information Architecture

- the home presents the introduction, contact, skills, experience, and selected projects
- project and experience section links open their classified activity collections
- the activity archive keeps the full record and supporting documents
- all retained routes use the same portfolio navigation and visual system

## Local Validation

```bash
npm run validate:local
```

Build without live OneDrive sync:

```bash
npm run build:local
```

See:

- `docs/public-surface-baseline.md`
- `docs/publication-readiness-baseline.md`
- `docs/publication-provenance-baseline.md`
- `docs/repo-validation-baseline.md`
