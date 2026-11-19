"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BottleWine, X, ReceiptText, GitCompareArrows, Utensils, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { featuredBottles } from "@/content/featured-bottles";
import { indiaMarkets, generalPriceUnavailable } from "@/content/india-markets";
import { categories, profiles, sources } from "@/content/public";
import { foodPairings } from "@/content/pairings";
import { compareStateRates, type LensProduct } from "@/lib/state-lens";
import Comparison from "./comparison";
import DiscoveryExplorer from "./discovery-explorer";
import LocalPour from "./local-pour";
import PriceBuildUp from "./price-buildup";
import "@/app/layout-preview/preview.css";
import "./bottle-index.css";

type Result = { rows: LensProduct[]; page: number; pages: number; total: number };
const money = (n: number) => n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const sizesOf = (product: LensProduct) => Object.keys(product.sizes).sort((a,b) => +a - +b);
const profileFor = (category: string) => profiles.find((item) => item.name === category);
const nameKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
const links = [["Bottle Index", "/prices"], ["Library", "/catalogue"], ["Knowledge", "/guides"], ["Recipes", "/recipes"]];

export default function BottleIndex({ query = "", initialSize = "", initialState = "", showMenu = false }: {query?: string; initialSize?: string; initialState?: string; showMenu?: boolean}) {
  const [filters, setFilters] = useState(() => new URLSearchParams(query ? {q:query} : {}).toString());
  const [typed, setTyped] = useState(query);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [occasion, setOccasion] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Result>();
  const [status, setStatus] = useState("Loading published bottle records…");
  const [active, setActive] = useState("");
  const [size, setSize] = useState(initialSize);
  const [state, setState] = useState(initialState);
  const [sort, setSort] = useState("low");
  const [panel, setPanel] = useState("prices");
  const [otherQuery, setOtherQuery] = useState("");
  const [otherSearch, setOtherSearch] = useState("");
  const [others, setOthers] = useState<LensProduct[]>([]);
  const [otherStatus, setOtherStatus] = useState("");
  const [otherKey, setOtherKey] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), 20000);
    const params = new URLSearchParams(filters);
    params.set("page", String(page));
    params.set("limit", "16");
    fetch("/api/public/price-comparison?" + params, {signal: controller.signal})
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<Result>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult(data);
        setStatus(data.rows.length ? "" : "No published bottles match these filters.");
      })
      .catch(() => {
        if (controller.signal.reason !== "cleanup") setStatus("Published prices couldn’t be loaded. Please retry.");
      });
    return () => { clearTimeout(timeout); controller.abort("cleanup"); };
  }, [filters, page, retry]);

  useEffect(() => {
    if (!otherSearch) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), 20000);
    fetch("/api/public/price-comparison?" + new URLSearchParams({q:otherSearch, limit:"25"}), {signal:controller.signal})
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<Result>;
      })
      .then(({ rows }) => { setOthers(rows); setOtherStatus(rows.length ? "" : "No matching bottles."); })
      .catch(() => { if (controller.signal.reason !== "cleanup") setOtherStatus("Bottle search couldn’t load. Try again."); });
    return () => { clearTimeout(timeout); controller.abort("cleanup"); };
  }, [otherSearch, retry]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch("/api/public/price-comparison?" + new URLSearchParams({q:typed,limit:"20"}), {signal:controller.signal})
        .then(response => response.ok ? response.json() : Promise.reject())
        .then((data: Result) => setSuggestions([...new Set(data.rows.map(row => row.name))]))
        .catch(() => { if (!controller.signal.aborted) setSuggestions([]); });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [typed]);

  useEffect(() => { if (new URLSearchParams(window.location.search).get("nearby") === "1" || new URLSearchParams(window.location.search).get("compare") === "1") { setPanel(new URLSearchParams(window.location.search).get("compare") === "1" ? "compare" : "nearby"); dialog.current?.showModal(); } }, []);

  const product = result?.rows.find((row) => row.key === active) ?? result?.rows.find((row) => nameKey(row.name) === nameKey("Hendrick’s Gin")) ?? result?.rows[0];
  const other = others.find((row) => row.key === otherKey && row.key !== product?.key);
  const sizes = product ? sizesOf(product) : [];
  const selectedSize = sizes.includes(size) ? size : sizes.includes("750") ? "750" : sizes[0];
  const marketRows = product ? compareStateRates(product, selectedSize, indiaMarkets.map((market) => market.name)) : null;
  const priced = marketRows?.entries.filter((entry) => entry.min !== null).sort((a,b) => sort === "low" ? a.min! - b.min! : b.max! - a.max!) ?? [];
  const selectedState = state || priced[0]?.state || "";
  const records = product?.sizes[selectedSize]?.[selectedState] ?? [];
  const photo = featuredBottles.find((item) => nameKey(item.title) === nameKey(product?.name ?? ""));
  const profile = profileFor(product?.category ?? "");
  const open = (name: string) => { setPanel(name); dialog.current?.showModal(); };

  return <section className="study bottle-index" aria-label="Bottle price explorer">
    {showMenu && <nav className="bottle-nav" aria-label="Drinkarto navigation">{links.map(([label,href]) => <Link key={href} href={href}>{label}</Link>)}</nav>}
    <div className="bottle-intro"><p>Find a bottle and see how its published price changes across India.</p></div>
    <form className="bottle-filters" onSubmit={(event) => {
      event.preventDefault();
      const params = new URLSearchParams();
      for (const [key, value] of new FormData(event.currentTarget)) {
        if (typeof value === "string" && value.trim()) params.set(key, value.trim());
      }
      setStatus("Loading published bottle records…");
      setResult(undefined);
      setActive("");
      setPage(1);
      setFilters(params.toString());
      setRetry((n) => n + 1);
    }}>
      <label>Bottle name<input name="q" type="search" maxLength={120} value={typed} onChange={event => setTyped(event.target.value)} list="bottle-suggestions" placeholder="Search bottles"/></label>
      <datalist id="bottle-suggestions">{suggestions.map(name => <option key={name} value={name}/>)}</datalist>
      <label>Occasion<select name="occasion" value={occasion} onChange={event => setOccasion(event.target.value)}><option value="">Any occasion</option><option>Dinner gathering</option><option>Cocktail evening</option><option>Casual get-together</option></select></label>
      <label>Category<select name="category"><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Size in ml<input name="size" type="number" min="1" step="1" defaultValue={initialSize}/></label>
      <label>Min price ₹<input name="min" type="number" min="0" step="0.01"/></label>
      <label>Max price ₹<input name="max" type="number" min="0" step="0.01"/></label>
      <button>Search</button>
    </form>
    {status && <p role="status">{status} {status.includes("couldn’t") && <button onClick={() => { setStatus("Loading published bottle records…"); setRetry((n) => n + 1); }}>Retry</button>}</p>}
    {product && <div className="study-sample">
      <div className="bottle-results">
        {result && result.pages > 1 && <div><button disabled={result.page <= 1} onClick={() => setPage(result.page - 1)}>Previous</button> {result.page} / {result.pages} <button disabled={result.page >= result.pages} onClick={() => setPage(result.page + 1)}>Next</button></div>}
      </div>
      <div className="study-sheet">
        
        <div className="study-hero">
          <div className="study-field" aria-hidden="true"/>
          <div className="study-copy"><h2>{product.name}</h2><p>{product.name} · {profile ? profile.notes.slice(0,2).join(" meets ").toLowerCase() + " in the " + product.category.toLowerCase() + " family." : "Explore its category, sizes and state price references."}</p></div>
          <div className="study-asset">{photo ? <Image src={photo.image} alt={photo.alt} fill sizes="(max-width:680px) 70vw, 470px"/> : <BottleWine className="bottle-placeholder" aria-hidden="true"/>}</div>
          <div className="study-inset"><strong>{product.category}</strong><span className="bottle-occasion">{product.category === "Wine" || product.category === "Beer" ? "Dinner gathering" : "Cocktail evening"}</span><span>Published sizes · {sizes.join(", ")} ml</span><span>{profile ? `Typical ${product.category.toLowerCase()} notes · ${profile.notes.join(", ")}` : "Bottle-specific tasting notes unavailable."}</span></div>

        </div>
        <div className="bottle-alternatives" aria-label="Other bottles in this category">{result?.rows.filter(row => row.category === product.category && row.key !== product.key).slice(0,3).map(row => {const image = featuredBottles.find(item => nameKey(item.title) === nameKey(row.name));return <button key={row.key} onClick={() => setActive(row.key)}>{image ? <Image src={image.image} alt="" width={28} height={42}/> : <BottleWine size={24}/>}<small>{row.name}</small></button>;})}</div>
        <button className="bottle-glass" onClick={() => open("prices")}><span>View prices across states</span><strong>{marketRows?.low != null ? `From ${money(marketRows.low)} · ${selectedSize} ml` : "No published price"}</strong><ArrowUpRight size={18}/></button>
        <div className="study-tools">{[["build","Price breakdown"],["compare","Compare"],["pair","Pairings"],["nearby","Nearby"]].map(([key,label],i) => <button key={key} onClick={() => open(key)}>{key === "build" ? <ReceiptText size={18}/> : key === "compare" ? <GitCompareArrows size={18}/> : key === "pair" ? <Utensils size={18}/> : <MapPin size={18}/>}<strong>{label}</strong><ArrowUpRight size={15}/></button>)}</div>
      </div>
    </div>}
    {photo && <details className="bottle-attribution"><summary>Image attribution</summary><p>{photo.credit.author} · <a href={photo.credit.source}>Original image</a> · <a href={photo.credit.licenseUrl}>{photo.credit.license}</a></p></details>}
    <dialog ref={dialog} className="bottle-dialog" aria-labelledby="bottle-dialog-title">
      {product && <>
        <div className="bottle-dialog-head"><h2 id="bottle-dialog-title">{{prices:"Prices by state",build:"How the price is calculated",compare:"Compare bottles",pair:"Recipes & pairings",nearby:"Explore nearby"}[panel]}</h2><button aria-label="Close" onClick={() => dialog.current?.close()}><X size={20}/></button></div>
        <p>{product.name}</p>
        {(panel === "prices" || panel === "build") && <div className="bottle-controls">
          <label>Bottle size<select value={selectedSize} onChange={(event) => setSize(event.target.value)}>{sizes.map((item) => <option key={item} value={item}>{item} ml</option>)}</select></label>
          {panel === "prices" ? <label>Sort states<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="low">Cheapest first</option><option value="high">Most expensive first</option></select></label> :
            <label>State or territory<select value={selectedState} onChange={(event) => setState(event.target.value)}>{!selectedState && <option value="">Select a state</option>}{indiaMarkets.map((market) => <option key={market.name}>{market.name}</option>)}</select></label>}
        </div>}
        {panel === "prices" && <>
          <p>Sorted by {sort === "low" ? "each state’s lowest" : "each state’s highest"} published price for this size.</p>
          <ul className="bottle-rates">{priced.map(({state:region,min,max}) => <li key={region}><button onClick={() => { setState(region); setPanel("build"); }}><span>{region}<small>{marketRows?.comparable && [min === marketRows.low ? "Lowest" : "", max === marketRows.high ? "Highest" : ""].filter(Boolean).join(" · ")}</small></span><strong>{money(min!)}{max !== min ? `–${money(max!)}` : ""}</strong><ArrowUpRight size={16}/></button></li>)}</ul>
          <details><summary>States and territories without a price for this size</summary><ul>{marketRows?.entries.filter((entry) => entry.min === null).map((entry) => <li key={entry.state}>{entry.state} · {generalPriceUnavailable(entry.state) ? "General retail restricted" : "No matching published price"}</li>)}</ul></details>
        </>}
        {panel === "build" && (records.length ? records.map((row) => <article className="bottle-source" key={row.id}><strong>{money(row.price)} · {row.market ?? row.state}</strong><p><a href={row.sourceUrl ?? sources[row.sourceId].url} target="_blank" rel="noreferrer">Official price source ↗</a>{row.effective && ` · Effective ${row.effective}`}</p><PriceBuildUp row={row}/></article>) : <p>No published price for this bottle and size in {selectedState || "the selected state"}.</p>)}
        {panel === "compare" && <><details><summary>Compare flavour, body and production styles</summary><Comparison/></details>
          <form className="bottle-controls" onSubmit={(event) => { event.preventDefault(); if (!otherQuery.trim()) return; setOtherStatus("Searching…"); setOthers([]); setOtherKey(""); setOtherSearch(otherQuery.trim()); setRetry((n) => n + 1); }}>
            <label>Find the second bottle<input value={otherQuery} maxLength={120} onChange={(event) => setOtherQuery(event.target.value)} required type="search"/></label><button>Find</button>
          </form>
          {otherStatus && <p role="status">{otherStatus}</p>}
          {others.length > 0 && <label>Second bottle<select value={otherKey} onChange={(event) => setOtherKey(event.target.value)}><option value="">Choose a bottle</option>{others.filter((row) => row.key !== product.key).map((row) => <option key={row.key} value={row.key}>{row.name}</option>)}</select></label>}
          {other && <div className="bottle-compare">{[product,other].map((row) => {
            const prices = compareStateRates(row, selectedSize, indiaMarkets.map((market) => market.name));
            return <article key={row.key}><h3>{row.name}</h3><p>{row.category} · {sizesOf(row).join(", ")} ml</p><p>{profileFor(row.category)?.notes.join(", ") ?? "No category tasting notes"}</p><p>{selectedSize} ml · {prices.low != null ? `${money(prices.low)}–${money(prices.high!)} across ${prices.covered} state(s)` : "No published price at this size"}</p></article>;
          })}</div>}
        </>}
        {panel === "nearby" && <><p>Explore venues around your destination. Confirm this bottle’s stock directly with the venue.</p><DiscoveryExplorer/><details><summary>City budgets & discovery links</summary><LocalPour/></details></>}
        {panel === "pair" && <><p>Pairing ideas for the {product.category.toLowerCase()} category.</p><ul className="bottle-pairings">{foodPairings(product.category).map((item) => <li key={item.name}><strong>{item.name}</strong><p>{item.description}</p></li>)}</ul><Link href="/recipes">Browse cocktail recipes ↗</Link></>}
      </>}
    </dialog>
  </section>;
}
