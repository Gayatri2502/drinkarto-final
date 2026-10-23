'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { Search, BottleWine, Beer, Martini, Grape, Droplets, ArrowUpRight, ArrowRight, Check, ChevronLeft, ChevronRight, Layers3, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { categories, sources } from '@/content/public';
import { compareStateRates, type LensProduct } from '@/lib/state-lens';
import './state-lens.css';

type Result = { rows: LensProduct[]; total: number; page: number; pages: number; states: string[]; checked?: string };
const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const icons: Record<string, typeof Beer> = { Beer, Wine: Grape, Gin: Martini, Vodka: Droplets };
const colours: Record<string, string> = { Whisky: '#a56a29', Rum: '#a65041', Brandy: '#a56a29', Wine: '#985073', Gin: '#257b6b', Vodka: '#477fba', Beer: '#a47b14', Tequila: '#638140' };
const date = (value: string) => new Date(value).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });

export default function StateLens({ initialQuery = '', initialSize = '', initialState = '' }: { initialQuery?: string; initialSize?: string; initialState?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Result | null>(null);
  const [active, setActive] = useState('');
  const [size, setSize] = useState(initialSize);
  const [states, setStates] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    fetch('/api/public/price-comparison?' + new URLSearchParams({ q: search, category, page: String(page), limit: '16' }), { signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error('unavailable'); return response.json() as Promise<Result>; })
      .then(data => {
        setResult(data);
        setActive(current => data.rows.some(row => row.key === current) ? current : data.rows[0]?.key ?? '');
        setStates(current => current === null ? [...new Set([...(initialState && data.states.includes(initialState) ? [initialState] : []), ...data.states])].slice(0, 6) : current.filter(state => data.states.includes(state)));
      })
      .catch(cause => { if (cause.name !== 'AbortError') setError('We couldn’t load the official price records. Please try again.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [search, category, page, retry, initialState]);

  const product = result?.rows.find(row => row.key === active);
  const sizes = product ? Object.keys(product.sizes).sort((a, b) => Number(a) - Number(b)) : [];
  const selectedSize = sizes.includes(size) ? size : sizes.includes('750') ? '750' : sizes[0] ?? '';
  const selectedStates = states ?? [];
  const comparison = product ? compareStateRates(product, selectedSize, selectedStates) : null;
  const Icon = icons[product?.category ?? ''] ?? BottleWine;
  const accent = colours[product?.category ?? ''] ?? '#257b6b';
  const reset = () => { setQuery(''); setSearch(''); setCategory(''); setPage(1); };

  return <section className="lens" aria-label="StateLens price explorer">
    <form className="lens-toolbar" onSubmit={event => { event.preventDefault(); setSearch(query.trim()); setPage(1); }}>
      <label className="lens-search"><Search size={19} aria-hidden="true"/><input aria-label="Search liquor name or brand" maxLength={120} placeholder="Which bottle are you curious about?" value={query} onChange={event => setQuery(event.target.value)}/></label>
      <label className="lens-category"><SlidersHorizontal size={17} aria-hidden="true"/><select aria-label="Liquor category" value={category} onChange={event => { setCategory(event.target.value); setPage(1); }}><option value="">All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
      <button className="lens-search-button" type="submit">Find a bottle <ArrowRight size={17}/></button>
    </form>
    <div className="lens-states"><span><Layers3 size={16}/> Compare states</span><div>{result?.states.map(state => <button key={state} type="button" aria-pressed={selectedStates.includes(state)} disabled={!selectedStates.includes(state) && selectedStates.length >= 6} onClick={() => setStates(current => (current ?? []).includes(state) ? current!.filter(item => item !== state) : [...(current ?? []), state])}>{selectedStates.includes(state) && <Check size={13}/>} {state}</button>)}</div><small>{selectedStates.length} selected · up to 6</small></div>
    {error ? <div role="alert" className="lens-empty"><h2>Let’s try that again.</h2><p>{error}</p><button onClick={() => setRetry(value => value + 1)}><RefreshCw size={16}/> Retry</button></div> : <div className={`lens-workspace ${loading ? 'is-loading' : ''}`} aria-busy={loading}>
      <aside className="lens-library" aria-label="Select a liquor">
        <div className="lens-library-top"><strong>The bottle shelf</strong><span aria-live="polite">{loading ? 'Loading…' : `${result?.total.toLocaleString('en-IN') ?? 0} results`}</span></div>
        <div className="lens-bottle-list">{result?.rows.map(item => {
          const ItemIcon = icons[item.category] ?? BottleWine;
          return <button key={item.key} className="lens-bottle" aria-pressed={active === item.key} onClick={() => setActive(item.key)} style={{ '--bottle-colour': colours[item.category] ?? '#257b6b' } as CSSProperties}><span className="lens-mini-bottle"><ItemIcon size={22}/></span><span><strong>{item.name}</strong><small>{item.category} · {Object.keys(item.sizes).length} sizes</small></span><ChevronRight size={16}/></button>;
        })}{loading && !result && <p className="lens-loading">Finding published references…</p>}{!loading && !result?.rows.length && <div className="lens-empty"><p>No bottles match this search.</p><button onClick={reset}>Clear filters</button></div>}</div>
        {result && result.pages > 1 && <div className="lens-pagination"><button aria-label="Previous bottles" disabled={loading || result.page <= 1} onClick={() => setPage(result.page - 1)}><ChevronLeft size={17}/></button><span>{result.page} / {result.pages}</span><button aria-label="Next bottles" disabled={loading || result.page >= result.pages} onClick={() => setPage(result.page + 1)}><ChevronRight size={17}/></button></div>}
      </aside>
      {product && comparison ? <article className="lens-focus" style={{ '--lens-accent': accent } as CSSProperties} aria-label={`Compare ${product.name}`}>
        <header className="lens-product-heading"><div className="lens-product-icon" aria-hidden="true"><Icon size={40} strokeWidth={1.4}/></div><div><span className="lens-kicker">{product.category} / OFFICIAL PRICE REFERENCES</span><h2>{product.name}</h2><Link href={'/liquor/official?' + new URLSearchParams({ name: product.name, category: product.category })}>Meet this bottle <ArrowUpRight size={14}/></Link></div></header>
        <div className="lens-size-line"><span>Bottle size</span><div aria-label="Choose bottle size">{sizes.map(item => <button key={item} aria-pressed={selectedSize === item} onClick={() => setSize(item)}>{Number(item).toLocaleString('en-IN')} <small>ml</small></button>)}</div></div>
        <div className="lens-insight"><span className="lens-insight-icon"><Layers3 size={20}/></span><div><strong>{comparison.comparable ? comparison.spread === 0 ? 'Same listed price across these states.' : `${money(comparison.spread!)} separates the listed prices.` : comparison.covered === 1 ? 'One state has a matching listing.' : 'No matching rates for this selection.'}</strong><p>{comparison.comparable ? 'Lowest and highest refer only to selected states and this bottle size.' : 'We need rates in at least two selected states to compare. Try another size or bottle.'}</p></div></div>
        <div className="lens-rate-board"><div className="lens-board-heading"><h3>Your state comparison</h3><span>{selectedSize} ml · {comparison.covered}/{selectedStates.length} covered</span></div>
          {comparison.entries.map((entry, index) => {
            const low = comparison.comparable && entry.min === comparison.low;
            const high = comparison.comparable && entry.max === comparison.high && comparison.high !== comparison.low;
            const width = entry.max !== null && comparison.high ? Math.max(4, entry.max / comparison.high * 100) : 0;
            return <section className={`lens-rate ${low ? 'is-low' : high ? 'is-high' : ''} ${entry.min === null ? 'is-missing' : ''}`} key={entry.state}>
              <div className="lens-rate-main"><span className="lens-state-number">{String(index + 1).padStart(2, '0')}</span><div className="lens-state-name"><h4>{entry.state}</h4><span>{low ? comparison.spread === 0 ? 'Equal listed price' : high ? 'Lowest & highest listings' : 'Lowest listed' : high ? 'Highest listed' : entry.min === null ? 'No published match' : 'Published reference'}</span></div><div className="lens-rate-value"><strong>{entry.min === null ? '—' : entry.min === entry.max ? money(entry.min) : `${money(entry.min)}–${money(entry.max!)}`}</strong>{entry.min !== null && comparison.comparable && entry.min > comparison.low! && <small>+{money(entry.min - comparison.low!)} from lowest</small>}</div></div>
              {entry.min !== null && <><div className="lens-price-track" aria-hidden="true"><span style={{ width: `${width}%` }}/></div><details className="lens-provenance"><summary>View {entry.rows.length > 1 ? `${entry.rows.length} source records` : 'source & effective date'}</summary><div>{entry.rows.map((row, rowIndex) => <p key={`${row.id}-${rowIndex}`}><strong>{money(row.price)}</strong>{row.market ? ` · ${row.market}` : ''}<br/>Effective: {row.effective ? date(row.effective) : 'Not supplied'}{row.effectiveTo ? ` – ${date(row.effectiveTo)}` : ''}<br/>Checked: {row.checkedAt ? date(row.checkedAt) : 'Not supplied'}{(row.sourceUrl || sources[row.sourceId]?.document) && <a href={row.sourceUrl || sources[row.sourceId]?.document} target="_blank" rel="noreferrer">Open official document <ArrowUpRight size={13}/></a>}</p>)}</div></details></>}
            </section>;
          })}{!selectedStates.length && <p className="lens-empty">Select a state above to see its published price.</p>}
        </div>
        <footer className="lens-focus-foot"><span>Same normalized name, category & size. Check variant in the source.</span><Link href={`/prices?${new URLSearchParams({ q: product.name, size: selectedSize })}`}>Link to this bottle <ArrowUpRight size={14}/></Link></footer>
      </article> : <div className="lens-focus lens-empty"><BottleWine size={42}/><h2>{loading ? 'Setting up your comparison…' : 'Find your next comparison.'}</h2><p>Search a bottle, choose its size, and explore the published state rates.</p></div>}
    </div>}
    <p className="lens-method">Published snapshots, not live shop quotations. Missing rates mean a coverage gap. <Link href="/guides/price-sources">How we compare prices <ArrowUpRight size={13}/></Link></p>
  </section>;
}
