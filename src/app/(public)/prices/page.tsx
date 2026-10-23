import { db } from "@/lib/db";
import StateLens from "@/components/state-lens";
import IndiaPriceAtlas from "@/components/india-price-atlas";
import "@/components/statelens-colour.css";
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
  return (
    <div className="public-container public-page statelens-page">
      <header className="lens-page-heading">
        <div>
          <p className="public-eyebrow">
            2026 INDIA · PRICE, TAX & MARKET REFERENCE
          </p>
          <h1>
            StateLens<span>.</span>
          </h1>
          <p>
            Understand the state’s rules, choose one bottle and size, then
            compare its published final price across states.
          </p>
        </div>
        <span className="lens-coverage-pill">
          {snapshots.length} imported price sources
        </span>
      </header>
      <IndiaPriceAtlas
        coverage={coverage}
        initialState={params.state ?? "Kerala"}
      />
      <div id="bottle-comparison">
        <StateLens
          initialState={params.state ?? ""}
          initialSize={params.size ?? ""}
          initialQuery={params.q ?? ""}
        />
      </div>
    </div>
  );
}
