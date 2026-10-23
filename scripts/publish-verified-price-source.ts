/** Explicit maintenance review path. Never used by the unattended daily job. */
import "dotenv/config";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { db } from "../src/lib/db";
import { validateSnapshot } from "../src/lib/price-validation";
import { publishSnapshot } from "../src/lib/price-review";
import type { PriceRow } from "../src/content/public";
const args = process.argv.slice(2);
const argument = (name: string) => args[args.indexOf(name) + 1];
for (const required of ["--file", "--authority", "--review-note"])
  if (!args.includes(required))
    throw new Error(`Explicit ${required} is required`);
const authority = argument("--authority");
const note = argument("--review-note");
if (!note || note.length < 40)
  throw new Error("A concrete source review note is required");
const data = validateSnapshot(
  JSON.parse(await readFile(argument("--file"), "utf8")),
  authority,
  0,
);
const prior = await db.publicPriceSnapshot.findUnique({ where: { authority } });
await mkdir("/tmp/drinkarto-price-backups", { recursive: true });
await writeFile(
  `/tmp/drinkarto-price-backups/${authority}-${Date.now()}.json`,
  JSON.stringify(prior),
);
const result = await db.$transaction(
  async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(731205)`;
    const current = await tx.publicPriceSnapshot.findUnique({
      where: { authority },
    });
    if (
      (current?.checkedAt.toISOString() ?? null) !==
      (prior?.checkedAt.toISOString() ?? null)
    )
      throw new Error("Source changed while preparing review");
    const review = await tx.priceReview.create({
      data: {
        authority,
        status: "APPROVED",
        reviewedBy: "maintenance:agent-source-verification",
        reviewedAt: new Date(),
        reason: note,
        payload: {
          snapshot: data,
          baseCheckedAt: current?.checkedAt.toISOString() ?? null,
        },
      },
    });
    const published = await publishSnapshot(
      tx,
      authority,
      data,
      (current?.rows ?? []) as unknown as PriceRow[],
    );
    await tx.priceReview.updateMany({
      where: { authority, status: "PENDING" },
      data: { status: "SUPERSEDED" },
    });
    await tx.priceRefreshRun.create({
      data: {
        authority,
        status: "SUCCEEDED",
        count: data.rows.length,
        changed: published.changed,
        finishedAt: published.checkedAt,
        message: `Explicit maintenance source review ${review.id}; ${note}`,
      },
    });
    return {
      authority,
      count: data.rows.length,
      changed: published.changed,
      checkedAt: published.checkedAt,
      reviewId: review.id,
    };
  },
  { timeout: 60000 },
);
console.log(JSON.stringify(result));
await db.$disconnect();
