# Official price job

The backend worker checks Kerala BEVCO, Tamil Nadu TASMAC, Odisha OSBC, Karnataka KSBCL, Chhattisgarh CSMCL and Assam AERMS immediately, then every three hours. `PRICE_REFRESH_HOURS` accepts 1–24 (use 24 for daily). The interval begins after the previous run finishes, avoiding overlap. A PostgreSQL advisory lock also prevents duplicate workers. Checking frequently does not imply government rates change frequently.

## Local run

From the app directory, after migration and `npm run catalogue:import`:

```sh
npm run prices:refresh # one check
PRICE_PYTHON=/path/to/python-with-pdfplumber npm run prices:worker
```

Python requires pdfplumber, and the host needs curl with its normal trusted TLS certificate store. On this prepared machine the bundled Python path is configured in `.env`. The worker is a separate backend process; it must remain running and the computer must be awake and online. It is not tied to whether a visitor opens the page.

## Operation

BEVCO adapter discovers the newest dated IMFL/beer/wine quoted-items PDF on its official price-list page and validates the retail column. TASMAC uses the public catalogue endpoint used by its official brands page. OSBC reads the official 2026–27 MRP table and excludes defence-specific rows. KSBCL reads the dated supplier-wise item MRP PDF and selects the latest per-item entry effective on or before its publication date. CSMCL reads public retail price cards by category; its portal does not supply effective dates. Assam AERMS uses its public current financial-year form, retaining only currently valid civilian whisky MRP rows and excluding export/defence rates. Neither uses private accounts or invents rates. Changes update `PublicPriceSnapshot` atomically, append price changes in `PublicPriceChange`, record each attempt in `PriceRefreshRun`, and issue PostgreSQL `NOTIFY drinkarto_prices_updated` in the same transaction. Client searches read the current database snapshot with a short cache lifetime; already-open results require refetch/navigation to show a later snapshot.

Invalid schema, duplicate IDs, invalid prices, source mismatch, timeouts or a record-count reduction above 20% retain the last successful snapshot. The previous check time remains visible. Refresh failures do not claim a fresh check. Large legitimate catalogue reductions require a reviewed change to the guard, never an automatic bypass. Official effective dates are shown only when supplied. TASMAC does not provide an effective date.

## Deployment

For continuous service across server reboots, supervise `npm run prices:worker` using your hosting process manager. `deploy/drinkarto-prices.service` is a systemd template for a dedicated Linux backend. Configure its project directory, database secret, Python environment and restricted OS service user before enabling. No remote host is configured or deployed here. Do not expose an unauthenticated refresh endpoint. A Linux timer/cron invoking `prices:refresh` can be used instead of the long-running worker; do not run both intentionally.

## Reference data

`PublicProduct` stores 1,738 cleaned workbook identities separately from tenant stock and official rates. 745 variant rows are merged by source handle. Missing sizes remain unknown; the file’s undated prices, in-stock labels, descriptions and external images are excluded. Import is idempotent by normalized name hash. `docs/WORKBOOK-IMPORT.json` summarizes coverage and omissions.

## Source review and failure visibility

The worker now includes OSBC Odisha's 2026–27 MRP table. Defence-specific rates are excluded; identical duplicate rows are merged and conflicting duplicates fail extraction. The adapter fails closed if the financial-year header changes. Its stable code hashes supplier, exact product label and pack size because the public table does not expose a stable item ID. A label change therefore produces a new identity, not an inferred match.

First imports, disappearance of more than 20% of rows, any reused identity with changed name/size/category, or more than 10% of established rows changing price by over 25% are staged in `PriceReview`. Last-good published prices remain available. Run failures and review requirements persist in `PriceAlert`, and source failures emit `drinkarto_price_alerts` via PostgreSQL NOTIFY. UI alerts persist across browser sessions; NOTIFY is an event signal, not durable delivery or external email/paging.

Configure `PRICE_REVIEWER_USER_IDS` with trusted platform operator user IDs to enable review in Workspace → Price health. No tenant owner is automatically a platform reviewer. For CLI review, use `PRICE_REVIEWER_ACTOR_ID=<allowlisted ID> node --import tsx scripts/review-price-import.ts <review ID> approve|reject`. Source refreshes and approvals share an advisory lock, and stale candidates cannot overwrite a newer snapshot.

The initial Odisha development snapshot was verified and imported with a recorded development review. The three-hour worker is a separate process; a service manager and durable host are still required for unattended production operation. Successful refreshes resolve alerts; acknowledgement alone does not.

Large identity turnover (over 10% newly introduced source codes, minimum four rows) is also staged for matching review. One-shot refresh exits nonzero when a source fails, so an external job runner can detect failure without parsing logs. The periodic worker continues retries on the next scheduled cycle.
