import "dotenv/config";
import { db } from "../src/lib/db";
import catalogue from "../src/content/catalogue.json";
import baseline from "../src/content/prices.json";
import { categories } from "../src/content/public";
import type { PriceRow } from "../src/content/public";
import { writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";

// Aggregate-only audit. Never print customer records, credentials or connection strings.
const report = await db.$transaction(
  async (tx) => {
    await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    await tx.$executeRawUnsafe("SET LOCAL statement_timeout = '20000'");
    const snapshots = await tx.publicPriceSnapshot.findMany();
    const products = await tx.publicProduct.findMany({
      select: { id: true, name: true, category: true, reference: true },
    });
    const checks = await tx.$queryRawUnsafe<
      { check: string; count: bigint }[]
    >(`
    SELECT 'invalid_inventory' AS check, count(*) FROM "Product" WHERE physical<0 OR reserved<0 OR damaged<0 OR physical<reserved+damaged OR "unitPrice"<=0
    UNION ALL SELECT 'invalid_order_items', count(*) FROM "OrderItem" WHERE quantity<=0 OR returned<0 OR returned>quantity OR "unitPrice"<=0
    UNION ALL SELECT 'order_total_mismatch', count(*) FROM "Order" o WHERE abs(o.total-coalesce((SELECT sum(i.quantity*i."unitPrice") FROM "OrderItem" i WHERE i."organizationId"=o."organizationId" AND i."orderId"=o.id),0))>0.01
    UNION ALL SELECT 'invalid_invoice_balances',count(*) FROM "Invoice" WHERE total<0 OR paid<0 OR credited<0 OR refunded<0 OR credited>total OR refunded>paid
    UNION ALL SELECT 'invalid_review_ratings',count(*) FROM "CommunityReview" WHERE rating NOT BETWEEN 1 AND 5
    UNION ALL SELECT 'points_without_approved_review',count(*) FROM "CommunityPoint" p JOIN "CommunityReview" r ON r.id=p."reviewId" WHERE r.status<>'APPROVED' OR p."userId"<>r."userId" OR p.points<=0
    UNION ALL SELECT 'sessions_without_membership',count(*) FROM "Session" s WHERE NOT EXISTS (SELECT 1 FROM "Member" m WHERE m."userId"=s."userId" AND m."organizationId"=s."organizationId")
  `);
    const tables = await tx.$queryRawUnsafe<{ table: string; rows: bigint }[]>(
      `SELECT 'organizations' AS "table",count(*) AS rows FROM "Organization" UNION ALL SELECT 'users',count(*) FROM "User" UNION ALL SELECT 'erp_products',count(*) FROM "Product" UNION ALL SELECT 'orders',count(*) FROM "Order" UNION ALL SELECT 'retailers',count(*) FROM "Retailer" UNION ALL SELECT 'invoices',count(*) FROM "Invoice" UNION ALL SELECT 'reviews',count(*) FROM "CommunityReview"`,
    );
    const security = await tx.$queryRawUnsafe<
      { table: string; rls: boolean }[]
    >(
      `SELECT relname AS "table",relrowsecurity AS rls FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relname<>'_prisma_migrations' ORDER BY relname`,
    );
    const constraints = await tx.$queryRawUnsafe<{ invalid: bigint }[]>(
      `SELECT count(*) AS invalid FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public' AND NOT convalidated`,
    );
    const runs = await tx.priceRefreshRun.groupBy({
      by: ["authority", "status"],
      _count: { _all: true },
    });
    const baselineIds = new Set(catalogue.map((p) => p.id));
    const actualIds = new Set(products.map((p) => p.id));
    const sourceReports = snapshots.map((snapshot) => {
      const rows = Array.isArray(snapshot.rows)
        ? (snapshot.rows as unknown as PriceRow[])
        : [];
      const ids = new Set<string>();
      let duplicateIds = 0;
      let invalid = 0;
      let mismatch = 0;
      let missingIdentity = 0;
      for (const row of rows) {
        if (ids.has(row.id)) duplicateIds++;
        ids.add(row.id);
        if (
          !row.id ||
          !row.name?.trim() ||
          !Number.isFinite(row.price) ||
          row.price <= 0 ||
          !Number.isFinite(row.sizeMl) ||
          row.sizeMl <= 0 ||
          !categories.includes(row.category)
        )
          invalid++;
        if (row.state !== snapshot.state || row.sourceId !== snapshot.authority)
          mismatch++;
        if (!row.sourceCode) missingIdentity++;
      }
      const local = baseline.filter(
        (row) => row.sourceId === snapshot.authority,
      );
      const stored = new Map(rows.map((row) => [row.id, row]));
      return {
        state: snapshot.state,
        authority: snapshot.authority,
        rows: rows.length,
        baselineRows: local.length,
        missingBaselineRows: local.filter((row) => !stored.has(row.id)).length,
        priceDifferencesFromBaseline: local.filter(
          (row) =>
            stored.has(row.id) && stored.get(row.id)!.price !== row.price,
        ).length,
        duplicateIds,
        invalidRows: invalid,
        sourceStateMismatches: mismatch,
        missingSourceCodes: missingIdentity,
        checkedAt: snapshot.checkedAt.toISOString(),
        stale: Date.now() - snapshot.checkedAt.getTime() > 6 * 3600000,
        hasSourceUrl: /^https:\/\//.test(snapshot.sourceUrl),
      };
    });
    return {
      auditedAt: new Date().toISOString(),
      catalogue: {
        stored: products.length,
        baseline: catalogue.length,
        missingBaselineIds: catalogue.filter((p) => !actualIds.has(p.id))
          .length,
        additionalIds: products.filter((p) => !baselineIds.has(p.id)).length,
        emptyNames: products.filter((p) => !p.name.trim()).length,
        invalidCategories: products.filter(
          (p) => ![...categories, "Non-alcoholic"].includes(p.category),
        ).length,
        categoryCounts: Object.fromEntries(
          [...new Set(products.map((p) => p.category))].map((category) => [
            category,
            products.filter((p) => p.category === category).length,
          ]),
        ),
        referenceMismatches: catalogue.filter((p) => {
          const found = products.find((row) => row.id === p.id);
          return found && !isDeepStrictEqual(found.reference, p);
        }).length,
        baselineIdentityMismatches: catalogue.filter((p) => {
          const found = products.find((row) => row.id === p.id);
          return (
            found && (found.name !== p.name || found.category !== p.category)
          );
        }).length,
      },
      sources: sourceReports,
      operationalChecks: checks.map((row) => ({
        check: row.check,
        count: Number(row.count),
      })),
      tableCounts: tables.map((row) => ({
        table: row.table,
        rows: Number(row.rows),
      })),
      rowLevelSecurity: security,
      unvalidatedConstraints: Number(constraints[0].invalid),
      refreshRuns: runs,
    };
  },
  { timeout: 60000 },
);
await writeFile(
  `docs/DATABASE-AUDIT-${new Date().toISOString().slice(0,10)}.json`,
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
await db.$disconnect();
