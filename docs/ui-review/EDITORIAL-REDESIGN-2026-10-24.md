# Public editorial redesign · 24 October 2026

## Implemented
- Shared public tokens, navigation and footer; warm paper/ink/olive palette, editorial serif headings, restrained surfaces.
- Home page photographic still life using an existing attributed transparent bottle; database-backed coverage counts retained.
- Bottle-first StateLens; national rules and tax atlas moved to an optional disclosure below comparison. Missing-price labels, effective dates and price breakdown logic retained.
- Shared visual treatment for Knowledge, Recipes, Library, Compare and Business pages. ERP remains outside this public styling scope.
- 21st Animated Tabs and Reveal interaction patterns adapted for native React/CSS/Web Animations. No new runtime dependencies, AI generation or public theme publishing.

## Proven defect fixes
- Existing professional.css important rules suppressed the intended typeface and paper background; corrected at the public theme boundary and visually verified on the local home-page fixture.
- Knowledge topic navigation forced smooth scrolling despite reduced-motion preference; it now checks that preference.
- Mobile navigation now declares aria-controls and Escape closes it and returns focus to its trigger.

## Verification
- TypeScript and optimized production build pass. 58 tests in 13 files pass.
- HTTP 200 on home, price comparison, knowledge, recipes, catalogue, business and price-comparison API. Southern Choice Brandy still resolves to a real reference record.
- Desktop home-page render visually inspected in the browser before browser access became disabled in Work settings.
- 21st review: zero errors, zero warnings; informational hardcoded-colour suggestions include the intentional token definitions and decorative tonal values.
- Temporary component harness removed before release.

## Remaining visual validation
Browser access became disabled during this work. Mobile/tablet screenshots, interactive browser regression and OS dark-preference checks are not completed for this release. Public pages intentionally keep a light reading canvas with dark accents; a full dark-theme toggle is not implemented. Do not describe this as a full accessibility audit or a redesign of ERP screens.

## Design decisions
The editorial palette, hero arch and serif typography are design choices rather than proven defects. The user authorized a broader visual redesign. Full 3D models, automatic animations and further layout changes to complex workflows were not added.

See .21st/DESIGN.md for component references and design decisions.
