# Production operations

Drinkarto is deployed as a Next.js application on Vercel with Supabase PostgreSQL. This document defines the repeatable controls needed to operate the deployed service.

## Environment variables

Set these as encrypted Vercel environment variables, never in source control:

| Variable                  | Production value                                                             |
| ------------------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`            | Supabase transaction-pooler URL for the running application                  |
| `APP_ORIGIN`              | `https://drinkarto.vercel.app` (replace if a custom primary domain is added) |
| `OPENAI_API_KEY`          | Optional server-only key for the workspace AI feature                        |
| `AI_MODEL`                | Optional approved model identifier                                           |
| `PRICE_REVIEWER_USER_IDS` | Comma-separated platform reviewer user IDs                                   |
| `DB_POOL_MAX`             | Optional, conservative connection pool limit; defaults to `5`                |

Use a direct, migration-only database connection where Supabase requires it. Do not run development seeds or integration tests against production.

## Health monitoring

`GET /api/health` checks the application’s PostgreSQL connectivity and returns only one of the following:

```json
{ "status": "ok", "service": "drinkarto", "checkedAt": "..." }
```

or HTTP `503` with `status: "unavailable"`. Configure an external uptime monitor to call:

```text
https://drinkarto.vercel.app/api/health
```

every five minutes and alert the operator after two consecutive failures. This endpoint deliberately contains no tenant data or secret configuration.

## Official price refresh

`.github/workflows/price-refresh.yml` is scheduled at minute 17 every three hours and may be run manually from **Actions → refresh official liquor prices**. It performs the same validation, quarantine and database locking as `npm run prices:refresh`.

Before enabling it, add the repository-level GitHub Actions secret `DATABASE_URL` using the restricted Supabase application connection. Do not use a browser-exposed key. A missing secret fails the run intentionally instead of silently reporting stale prices as fresh. Configure GitHub notifications for workflow failures to the platform operator.

The worker uses public official sources and preserves the last successful snapshot when extraction fails. It must never be exposed as a public HTTP endpoint. Price imports requiring review remain quarantined until an ID in `PRICE_REVIEWER_USER_IDS` approves or rejects them in Workspace → Price health.

## Releases and database changes

1. Work on a short-lived branch and open a pull request.
2. Require the `checks / verify` GitHub workflow before merging into `main`.
3. Apply reviewed production migrations once with `npm run db:migrate`, using the migration-only database connection.
4. Merge to `main`; Vercel produces the production deployment.
5. Confirm the deployment is ready, then confirm `GET /api/health` returns `200`.
6. Check the Vercel deployment logs and the price refresh history after release.

Use Vercel Preview deployments for UI and application testing. Preview environments should use a non-production database.

## Backups and recovery

Enable Supabase automated backups and point-in-time recovery appropriate to the customer data volume. At least quarterly, restore a backup into a separate project, run a read-only smoke test, and record the result. Keep the recovery access list limited to platform operators.

## Security response

Rotate database and AI credentials after any suspected exposure. Revoke the old value in Supabase/OpenAI, replace it in Vercel and GitHub Actions, deploy, then verify the health endpoint and workspace login. Maintain Vercel and Supabase alerting for failed deployments, database availability and usage limits.

## Remaining organisational launch inputs

A legal representative must finalise the public entity name, physical address, privacy/grievance contact, retention schedule, commercial contract terms, and state-specific alcohol-content review. These are business and legal decisions, so they are not inferred by the codebase.
