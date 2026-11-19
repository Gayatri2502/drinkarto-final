# Drinkarto audit — 5 November 2026

## Verified

- Production build passes.
- 58 tests across 13 test files pass.
- Database audit covers 1,738 reference identities and 43,937 price rows across six states.
- No duplicate source IDs, invalid price rows, missing source codes or source/state mismatches detected.
- Inventory, order totals, invoice balances, review ratings, membership and rewards consistency checks report zero violations.
- RLS enabled on all 23 audited tables. No unvalidated constraints.

## Findings and work queue

| Priority | Finding | Evidence | Status |
| --- | --- | --- | --- |
| High | Five price feeds are stale | Database checkedAt audit | Requires fresh source extraction and validation |
| High | Scheduled imports fail repeatedly | Failed refresh runs, including Assam curl timeout exit 28 | Upstream reliability investigation required |
| High | Full browser interaction audit incomplete | Browser control disabled in Work settings | Pending |
| Medium | Catalogue contains workbook references independent of verified state prices | 1,738 reference identities versus six price feeds | Keep separate until exact identity reconciliation is reviewed |
| Medium | Product photo coverage incomplete | Six featured cutouts, placeholder for unmatched identities | Exact edition matching and licensed image acquisition pending |
| Medium | Age reset does not revoke server cookie | AgeGate reset clears local state only | Pending server-side revoke flow |
| Low | Audit script overwrites a historical dated filename | Hardcoded October filename | Fixed to date each new report |
| Low | Unused age acceptance handler remains after server form migration | AgeGate source | Removed |

## Data policy for this cleanup

Source-linked public retail records should be reconciled by exact edition, pack size, state and source code. Separate channel prices are not duplicates solely because the name matches. Missing tax components stay undisclosed. Google visibility alone does not establish state availability, freshness or image reuse rights.

No backend deletion was performed during this audit. Database consistency checks did not identify malformed rows requiring removal. The six supported authorities remain the source of retail price references.

## Image sourcing

Existing Hendrick's and Tanqueray cutouts have traceable Wikimedia Commons source pages and CC BY-SA licensing. Further acquisitions must preserve attribution, identify the exact edition, and inspect transparency. No new images have been imported in this audit.
