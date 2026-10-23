# Drinkarto database audit — 23 October 2026

Read-only checks against the configured PostgreSQL database. No production records were changed. Reproduce with `node --import tsx scripts/audit-data.ts`; aggregate evidence is saved in DATABASE-AUDIT-2026-10-23.json. Customer details, credentials and connection strings are excluded.

## Integrity

- 1,738 public catalogue entries match the committed import in IDs, names, categories and complete reference payloads. No missing or additional entries.
- Includes 84 valid Non-alcoholic entries; these are not alcohol-price categories.
- 6,524 published price records match the committed baseline: Kerala 4,395 and Tamil Nadu 2,129. No missing baseline records or changed prices.
- No duplicate price IDs, non-positive/invalid prices or sizes, missing source codes, or source/state mismatches were found. Both snapshots carry HTTPS source links.
- Inventory invariants, order item quantities/returns, order totals, invoice balances, session membership, review ratings and review-point consistency checks report zero violations.
- All 23 inspected application tables have row-level security enabled. Zero unvalidated database constraints.

## Gaps

- Only Kerala and Tamil Nadu have imported price snapshots. Directory entries and configured adapters for other states do not mean their records exist in this database.
- Both snapshots were last checked on 5 October 2026. They exceed the six-hour audit freshness threshold.
- No PriceRefreshRun records exist. The database does not provide evidence that automatic refreshes have run.
- Matching the import proves storage consistency, not that prices are current or that the original workbook is complete. This audit did not independently revalidate every record against current government documents.
- The community review table is empty; recommendation learning has no review history yet.

## Follow-up

Investigate and activate the existing source refresh worker with monitored execution, validate any newly fetched government price lists through the review workflow, and add further states only when source data is verified. Preserve existing snapshots on source failures; do not fill missing states with estimates.
