# Drinkarto

**Smarter Distribution. Better Decisions.**

A real PostgreSQL-backed starter for an intelligent B2B beverage distribution platform. This first implementation provides authentication, organization isolation, role checks, retailer and product management, an inventory ledger, order reservations, credit exception approval, cancellation, an operations dashboard, audit history and a basic OpenAI analytics copilot.

This is the foundation/core operations phase, not the completed production SaaS. Statutory tax invoicing, payment processing, partial shipments, team administration, retailer portal, compliance reminders, billing, RAG and forecasting remain to be implemented. See [architecture and roadmap](docs/ARCHITECTURE.md) and [API reference](docs/API.md).

## Requirements

- Node.js 24 LTS and npm.
- PostgreSQL 17 (or a running compatible PostgreSQL service).
- Docker with its engine running if using the supplied local database container.
- An OpenAI Platform key with model access and billing for optional AI requests.

## Run locally

From this repository directory:

```bash
npm ci
cp .env.example .env
# Start the local database. Its port is bound to localhost only.
docker compose up -d db
npm run db:generate
npm run db:migrate
npm run dev
```

Open the [public library](http://localhost:3000) or [business workspace](http://localhost:3000/workspace). In the workspace, select **Create a workspace**, then create an owner account. No fictional data is loaded automatically into a new workspace.

If port 5432 is already occupied, use your existing PostgreSQL service with a new dedicated database and set DATABASE_URL in `.env`, or map the container to a different host port and update the URL. For a managed database, replace the local placeholder with its PostgreSQL connection string. The app’s database URL is server-only; it is never sent to the browser.

## Try the workflow

1. Create a retailer and set its credit limit.
2. Create a product with its current selling price and SKU.
3. In Inventory, receive stock using a positive quantity change and a reason.
4. Create an order. Sufficient stock and credit reserves inventory immediately.
5. Orders over the credit limit await explicit manager/owner approval and do not reserve stock until approved.
6. Cancel a submitted order to release its reservation.
7. Review the audit trail and dashboard, then use **Ask Drinkarto** to query scoped order, stock, approval and recent invoice data. Conversations are saved to your member account and can be deleted from the workspace.

Order entry supports multiple distinct product lines; the backend accepts up to 100. Blank retailer email/licence fields should be omitted when calling the API. Prices are always read on the server, never accepted from the order form.

## Environment variables

| Variable                | Purpose                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| DATABASE_URL            | PostgreSQL connection string                                                    |
| APP_ORIGIN              | Exact browser origin used for write-request CSRF checks                         |
| OPENAI_API_KEY          | Server-only OpenAI credential                                                   |
| OPENAI_ENV_FILE         | Optional path to a separately managed env file for server-side AI configuration |
| AI_MODEL                | OpenAI model ID; defaults to gpt-6-luna                                         |
| SEED_PASSWORD           | Development-only owner password for fictional seed data                         |
| PRICE_REVIEWER_USER_IDS | Platform user IDs allowed to approve quarantined official price imports         |
| DB_POOL_MAX             | Optional PostgreSQL connection-pool limit; defaults to `5`                      |

The app works without an OpenAI key; AI requests report a configuration/provider error until `OPENAI_API_KEY` is provided. Put credentials in an ignored local `.env` file or your hosting provider’s secret manager. Never commit live keys, passwords, or connection strings.

## Optional fictional seed

Use an empty development database. Choose a password of at least 12 characters:

```bash
SEED_PASSWORD='choose-a-development-password' npm run db:seed
```

Sign in as `owner@example.test` using the password you supplied. The seed creates one organization, three brand labels, 20 products, 50 retailers and receipt movements. It does not yet generate 100 orders/invoices/payments. It refuses to overwrite an existing seed account.

## Tests and builds

```bash
npm run db:generate
npm run typecheck
npm test
npm run build
npm start
```

In another terminal, with the app running and `.env` configured:

```bash
npm run test:integration
```

Integration tests create fictional tenants and records in the configured database. Use only a dedicated development/test database. They exercise HTTP authentication, cross-tenant ID tampering, rejected caller-supplied tenant fields, inventory constraints, reservation release, credit exceptions, Origin checks and logout. Test data remains in the database for inspection. CI runs PostgreSQL migrations, unit tests, a production build and these HTTP tests.

## Repository

```text
src/app/              responsive UI and versioned API controller
src/lib/auth.ts       session authentication, RBAC and Origin checks
src/lib/policy.ts     permission and stock invariants
src/lib/operations.ts transactional stock and order services
src/lib/analytics.ts  tenant-scoped approved analytics tools
src/lib/ai.ts         bounded OpenAI Responses API tool loop
prisma/               schema, SQL migrations and fictional seed
 tests/               unit and HTTP integration tests
docs/                 architecture, diagrams and API guide
.github/workflows/    CI
Dockerfile            application container
 docker-compose.yml   local PostgreSQL service
```

## PostgreSQL and Supabase connection

The application’s persistence layer uses Prisma 7 with the `@prisma/adapter-pg` PostgreSQL driver. To use Supabase, set `DATABASE_URL` to the connection string from the Supabase project’s database connection panel; the current code does not use the Supabase JavaScript client or require a browser anon key. Keep the URL and its password in `.env` locally or in the deployment platform’s encrypted environment variables. Use the provider-recommended pooled URL for app traffic and a direct URL for schema migrations when required by the project configuration. The committed `.env.example` contains only local placeholders.

### Vercel database settings

In the Vercel project, open **Settings → Environment Variables**. Add `DATABASE_URL` using the Supabase transaction-pooler connection string from **Supabase → Connect**, including the URL-encoded database password. Select the Preview and Production environments you intend to use, save, and redeploy. Changing the local `.env` does not update Vercel.

Set `APP_ORIGIN` to the website’s public HTTPS origin. Keep both variables server-side; the database URL must never use a `NEXT_PUBLIC_` prefix. `npm run build` generates the Prisma client before building Next.js. `.vercelignore` excludes local secrets and build artifacts from source uploads.

The database schema, SQL migrations and optional fictional development seed live in `prisma/`. Apply them with `npm run db:migrate`; never point the development seed or integration tests at production.

## Database changes

Edit `prisma/schema.prisma`, run `npm run db:dev -- --name describe_change`, then `npm run db:generate`. Review and commit generated SQL. Deploy existing migrations with `npm run db:migrate`; never use migrate dev against production. The additional SQL migration installs stock/credit constraints and append-only audit triggers that Prisma does not express directly.

## Deployment outline

Build with `npm ci`, `npm run db:generate` and `npm run build`. Run migrations once as a deployment job against a managed PostgreSQL database, then run `npm start` behind HTTPS. Set APP_ORIGIN to the public HTTPS origin; production cookies require HTTPS. The Dockerfile builds the application; configure database and AI secrets at runtime. Use a least-privilege database role, automated backups and monitoring before admitting real customers. The container includes build dependencies; further image slimming is pending.

## Troubleshooting and current limits

- **Service unavailable:** check PostgreSQL connectivity and applied migrations. Server errors expose no database credentials to the client.
- **Invalid request origin:** ensure APP_ORIGIN matches the browser origin, including port.
- **AI provider unavailable:** check billing, selected model access and whether the server-side key is configured and active.
- **Concurrent change:** refresh the data and retry after a 409 response.
- **Docker connection error:** start the Docker engine, or use an existing PostgreSQL service.
- Current role policies are fixed. Team invitations, configurable permissions, assigned retailer restrictions and owner recovery flows are pending. SALES order creation is denied until assignment authorization exists.
- Sessions last one day; email verification, password reset, OTP, 2FA and device/session management are pending.
- Lists are bounded to 100 results; pagination and report exports are pending.
- Transitive dependency overrides pin patched deepmerge-ts and mysql2 versions. The current npm audit reports zero known vulnerabilities; review these overrides when upgrading Prisma.
- Vercel hosting and a database-aware `/api/health` endpoint are configured. Automated backup retention, uptime alerts, production migrations, reviewer access and legal launch inputs must be completed as described in [production operations](docs/PRODUCTION.md) before serving real customers.

Drinkarto's future compliance module will support records and reminders. Jurisdiction-specific regulatory requirements must be verified with the applicable authority.

## Verified in this workspace

The local PostgreSQL migrations applied successfully. TypeScript checks, 32 unit tests and the production build passed. Integration tests are available for a dedicated development database; a live OpenAI provider response has not been verified.

## Public consumer library

The homepage now serves a consumer reference library separately from the ERP at `/workspace`. Public routes include `/prices`, `/dictionary`, `/wines`, `/taste`, `/compare`, `/guides`, and individual guide pages. Searchable official prices cover Kerala, Tamil Nadu, Odisha, Karnataka, Chhattisgarh and Assam. Assam currently covers civilian whisky MRPs; all references are dated source snapshots and remaining states stay marked as uncovered. Taste profiles describe styles rather than guarantee a specific bottle’s flavour.

The public `/api/public/prices` endpoint reads official snapshots from PostgreSQL independently of tenant products and inventory. See [data provenance](docs/PUBLIC-DATA.md) for snapshot dates, parsing rules and refresh limitations.

## Database-backed library and price refresh

The public knowledge hub at `/guides` groups source-linked field notes by styles and production, brand stories, places and heritage, responsible-use information, tours and workshops, and business setup. It includes interactive topic filters and search, plus article pages with primary references. `/dictionary` remains the A–Z companion. Business and licensing content is educational guidance, not legal advice; current state rules and approvals must be checked with the relevant authority.

Public pages use attributed, descriptive photography for product categories, taste, heritage, recipes and distribution context. Bottle photographs are clearly labelled category examples, not SKU-verified product packshots. See [image sources and attribution](docs/IMAGE-ATTRIBUTION.md).

Run migrations, then `npm run catalogue:import` to initialize public database records without overwriting subsequent official price snapshots. The scheduled GitHub Actions worker runs `npm run prices:refresh` daily at 00:00 UTC (05:30 IST), using the configured `DATABASE_URL` Actions secret; a dedicated worker service remains an alternative. See [job operation and deployment](docs/PRICE-JOB.md) and [production operations](docs/PRODUCTION.md). Public rates now come from PostgreSQL; `prices.json` is the initial bootstrap/test fixture. Admin Reports use complete tenant-scoped data rather than the first 100 management rows. They distinguish order value, operational invoiced amounts, payments, refunds, return credits and current stock. Full accounting and statutory tax-invoice configuration are not implemented.

## Operations milestone

Orders can now be fulfilled once, creating an internal invoice and converting reserved stock into a shipment. The Invoices screen records received payments, saleable returns and completed refunds. Payments/refunds are records of money moved outside Drinkarto, not payment processing. Receivables and customer credits remain distinct. Tax configuration, partial shipments, damaged returns, accounting exports and full ledger accounting are still outside this milestone.

Price health shows refresh runs, overdue checks and persistent alerts. Shared source publishing requires `PRICE_REVIEWER_USER_IDS`; business ownership alone does not grant it. New imports, changed identities, large price shifts and record losses are quarantined. Successful publication resolves source alerts.

Additional validation: `TEST_BASE_URL=http://localhost:3003 node --import tsx tests/fulfilment.integration.ts` and `node --import tsx tests/price-review.integration.ts`.


## India price directory (23 October 2026)

StateLens lists all 28 states and 8 union territories, with verified-source coverage kept separate from geography and market classifications. Six official snapshots hold 43,937 source records; this is not a promise of every SKU in every state. Kerala records include the source's case and bottle tax columns. Undisclosed manufacturer prices and margins are labelled not published.

[Open the Supabase Table Editor](https://supabase.com/dashboard/project/xjhmwzivqsvxcsaqgbhw/editor) using an authorised project account. `PublicProduct` contains the reference catalogue; `PublicPriceSnapshot` stores each official source's rows as JSON, with URL and check/publication dates. `PriceRefreshRun`, `PriceReview` and `PriceAlert` record operation and review status. Credentials are never included in this link.

See the [33-page LiKAR reference review](docs/INDIA-PRICING-REFERENCE-2026-10-23.md) and [database audit](docs/DATABASE-AUDIT-2026-10-23.md). Third-party effective-tax percentages and broad retail/import labels are not treated as verified government rules. Some government endpoints time out from the GitHub runner even when reachable from India; failed checks preserve the last successful snapshot and remain visible as failures.
