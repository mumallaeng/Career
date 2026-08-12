# career-design-system

A standalone, framework-agnostic component package that ports the Career
portfolio's visual language (tokens, layout patterns, component styling)
into plain, prop-driven React components with no Next.js, i18n, or
filesystem dependency.

## Why this exists

Career's real portfolio components (`src/components/portfolio/*`) are not
importable outside the Next.js app: they use `next/link`/`next/navigation`,
pull copy from a locale-keyed i18n system, and (via `src/lib/portfolio.ts` →
`src/lib/content.ts`) read Markdown off disk with Node's `fs` at build time.
None of that runs in a plain browser bundle.

This package exists solely to give tooling that needs an importable,
`.d.ts`-typed component bundle (e.g. design-sync / claude.ai/design) a real,
buildable target — one that stays visually faithful to the live site (same
CSS classes, same tokens, same responsive behavior) without carrying any of
the app-specific coupling.

## Relationship to the live site

**This package is a parallel extraction, not the live site's source of
truth.** Career's actual pages under `src/components/portfolio/` are
untouched and keep working exactly as before; they do not import from here.
If the real portfolio's visual design changes, this package's `src/*.tsx`
and `src/*.css` need to be updated to match by hand — there is no shared
build step keeping them in sync. See the design-sync `NOTES.md` "Re-sync
risks" section (once design-sync has run against this package) for the
standing reminder.

## Build

```sh
npm install
npm run build      # tsup -> dist/index.js + dist/index.d.ts
npm run typecheck   # tsc --noEmit
```

## Components

`Button`, `SectionHeader`, `Tag`, `ContactLink`, `ProjectCard`,
`SkillGroupCard`, `ExperienceItem`, `NavBar`, `DetailPanel` — see each
file's JSDoc in `src/` for props and a usage example.

## Styling

Three plain CSS files, ported/trimmed from Career's `src/styles/themes.css`,
`base.css`, and `portfolio.css`. Not imported by `src/index.ts` (kept the JS
bundle framework-agnostic) — a consumer points at them directly:

- `src/tokens.css` — design tokens (colors, radii) as CSS custom properties
- `src/base.css` — minimal reset + base typography
- `src/components.css` — the component class styles, including the
  responsive (mobile / tablet / wide-desktop) `DetailPanel` breakpoints
