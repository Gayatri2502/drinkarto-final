# LocalPour feature status

## Implemented

- Optional browser geolocation after a user action; manual Indian destination input.
- Server-side Google Geocoding and Places API (New) adapter. Country checks exclude non-Indian locations. Radius options: 5, 10, 25, 50, 100 km. The 100 km option samples five 50 km search circles; results are deduplicated and filtered by actual distance. Coverage is explicitly non-exhaustive.
- Venue results, directions, provider attribution and separate Google / Drinkarto community scores.
- Occasion/taste survey. Driving or low mood returns alcohol-free choices. No personalised consumption quantity or ABV recommendation.
- Account-backed profiles using existing Drinkarto authentication, text reviews, moderation queue, and once-only 10-point approval ledger. Positive and critical reviews receive equal points. Platform reviewers are explicitly allowlisted via `PRICE_REVIEWER_USER_IDS`.
- Ranking uses approved review averages with a five-review, 3.5-star prior, then distance. It updates from new approved reviews. This is a transparent baseline, not trained ML.
- Private JPEG/PNG photo upload adapter, 3 MB limit, content signature validation, owner/moderator-only short-lived photo previews. Photos are not published automatically.
- Dynamic bottle detail pages from official price identities and workbook IDs, state comparison, honest unknown product fields, food-pairing illustrations, links from catalogue/price cards.
- Completed recipe food pairing cards.

## Provider setup still required

Set `GOOGLE_MAPS_SERVER_KEY` in Vercel with Geocoding and Places API (New) enabled and suitable key restrictions / quotas. This can incur Google charges; it is not enabled automatically.

For optional photos, set `SUPABASE_URL` and server-only `SUPABASE_SERVICE_ROLE_KEY`, and create a **private** Supabase Storage bucket named `localpour-private`. Never expose the service key to a browser. Define retention and orphan-photo cleanup before enabling uploads. JPEG/PNG metadata is not stripped by the current adapter; uploaded photos must avoid personal or location-sensitive metadata. Configure malware/metadata processing before public-scale uploads.

## Not active / not claimed

- Restaurant booking, partner agreements or points redemption. Points have no cash value and no guaranteed future redemption value.
- Restaurant rewards separate from reputation changes in approved review ranking.
- Trained ML, verified visits, fraud scoring, account email verification, public review reports/appeals and deletion workflows. Moderate conservatively until these are implemented.
- Instagram crawling or popularity claims. A public search link is provided; Instagram data ingestion requires an approved provider and applicable permissions.
- Nationwide local-speciality knowledge coverage. Goa's Cashew Feni GI is a sourced regional example. Empty knowledge coverage is stated explicitly.
- Venue-specific alcohol stock, menus, food availability, licensed status, city retail quotes or guaranteed cheapest venues.

## Migration

`20261023090000_localpour_community` adds CommunityReview and CommunityPoint, with private RLS and no anon/authenticated access. Apply via Prisma migrate deploy using a migration-capable connection. Existing ERP data is untouched.
