import { db } from "@/lib/db";
import BottleIndex from "@/components/bottle-index";
import IndiaPriceAtlas from "@/components/india-price-atlas";

export const metadata = {
  title: "2026 India liquor prices, state tax rules and bottle comparisons",
  description:
    "Explore all 28 Indian states and 8 union territories, official 2026 bottle price references, published tax components and clear coverage and prohibition labels.",
};
export const dynamic = "force-dynamic";
export default async function Prices({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [snapshots, runs] = await Promise.all([
    db.publicPriceSnapshot.findMany(),
    db.priceRefreshRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
      select: { authority: true, status: true, startedAt: true },
    }),
  ]);
  const coverage = snapshots.map((snapshot) => {
    const attempt = runs.find((run) => run.authority === snapshot.authority);
    return {
      state: snapshot.state,
      count: Array.isArray(snapshot.rows) ? snapshot.rows.length : 0,
      checkedAt: snapshot.checkedAt.toISOString(),
      attempt: attempt
        ? { status: attempt.status, at: attempt.startedAt.toISOString() }
        : null,
    };
  });
  return <><BottleIndex query={params.q} initialSize={params.size} initialState={params.state}/>
    <details className="public-container market-directory"><summary>State rules, taxes & source coverage</summary><IndiaPriceAtlas coverage={coverage} initialState={params.state ?? "Kerala"}/></details></>;
}
