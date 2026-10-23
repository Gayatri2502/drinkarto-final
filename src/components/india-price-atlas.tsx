"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  MapPinned,
  Clock3,
  ShieldCheck,
  Search,
} from "lucide-react";
import {
  indiaMarkets,
  marketLabels,
  marketFor,
  taxExplanation,
  generalPriceUnavailable,
} from "@/content/india-markets";
import "./india-price-atlas.css";
export type SourceCoverage = {
  state: string;
  count: number;
  checkedAt: string;
  attempt?: { status: string; at: string } | null;
};
const date = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
export default function IndiaPriceAtlas({
  coverage,
  initialState = "Kerala",
}: {
  coverage: SourceCoverage[];
  initialState?: string;
}) {
  const [selected, setSelected] = useState(
    marketFor(initialState) ? initialState : "Kerala",
  );
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const market = marketFor(selected)!;
  const source = coverage.find((item) => item.state === selected);
  const guide = taxExplanation(selected);
  const visible = indiaMarkets.filter(
    (item) =>
      (!query || item.name.toLowerCase().includes(query.toLowerCase())) &&
      (filter === "all" ||
        (filter === "prices" &&
          coverage.some((row) => row.state === item.name)) ||
        filter === item.model),
  );
  const fresh = coverage.filter(
    (item) => Date.now() - new Date(item.checkedAt).getTime() < 36 * 3600000,
  ).length;
  return (
    <section
      className="india-atlas"
      aria-label="2026 India liquor price coverage"
    >
      <div className="atlas-heading">
        <div>
          <span className="atlas-eyebrow">2026 · NATIONAL PRICE DIRECTORY</span>
          <h2>One country. Different price rules.</h2>
          <p>
            28 states and 8 union territories. Price coverage, market rules and
            tax disclosure are separate facts.
          </p>
        </div>
        <div className="atlas-stat">
          <strong>
            {coverage.length}
            <small> / 36</small>
          </strong>
          <span>jurisdictions with imported prices</span>
        </div>
      </div>
      <div className="atlas-update">
        <Clock3 size={15} />
        <span>
          Daily source check scheduled for <strong>05:30 IST</strong>. {fresh}{" "}
          sources checked within 36 hours. Rates change only when an official
          publication changes.
        </span>
      </div>
      <label className="atlas-state-label">
        <MapPinned size={18} />
        <span>Explore a state / union territory</span>
        <select
          value={selected}
          aria-label="Explore state pricing rules"
          onChange={(event) => setSelected(event.target.value)}
        >
          {indiaMarkets.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
      </label>
      <article className="atlas-profile">
        <div className="atlas-profile-title">
          <div>
            <small>{market.kind}</small>
            <h3>{market.name}</h3>
          </div>
          <span className={`atlas-badge ${market.model}`}>
            {marketLabels[market.model]}
          </span>
        </div>
        <p>{market.note}</p>
        <div className="atlas-availability">
          <ShieldCheck size={16} />
          <div>
            <strong>
              {generalPriceUnavailable(selected)
                ? "General liquor prices unavailable"
                : source
                  ? `${source.count.toLocaleString("en-IN")} published bottle references`
                  : "Price list not yet verified / imported"}
            </strong>
            <span>
              {source
                ? `Last successful source check: ${date(source.checkedAt)} IST`
                : "No bottle prices are inferred from another state."}
              {source?.attempt
                ? ` · Latest attempt: ${source.attempt.status.replaceAll("_", " ")} (${date(source.attempt.at)} IST)`
                : ""}
            </span>
          </div>
        </div>
        <details className="atlas-tax" key={selected}>
          <summary>How {market.name} prices are formed</summary>
          <span className="atlas-tax-status">{guide.status}</span>
          <p className="atlas-formula">{guide.formula}</p>
          <p>{guide.detail}</p>
          <div className="atlas-inputs">
            {[
              "Supplier / manufacturer price",
              "Excise duty & applicable fees",
              "VAT / sales-tax base",
              "Corporation / wholesale margin",
              "Retail margin",
              "Published bottle MRP",
            ].map((label, index) => (
              <span key={label}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                {label}
              </span>
            ))}
          </div>
          <p className="atlas-small">
            These are disclosure headings, not a universal addition formula.
            Rates, taxable bases, category rules, rounding and inclusion order
            require the applicable notification. Not published ≠ zero.
          </p>
        </details>
        <div className="atlas-links">
          <a href={market.source} target="_blank" rel="noreferrer">
            {market.authority}
            <ArrowUpRight size={14} />
          </a>
          {market.policySource && (
            <a href={market.policySource} target="_blank" rel="noreferrer">
              Policy / source document
              <ArrowUpRight size={14} />
            </a>
          )}
          <Link
            href={
              "/prices?" +
              new URLSearchParams({ state: selected }) +
              "#bottle-comparison"
            }
          >
            Compare a bottle in {selected}
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <details className="atlas-import">
          <summary>Import & wholesale permissions</summary>
          <p>
            {market.importNote ??
              "Drinkarto has not verified a current 2026 import/wholesale eligibility assessment for this jurisdiction. Consult the linked excise authority for the licence class, brand/label registration, import permit, transport pass and duty requirements. A market category is not a licence approval or an “easy import” ranking."}
          </p>
        </details>
      </article>
      <details className="atlas-directory">
        <summary>All 36 jurisdictions · market & price coverage</summary>
        <div className="atlas-directory-filters">
          <label>
            <Search size={16} />
            <input
              value={query}
              maxLength={80}
              placeholder="Find a state"
              aria-label="Search state directory"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            aria-label="Filter market model"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">All market categories</option>
            <option value="prices">Imported prices</option>
            {Object.entries(marketLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="atlas-state-grid">
          {visible.map((item) => {
            const data = coverage.find((row) => row.state === item.name);
            return (
              <button
                type="button"
                key={item.name}
                onClick={() => setSelected(item.name)}
                aria-pressed={selected === item.name}
              >
                <strong>{item.name}</strong>
                <span>{marketLabels[item.model]}</span>
                <small>
                  {generalPriceUnavailable(item.name)
                    ? "General prices unavailable"
                    : data
                      ? `${data.count.toLocaleString("en-IN")} references`
                      : "No verified prices imported"}
                </small>
              </button>
            );
          })}
        </div>
        {!visible.length && <p>No matching jurisdictions.</p>}
      </details>
    </section>
  );
}
