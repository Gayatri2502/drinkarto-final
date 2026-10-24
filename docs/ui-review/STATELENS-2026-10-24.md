# StateLens UI review — 24 October 2026

Scope: `/prices?q=Southern%20Choice%20Brandy&size=750&state=Kerala`, its price explorer, India directory and tax receipt. Workflow: installed `21st-ui-review` skill. No `.21st/design.json` exists, so the current public reference-library design, existing CSS and user requirements form the design context. This review preserves the current branding and six-state official-price coverage.

## Deterministic review

`21st review` inspected `state-lens.tsx`, `india-price-atlas.tsx` and `price-buildup.tsx`. Before and after: **0 errors, 0 warnings, 22 informational hardcoded-color suggestions**. The JSON outputs are saved alongside this report. Those suggestions were not treated as accessibility failures or permission to redesign. CSS, computed contrast, responsive behavior and real loading/empty states require runtime inspection beyond this checker.

## Proven defects and narrow fixes

| Severity | Finding and evidence | Fix location |
| --- | --- | --- |
| P2 | At the mobile breakpoint the only Clear filters button lived inside `.lens-library`, which is `display:none`. A zero-result search displayed “Find your next comparison” and no visible reset action. Runtime confirmed the reset existed only in a hidden ancestor. | `src/components/state-lens.tsx:623`: shared, visible empty-state heading, recovery instructions and one Clear filters action for all screen sizes. |
| P2 | Brandy's 12px category caption used `#a56a29` on white: measured contrast **4.47:1**, below the **4.5:1** threshold for normal text. The small mobile jurisdiction note measured **3.38:1**. | `src/components/statelens-colour.css:455`: darken category text while retaining its hue; use darker 13px mobile note. |
| P2 | Runtime measured the small header eyebrow as `#172b3a` against the navy header (**1.02:1**), despite the intended mint rule. | `src/components/statelens-colour.css:452`: explicitly preserve the mint label on the dark header. |
| P2 | The mobile size selector stayed enabled while a new search fetched, although the bottle selector and comparison workspace were disabled/busy. It could accept a size from stale results. | `src/components/state-lens.tsx:274`: include loading in the native disabled condition. |

Source locations refer to the reviewed fixes; git history retains the original code. Contrast values were calculated from computed text colors and composited solid ancestor backgrounds, not a blanket full-page WCAG certification.

## Existing behavior retained

- Search inputs and native selects have accessible names. State and size buttons expose pressed state. Disclosure controls use native details/summary semantics.
- Lowest/highest states have written labels in addition to color; missing data uses an unavailable label instead of a fabricated price.
- Keyboard focus styling exists; result counts use polite live regions; errors use an alert and Retry.
- `professional.css` already disables public-page transitions/animations under reduced motion.
- Public pages explicitly set `color-scheme: light`. The app has a separate ERP dark root theme. A dark public theme is not implemented; it must not be presented as a completed feature.

## Judgment calls, not changed

1. Move the national directory below the bottle comparison or collapse more context to reduce scrolling. This changes information priority and needs a product decision.
2. Define public dark-mode tokens and a user preference control. Checking inheritance under a dark root is not equivalent to designing a full dark theme.
3. Consolidate the 22 color literals and layered override files into a documented design system. Choose and approve that system before broadly replacing colors.
4. Decide whether selected states should keep stable individual hues across selection/reordering, or use colors only for lowest/highest/missing statuses.
5. Exact-name/category matching is conservative but can miss cross-state matches with different source labels. Verified identity mapping is data work, not a safe visual-audit change.

## Validation

TypeScript, all **58 existing tests**, and the optimized production build pass. No new mirror tests were added for CSS; empty-state recovery and responsive/themed rendering are checked in the browser. Detailed runtime checks are recorded below after deployment verification.

### Runtime verification after publication

- Production deployment `8c071bf` is READY on drinkarto.vercel.app. The live mobile page now exposes the shared Clear filters action for a zero-result query. Activating it with Enter clears the query and starts fetching results. The normal bottle, size, provenance and missing-rate controls still render.
- Corrected header-label contrast: **9.83:1**. Corrected Brandy category-caption contrast: **7.14:1**. Corrected mobile state-note contrast against its panel: **6.35:1**. These sampled normal-text pairs exceed 4.5:1.
- Light and dark **root-theme inheritance** checks used isolated static DOM fixtures of the public page, its actual published styles and the reviewed CSS. Both root attributes retained `color-scheme: light`, white public surfaces, the same dark text and readable header/caption colors. This verifies isolation from the ERP dark theme, not a public dark-mode feature. Static fixtures do not test client interactions; interaction checks were performed separately on the live page. No OS appearance settings were changed.
- Both fixtures were measured at **322, 391, 769 and 1282 CSS pixels** (actual widths, adjusted for the browser's scaling). No StateLens content element extended more than one pixel beyond the viewport. At 322 and 1282 pixels, document scroll width rounded up by one pixel; there was no offscreen content control.
- Theme and width measurements are saved as JSON alongside this report. Browser viewport overrides were reset after testing.

### Limits

The public light-theme choice is deliberate in the existing source. A public dark toggle remains a judgment call. This is a focused UI review, not a full WCAG conformance audit, screen-reader certification, SKU-identity audit or government-price refresh verification. All 22 color-token suggestions remain informational pending a design-system decision.
