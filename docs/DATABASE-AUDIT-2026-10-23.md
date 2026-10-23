# Drinkarto database audit — 23 October 2026

The read-only audit (`scripts/audit-data.ts`) was rerun after the explicit official-source review and publication. Full machine-readable results are in `DATABASE-AUDIT-2026-10-23.json`.

- The public catalogue retains all 1,738 baseline products, including 84 non-alcoholic entries, with no identity/reference mismatches.
- Published price snapshots contain 43,937 source records: Kerala 4,401; Tamil Nadu 2,139; Karnataka 34,395; Odisha 876; Chhattisgarh 1,124; Assam 1,002. These are source records, not a count of unique brands shared across states.
- All six snapshots were checked on 23 October 2026. The government publication date and individual effective dates remain separate from the retrieval date. Historical effective entries in a current source are not relabelled as new 2026 prices.
- No duplicate IDs, invalid price/size, missing source codes or source/state mismatches were found.
- The reviewed BEVCO source corrects source code 13407029W to Copper Barrel Xxx Rum; one older baseline identity is therefore superseded. Prior snapshot backups were written outside the repository before publication.
- All 4,401 Kerala rows retain the published case and bottle columns. Bottle tax components plus an explicitly derived reconciliation difference reproduce the final bottle price. Manufacturer ex-distillery cost and itemised margins remain undisclosed.
- Seven operational integrity checks returned zero violations. All 23 application tables retain RLS, with no unvalidated constraints.
- An explicit maintenance review record documents each publication. Routine refreshes retain the existing review gate for first imports, identity changes, major price changes and large record-count drops.

## Coverage limits

The directory covers all 28 states and 8 union territories, but only six have imported official price feeds. Other entries show source-verification or restriction status. No prices or tax components have been estimated to fill gaps. Exact-name comparison deliberately avoids guessing that differently named variants are the same product.

The LiKAR reference review is recorded separately in `INDIA-PRICING-REFERENCE-2026-10-23.md`. Its marketing categories, effective tax percentages and generic formulas are not treated as verified government rules.

The daily GitHub Actions refresh is configured for 00:00 UTC (05:30 IST); failures retain the last published snapshot and generate health records/alerts. A successful check need not change a price.
