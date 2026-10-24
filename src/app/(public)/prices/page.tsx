import { db } from "@/lib/db";
import StateLens from "@/components/state-lens";
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
  return (
    <div className="public-container public-page statelens-page">
      <header className="lens-page-heading">
        <div>
          <p className="public-eyebrow">THE PRICE DESK / INDIA 2026</p>
          <h1>
            StateLens<span>.</span>
          </h1>
          <p>
            One bottle. One size. A clear view of its published price across
            states.
          </p>
        </div>
        <span className="lens-coverage-pill">
          {snapshots.length} imported price sources
        </span>
      </header>
      <div id="bottle-comparison">
        <StateLens
          initialState={params.state ?? ""}
          initialSize={params.size ?? ""}
          initialQuery={params.q ?? ""}
        />
      </div>
      <details className="market-directory">
        <summary>
          <span>
            <span className="public-eyebrow">THE BIGGER PICTURE</span>
            <strong>State rules, taxes & source coverage</strong>
          </span>
          <span className="directory-summary-note">
            28 states · 8 union territories <span aria-hidden="true">＋</span>
          </span>
        </summary>
        <p className="directory-intro">
          Explore market rules separately from the bottle comparison. A listed
          jurisdiction does not mean a verified price is available.
        </p>
        <IndiaPriceAtlas
          coverage={coverage}
          initialState={params.state ?? "Kerala"}
        />
      </details>
    </div>
  );
}
