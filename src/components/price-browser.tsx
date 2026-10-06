'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownUp, ArrowUpRight, Beer, BottleWine, Check, ChevronLeft,
  ChevronRight, CircleHelp, Droplets, Grape, GlassWater, Martini, Search, SlidersHorizontal,
} from 'lucide-react';
import { categories, sources, type PriceRow } from '@/content/public';

type Product = { key: string; name: string; category: string; sizes: Record<string, Record<string, PriceRow[]>> };
type Result = { rows: Product[]; total: number; page: number; pages: number; states: string[]; checked: string };
const MAX_STATES = 4;
const preferredStates = ['Karnataka', 'Kerala', 'Tamil Nadu', 'Assam', 'Odisha', 'Chhattisgarh'];
const categoryIcons: Record<string, typeof Beer> = {
  Whisky: BottleWine, Rum: GlassWater, Vodka: Droplets, Gin: Martini,
  Brandy: BottleWine, Beer, Wine: Grape, Tequila: Grape, Other: CircleHelp,
};
const categoryColours: Record<string, string> = {
  Whisky: '#a36a36', Rum: '#9a5638', Vodka: '#547e92', Gin: '#477968',
  Brandy: '#98613e', Beer: '#b47a28', Wine: '#94475c', Tequila: '#63804c', Other: '#687686',
};
const sizeChoices = (product: Product) => Object.keys(product.sizes).sort((a, b) => Number(a) - Number(b));
const defaultSize = (sizes: string[]) => sizes.includes('750') ? '750' : sizes[0] ?? '';

function Bottle({ category }: { category: string }) {
  const colour = categoryColours[category] ?? '#657487';
  return <span className="comparison-bottle" aria-hidden="true"><svg viewBox="0 0 64 92"><rect width="64" height="92" rx="5" fill="#fff"/><ellipse cx="32" cy="84" rx="16" ry="2.5" fill="#243d3112"/><path d="M26 9h12v19c0 5 9 8 9 15v34c0 3-3 4-15 4s-15-1-15-4V43c0-7 9-10 9-15Z" fill={colour}/><path d="M28 18v15c0 5-7 8-7 14v27" fill="none" stroke="#fff8" strokeWidth="2"/><rect x="26" y="6" width="12" height="11" rx="1" fill="#35473b"/><rect x="20" y="45" width="24" height="21" rx="1" fill="#f8f5ec"/><path d="M24 51h16M24 55h12M24 59h15" stroke="#b8b2a3" strokeWidth="1"/></svg></span>;
}

export default function PriceBrowser({ compact = false, initialState = '', initialSize = '', initialQuery = '' }: { compact?: boolean; initialState?: string; initialSize?: string; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query, category, page: String(page), limit: compact ? '6' : '12' });
        const response = await fetch('/api/public/price-comparison?' + params, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setResult(data);
        setError('');
      } catch (cause) {
        if ((cause as Error).name !== 'AbortError') setError('Price comparisons could not be loaded. Try refreshing the page.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, category, page, compact]);

  useEffect(() => {
    if (!result?.states.length) return;
    setSelectedStates((current) => {
      const stillCovered = current.filter((state) => result.states.includes(state));
      if (stillCovered.length) return stillCovered.slice(0, MAX_STATES);
      const preferred = preferredStates.filter((state) => result.states.includes(state));
      const seed = initialState && result.states.includes(initialState) ? [initialState, ...preferred] : preferred;
      return [...new Set(seed)].slice(0, MAX_STATES);
    });
  }, [result?.states, initialState]);

  const states = useMemo(() => result?.states ?? [], [result?.states]);
  const shownStates = selectedStates.filter((state) => states.includes(state));
  const clear = () => { setQuery(''); setCategory(''); setSelectedSizes({}); setPage(1); };
  const toggleState = (state: string) => setSelectedStates((current) => current.includes(state)
    ? current.filter((item) => item !== state)
    : current.length < MAX_STATES ? [...current, state] : current);

  return <div className={`price-browser price-explorer ${compact ? 'is-compact' : ''}`}>
    {!compact && <div className="category-rail" aria-label="Filter by liquor category">
      <button type="button" className={!category ? 'category-tile active' : 'category-tile'} aria-pressed={!category} onClick={() => { setCategory(''); setPage(1); }}><span className="category-icon all-categories"><SlidersHorizontal size={18}/></span><span>All styles</span></button>
      {categories.map((item) => {
        const Icon = categoryIcons[item] ?? CircleHelp;
        return <button type="button" key={item} className={category === item ? 'category-tile active' : 'category-tile'} aria-pressed={category === item} onClick={() => { setCategory(category === item ? '' : item); setPage(1); }}><span className="category-icon" style={{ '--category-colour': categoryColours[item] } as React.CSSProperties}><Icon size={18}/></span><span>{item}</span></button>;
      })}
    </div>}

    <div className="price-filters comparison-filters">
      <label className="price-search"><span>Find a liquor</span><div><Search size={16}/><input value={query} maxLength={120} placeholder="Search name or brand" onChange={(event) => { setQuery(event.target.value); setPage(1); }}/></div></label>
      {compact && <label><span>Category</span><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>}
      {!compact && (query || category) && <button type="button" className="price-clear-filters" onClick={clear}>Reset filters</button>}
    </div>

    {!compact && <section className="state-picker" aria-labelledby="state-picker-title"><div className="state-picker-heading"><div><span className="public-eyebrow">BUILD YOUR COMPARISON</span><h2 id="state-picker-title">Pick up to {MAX_STATES} states</h2></div><span className="state-count" aria-live="polite">{shownStates.length} of {MAX_STATES} selected</span></div><div className="state-chips">{states.map((state) => <button type="button" key={state} className="state-chip" aria-pressed={shownStates.includes(state)} disabled={!shownStates.includes(state) && shownStates.length >= MAX_STATES} onClick={() => toggleState(state)}>{shownStates.includes(state) && <Check size={13}/>}<span>{state}</span></button>)}</div><p>Only states with imported official price references are selectable. Choose the same bottle size to compare like for like.</p></section>}

    <div className="price-caption" aria-live="polite"><span><SlidersHorizontal size={14}/>{loading ? 'Loading comparisons…' : `${result?.total.toLocaleString('en-IN') ?? 0} liquors · ${states.length} official state sources`}</span><span>Source check {result?.checked ? new Date(result.checked).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : '—'} IST</span></div>
    {error ? <p role="alert" className="public-notice">{error}</p> : !loading && result?.rows.length === 0 ? <div className="public-empty"><h3>No matching official rates.</h3><p>Try a broader name or another category. A missing result does not establish product availability.</p><button className="public-text-button" onClick={clear}>Reset filters</button></div> : <div className="liquor-results" aria-busy={loading}>
      {loading && !result ? <div className="price-loading"><span className="loader-dot"/>Finding official references…</div> : result?.rows.map((product) => {
        const sizes = sizeChoices(product);
        const activeSize = sizes.includes(selectedSizes[product.key]) ? selectedSizes[product.key] : sizes.includes(initialSize) ? initialSize : defaultSize(sizes);
        const statePrices = shownStates.map((state) => ({ state, rows: product.sizes[activeSize]?.[state] ?? [] }));
        const availablePrices = statePrices.flatMap(({ rows }) => rows.map((row) => row.price));
        const lowest = availablePrices.length ? Math.min(...availablePrices) : null;
        const Icon = categoryIcons[product.category] ?? CircleHelp;
        return <article className="liquor-price-card" key={product.key}>
          <div className="liquor-card-heading"><Bottle category={product.category}/><div className="liquor-card-name"><span className="category-label" style={{ '--category-colour': categoryColours[product.category] } as React.CSSProperties}><Icon size={13}/>{product.category}</span><h2>{product.name}</h2><span className="price-size-coverage">Published rates shown only where a matching listing exists</span></div><label className="bottle-size-select"><span>Bottle size</span><select aria-label={`Bottle size for ${product.name}`} value={activeSize} onChange={(event) => setSelectedSizes((current) => ({ ...current, [product.key]: event.target.value }))}>{sizes.map((size) => <option key={size} value={size}>{Number(size).toLocaleString('en-IN')} ml</option>)}</select></label></div>
          {shownStates.length ? <div className="state-price-grid">{statePrices.map(({ state, rows }) => {
            const distinct = [...new Map(rows.map((row) => [`${row.price}|${row.sourceId}|${row.market ?? ''}`, row])).values()];
            return <section className={`state-price-tile ${distinct.some((row) => row.price === lowest) ? 'lowest' : ''} ${distinct.length ? '' : 'missing'}`} key={state} aria-label={`${state} price reference`}><div className="state-price-title"><span>{state}</span>{distinct.some((row) => row.price === lowest) && <span className="lowest-tag">Lowest listed</span>}</div>{distinct.length ? distinct.map((row) => <div className="state-price-entry" key={`${row.id}-${row.price}`}><strong>₹{row.price.toLocaleString('en-IN')}</strong>{availablePrices.length > 1 && row.price > lowest! && <span className="price-delta"><ArrowDownUp size={11}/> ₹{(row.price - lowest!).toLocaleString('en-IN')} above lowest</span>}<small>{row.sizeMl.toLocaleString('en-IN')} ml{row.market ? ` · ${row.market}` : ''}</small>{row.effective && <small>Valid from {new Date(row.effective).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })}{row.effectiveTo ? ` to ${new Date(row.effectiveTo).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })}` : ''}</small>}<a href={row.sourceUrl ?? sources[row.sourceId]?.document ?? '#'} target="_blank" rel="noreferrer">{sources[row.sourceId]?.name.split(' · ')[0] ?? 'Official source'} <ArrowUpRight size={11}/></a></div>) : <p>No matching rate listed</p>}</section>;
          })}</div> : <p className="no-states-hint">Choose at least one state to see its published rate.</p>}
          <div className="liquor-card-foot"><span>{shownStates.filter((state) => product.sizes[activeSize]?.[state]?.length).length} of {shownStates.length} selected states have a matching listing</span><Link href={`/prices?q=${encodeURIComponent(product.name)}&size=${activeSize}`}>Open this comparison ↗</Link></div>
        </article>;
      })}
    </div>}
    {!compact && result && result.rows.length > 0 && <div className="price-pagination"><button aria-label="Previous comparison page" disabled={loading || result.page === 1} onClick={() => setPage(result.page - 1)}><ChevronLeft size={16}/>Previous</button><span>Page {result.page} of {result.pages}</span><button aria-label="Next comparison page" disabled={loading || result.page === result.pages} onClick={() => setPage(result.page + 1)}>Next<ChevronRight size={16}/></button></div>}
    <p className="price-note">Rates are dated snapshots from official sources, not live quotations. A missing state rate is a coverage gap, not a statement of availability. <Link href="/guides/price-sources">Sources & methodology ↗</Link></p>
  </div>;
}
