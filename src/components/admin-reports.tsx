'use client';

import { useEffect, useMemo, useState } from 'react';

type Point = { label: string; value: number; units?: number };
type Series = { name: string; values: number[]; color: string };
type ChartMode = 'line' | 'area' | 'column' | 'bar' | 'stacked' | 'donut';
type ReportData = {
  asOf: string;
  definition: string;
  financial: { invoiced: number; collections: number; refunds: number; credits: number };
  financialTrend: { label: string; invoiced: number; collections: number; credits: number }[];
  summary: { orderValue: number; orders: number; fulfilledOrders: number; openOrders: number; pendingApproval: number; physical: number; available: number; reserved: number; damaged: number; inventorySellingValue: number; outstanding: number; lowStockCount: number };
  trend: { label: string; value: number; count: number }[];
  statuses: Point[];
  categories: { label: string; physical: number; available: number; reserved: number; damaged: number }[];
  brands: Point[];
  topProducts: Point[];
  topRetailers: Point[];
  lowStock: { label: string; sku: string; available: number; threshold: number }[];
  movements: Point[];
  credit: { label: string; value: number; limit: number }[];
};

const money = (value: number) => '₹' + Math.round(value).toLocaleString('en-IN');
const number = (value: number) => Math.round(value).toLocaleString('en-IN');
const palette = ['#315e58', '#c38b4d', '#637db0', '#a86672', '#6b8f72'];

function ChartCard({
  title,
  note,
  labels,
  series,
  modes,
  initialMode,
  format = number,
}: {
  title: string;
  note: string;
  labels: string[];
  series: Series[];
  modes: ChartMode[];
  initialMode: ChartMode;
  format?: (value: number) => string;
}) {
  const [mode, setMode] = useState<ChartMode>(initialMode);
  const values = series.flatMap((item) => item.values);
  const maximum = Math.max(1, ...(mode === 'stacked' ? labels.map((_, index) => series.reduce((sum, item) => sum + (item.values[index] ?? 0), 0)) : values));
  const anyValue = values.some((value) => value > 0);
  const plot = { left: 52, right: 704, top: 18, bottom: 218 };
  const width = plot.right - plot.left;
  const height = plot.bottom - plot.top;
  const xAt = (index: number) => plot.left + (labels.length <= 1 ? width / 2 : (index / (labels.length - 1)) * width);
  const yAt = (value: number) => plot.bottom - (value / maximum) * height;
  const shownLabels = labels.length > 7 ? labels.filter((_, i) => i === 0 || i === labels.length - 1 || i % Math.ceil(labels.length / 6) === 0) : labels;
  const categories = labels.map((label, index) => ({ label, values: series.map((s) => s.values[index] ?? 0) }));
  const ranked = categories.slice(0, 10);

  return (
    <article className="report-chart ceo-chart-card">
      <div className="ceo-chart-heading">
        <div><p className="ceo-chart-kicker">PERFORMANCE</p><h3>{title}</h3><p>{note}</p></div>
        <label className="chart-mode-label">View as<select value={mode} onChange={(event) => setMode(event.target.value as ChartMode)} aria-label={`${title} chart type`}>
          {modes.map((item) => <option key={item} value={item}>{({ line: 'Line', area: 'Area', column: 'Columns', bar: 'Bars', stacked: 'Stacked bars', donut: 'Donut' } as Record<ChartMode, string>)[item]}</option>)}
        </select></label>
      </div>
      {!anyValue ? <p className="report-empty">No activity in this period.</p> : <div className="ceo-chart-plot">
        {(mode === 'line' || mode === 'area') && <svg viewBox="0 0 720 260" role="img" aria-label={`${title}, ${mode} chart`}>
          {[0, 1, 2, 3].map((tick) => { const y = plot.top + tick * height / 3; return <g key={tick}><line x1={plot.left} x2={plot.right} y1={y} y2={y} className="chart-grid-line"/><text x={plot.left - 8} y={y + 4} textAnchor="end" className="chart-axis-label">{format(maximum * (1 - tick / 3))}</text></g>; })}
          {series.map((item, seriesIndex) => {
            const points = item.values.map((value, i) => [xAt(i), yAt(value)] as const);
            const d = points.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
            const area = `${d} L ${xAt(Math.max(0, points.length - 1))} ${plot.bottom} L ${xAt(0)} ${plot.bottom} Z`;
            return <g key={item.name}>{mode === 'area' && <path d={area} fill={item.color} opacity={seriesIndex === 0 ? '.13' : '.08'}/>}<path d={d} fill="none" stroke={item.color} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round"/>{points.map(([x, y], i) => ({ x, y, i })).filter(({ i }) => labels.length < 45 || i % Math.ceil(labels.length / 12) === 0).map(({ x, y, i }) => <circle key={i} cx={x} cy={y} r="3.5" fill={item.color}><title>{labels[i]} · {item.name}: {format(item.values[i] ?? 0)}</title></circle>)}</g>;
          })}
          {shownLabels.map((label) => { const index = labels.indexOf(label); return <text key={label + index} x={xAt(index)} y="245" textAnchor="middle" className="chart-axis-label">{label}</text>; })}
        </svg>}
        {(mode === 'column' || mode === 'stacked') && <svg viewBox="0 0 720 260" role="img" aria-label={`${title}, ${mode} chart`}>
          {[0, 1, 2, 3].map((tick) => { const y = plot.top + tick * height / 3; return <g key={tick}><line x1={plot.left} x2={plot.right} y1={y} y2={y} className="chart-grid-line"/><text x={plot.left - 8} y={y + 4} textAnchor="end" className="chart-axis-label">{format(maximum * (1 - tick / 3))}</text></g>; })}
          {categories.map((category, index) => {
            const step = width / Math.max(1, labels.length);
            const groupWidth = Math.min(40, step * .68);
            if (mode === 'stacked') {
              let accumulated = 0;
              return <g key={category.label}>{series.map((item, si) => { const val = category.values[si]; const h = (val / maximum) * height; const y = yAt(accumulated + val); accumulated += val; return <rect key={item.name} x={plot.left + index * step + (step - groupWidth) / 2} y={y} width={groupWidth} height={h} rx="2" fill={item.color}><title>{category.label} · {item.name}: {format(val)}</title></rect>; })}</g>;
            }
            const barWidth = Math.min(16, groupWidth / Math.max(1, series.length));
            return <g key={category.label}>{series.map((item, si) => { const value = category.values[si]; const h = (value / maximum) * height; return <rect key={item.name} x={plot.left + index * step + (step - barWidth * series.length) / 2 + si * barWidth} y={yAt(value)} width={Math.max(2, barWidth - 2)} height={h} rx="2" fill={item.color}><title>{category.label} · {item.name}: {format(value)}</title></rect>; })}</g>;
          })}
          {shownLabels.map((label) => { const index = labels.indexOf(label); const step = width / Math.max(1, labels.length); return <text key={label + index} x={plot.left + index * step + step / 2} y="245" textAnchor="middle" className="chart-axis-label">{label}</text>; })}
        </svg>}
        {mode === 'bar' && <div className="ceo-horizontal-bars">{ranked.map((row) => <div className="ceo-hbar-row" key={row.label}><span title={row.label}>{row.label}</span><div>{series.map((item, i) => <div className="ceo-hbar-line" key={item.name}><i style={{ width: `${Math.max(0, row.values[i] / maximum * 100)}%`, background: item.color }}/><small>{item.name}</small></div>)}</div><strong>{format(Math.max(...row.values))}</strong></div>)}</div>}
        {mode === 'donut' && <div className="ceo-donut-layout"><svg viewBox="0 0 120 120" role="img" aria-label={`${title}, composition donut`}><circle cx="60" cy="60" r="42" fill="none" stroke="var(--chart-track)" strokeWidth="17"/>{ranked.map((row, index) => { const total = Math.max(1, ranked.reduce((sum, item) => sum + item.values[0], 0)); const value = row.values[0]; const offset = ranked.slice(0, index).reduce((sum, item) => sum + item.values[0] / total * 100, 0); const percent = value / total * 100; return <circle key={row.label} cx="60" cy="60" r="42" fill="none" stroke={palette[index % palette.length]} strokeWidth="17" pathLength="100" strokeDasharray={`${percent} ${100 - percent}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)"><title>{row.label}: {format(value)}</title></circle>; })}<text x="60" y="58" textAnchor="middle" className="ceo-donut-total">{format(ranked.reduce((sum, row) => sum + row.values[0], 0))}</text><text x="60" y="72" textAnchor="middle" className="ceo-donut-caption">TOTAL</text></svg><div className="ceo-donut-legend">{ranked.map((row, index) => <div key={row.label}><i style={{ background: palette[index % palette.length] }}/><span>{row.label}</span><strong>{format(row.values[0])}</strong></div>)}</div></div>}
        <div className="ceo-chart-legend">{series.map((item) => <span key={item.name}><i style={{ background: item.color }}/>{item.name}</span>)}</div>
      </div>}
      <details className="ceo-chart-table"><summary>View data table</summary><div className="table-scroll"><table><thead><tr><th>Period / category</th>{series.map((item) => <th key={item.name}>{item.name}</th>)}</tr></thead><tbody>{categories.map((row) => <tr key={row.label}><td>{row.label}</td>{row.values.map((value, i) => <td key={i}>{format(value)}</td>)}</tr>)}</tbody></table></div></details>
    </article>
  );
}

export default function AdminReports() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    const controller = new AbortController(); setBusy(true);
    fetch('/api/v1/reports?days=' + days, { signal: controller.signal }).then(async (response) => {
      const result = await response.json(); if (!response.ok) throw new Error(result.error); setData(result); setError('');
    }).catch((reason) => { if (!controller.signal.aborted) setError(reason.message); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [days]);

  const salesLabels = useMemo(() => [...new Set([...(data?.trend ?? []).map((row) => row.label), ...(data?.financialTrend ?? []).map((row) => row.label)])].sort(), [data]);
  const salesSeries = useMemo(() => {
    if (!data) return [];
    const order = new Map(data.trend.map((row) => [row.label, row.value]));
    const invoiced = new Map(data.financialTrend.map((row) => [row.label, row.invoiced]));
    const collections = new Map(data.financialTrend.map((row) => [row.label, row.collections]));
    return [
      { name: 'Order value', color: palette[0], values: salesLabels.map((label) => order.get(label) ?? 0) },
      { name: 'Invoiced', color: palette[1], values: salesLabels.map((label) => invoiced.get(label) ?? 0) },
      { name: 'Payments', color: palette[2], values: salesLabels.map((label) => collections.get(label) ?? 0) },
    ];
  }, [data, salesLabels]);

  function exportCsv() {
    if (!data) return;
    const safe = (value: unknown) => { let text = String(value); if (/^[=+@\-\t\r]/.test(text)) text = "'" + text; return '"' + text.replaceAll('"', '""') + '"'; };
    const rows: unknown[][] = [
      ['Drinkarto CEO overview · fictional demo data is illustrative only'], ['Period days', days], ['Definition', data.definition], [],
      ['CEO indicators'], ['Invoiced', data.financial.invoiced], ['Payments received', data.financial.collections], ['Refunds recorded', data.financial.refunds], ['Credit notes recorded', data.financial.credits], ['Open receivables', data.summary.outstanding], ['Order value (pipeline)', data.summary.orderValue], ['Open orders', data.summary.openOrders], ['Awaiting approval', data.summary.pendingApproval], ['Available units', data.summary.available], ['Low stock products', data.summary.lowStockCount], [],
      ['Date', 'Order value', 'Invoiced', 'Payments'],
      ...salesLabels.map((label, index) => [label, salesSeries[0]?.values[index] ?? 0, salesSeries[1]?.values[index] ?? 0, salesSeries[2]?.values[index] ?? 0]),
      [], ['Order status', 'Orders'], ...data.statuses.map((row) => [row.label, row.value]),
      [], ['Low stock product', 'SKU', 'Available', 'Reorder threshold'], ...data.lowStock.map((row) => [row.label, row.sku, row.available, row.threshold]),
    ];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(safe).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `drinkarto-ceo-overview-${days}-days.csv`; link.click(); URL.revokeObjectURL(url);
  }

  if (busy && !data) return <section className="admin-reports"><p role="status">Building your CEO overview…</p></section>;
  if (error && !data) return <section className="admin-reports"><p role="alert" className="error">{error}</p><button onClick={() => setDays((value) => value)}>Try again</button></section>;
  if (!data) return null;

  const kpis = [
    { label: 'Invoiced', value: money(data.financial.invoiced), detail: `${days}-day invoice total`, tone: 'green' },
    { label: 'Payments received', value: money(data.financial.collections), detail: 'Cash recorded in period', tone: 'blue' },
    { label: 'Open receivables', value: money(data.summary.outstanding), detail: 'Across all retailers', tone: 'amber' },
    { label: 'Order value', value: money(data.summary.orderValue), detail: 'Non-cancelled order pipeline', tone: 'green' },
    { label: 'Orders to action', value: number(data.summary.openOrders), detail: `${number(data.summary.pendingApproval)} awaiting approval`, tone: data.summary.openOrders ? 'amber' : 'blue' },
    { label: 'Reorder watch', value: number(data.summary.lowStockCount), detail: 'Products at / below threshold', tone: data.summary.lowStockCount ? 'red' : 'blue' },
  ];
  const stockSeries: Series[] = [
    { name: 'Available', color: palette[0], values: data.categories.map((row) => row.available) },
    { name: 'Reserved', color: palette[1], values: data.categories.map((row) => row.reserved) },
    { name: 'Damaged', color: palette[3], values: data.categories.map((row) => row.damaged) },
  ];

  return <section className="admin-reports ceo-reports">
    <div className="ceo-report-toolbar"><div><p className="ceo-report-eyebrow">LEADERSHIP VIEW · INR</p><h2>Company overview</h2><p>Sales pipeline, cash collected, customer exposure and stock health in one place.</p></div><div className="ceo-report-actions"><label>Reporting period<select value={days} onChange={(event) => setDays(Number(event.target.value))}>{[7, 30, 90, 365].map((value) => <option key={value} value={value}>Last {value} days</option>)}</select></label><button disabled={busy} onClick={exportCsv}>Export report</button></div></div>
    {error && <p role="alert" className="error">Refresh failed: {error}</p>}
    <div className="ceo-kpis">{kpis.map((item) => <article className={`ceo-kpi ceo-kpi-${item.tone}`} key={item.label}><p>{item.label}</p><strong>{item.value}</strong><span>{item.detail}</span></article>)}</div>
    <div className="ceo-watch-row"><div><span className="ceo-live-dot"/><div><strong>Decision watch</strong><p>{data.summary.pendingApproval ? `${data.summary.pendingApproval} order${data.summary.pendingApproval === 1 ? '' : 's'} need approval.` : 'No orders are awaiting approval.'} {data.summary.lowStockCount ? `${data.summary.lowStockCount} product${data.summary.lowStockCount === 1 ? '' : 's'} need a stock review.` : 'Stock levels are above reorder thresholds.'}</p></div></div><div className="ceo-as-of">Updated {new Date(data.asOf).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</div></div>
    <p className="report-definition">{data.definition} Current stock is organization-wide. Order and cash measures follow the selected period; receivables and stock are current totals.</p>

    <div className="ceo-section-title"><div><p className="ceo-report-eyebrow">01 · COMMERCIAL PERFORMANCE</p><h3>Sales and cash</h3></div><span>Compare demand with billing and money received</span></div>
    <div className="report-grid"><ChartCard title="Order value, invoices and payments" note="Each measure uses its own event date and accounting meaning." labels={salesLabels} series={salesSeries} modes={['line', 'area', 'column', 'bar']} initialMode="line" format={money}/>
      <ChartCard title="Order pipeline" note="Open, fulfilled and cancelled orders created in the selected period." labels={data.statuses.map((row) => row.label)} series={[{ name: 'Orders', color: palette[0], values: data.statuses.map((row) => row.value) }]} modes={['donut', 'bar', 'column']} initialMode="donut"/>
      <ChartCard title="Best-selling products" note="Ranked by order value; cancellations excluded." labels={data.topProducts.map((row) => row.label)} series={[{ name: 'Order value', color: palette[0], values: data.topProducts.map((row) => row.value) }]} modes={['bar', 'column']} initialMode="bar" format={money}/>
      <ChartCard title="Retailer order value" note="Largest retailer order totals in this period." labels={data.topRetailers.map((row) => row.label)} series={[{ name: 'Order value', color: palette[2], values: data.topRetailers.map((row) => row.value) }]} modes={['bar', 'column']} initialMode="bar" format={money}/></div>

    <div className="ceo-section-title"><div><p className="ceo-report-eyebrow">02 · WORKING CAPITAL</p><h3>Collections and credit</h3></div><span>Track receivables and settlement movement</span></div>
    <div className="report-grid"><ChartCard title="Outstanding by retailer" note="Current open balances; unused credit is shown for context." labels={data.credit.map((row) => row.label)} series={[{ name: 'Outstanding', color: palette[3], values: data.credit.map((row) => row.value) }, { name: 'Unused limit', color: '#dce6e1', values: data.credit.map((row) => Math.max(0, row.limit - row.value)) }]} modes={['bar', 'column', 'stacked']} initialMode="stacked" format={money}/>
      <ChartCard title="Credit notes and refunds" note="Adjustments recorded in the selected reporting period." labels={['Credit notes', 'Refunds']} series={[{ name: 'Amount', color: palette[3], values: [data.financial.credits, data.financial.refunds] }]} modes={['bar', 'column', 'donut']} initialMode="bar" format={money}/>
      <ChartCard title="Stock movement activity" note="Recorded movement events in the selected period." labels={data.movements.map((row) => row.label)} series={[{ name: 'Events', color: palette[1], values: data.movements.map((row) => row.value) }]} modes={['bar', 'column']} initialMode="bar"/></div>

    <div className="ceo-section-title"><div><p className="ceo-report-eyebrow">03 · INVENTORY CONTROL</p><h3>Stock position</h3></div><span>{number(data.summary.physical)} physical units · {money(data.summary.inventorySellingValue)} at selling price</span></div>
    <div className="report-grid"><ChartCard title="Inventory by category" note="Available, reserved and damaged units by product category." labels={data.categories.map((row) => row.label)} series={stockSeries} modes={['stacked', 'column', 'bar']} initialMode="stacked"/>
      <ChartCard title="Stock composition" note="Current units; values are organization-wide." labels={['Available', 'Reserved', 'Damaged']} series={[{ name: 'Units', color: palette[0], values: [data.summary.available, data.summary.reserved, data.summary.damaged] }]} modes={['donut', 'bar', 'column']} initialMode="donut"/>
      <ChartCard title="Physical units by brand" note="Inventory held across all product categories." labels={data.brands.map((row) => row.label)} series={[{ name: 'Physical units', color: palette[2], values: data.brands.map((row) => row.value) }]} modes={['bar', 'column']} initialMode="bar"/>
      <article className="report-chart ceo-chart-card ceo-reorder-card"><div className="ceo-chart-heading"><div><p className="ceo-chart-kicker">ACTION LIST</p><h3>Reorder watch</h3><p>Available quantity at or below each product’s configured threshold.</p></div><strong className="ceo-reorder-count">{data.lowStock.length}</strong></div>{data.lowStock.length ? <div className="table-scroll"><table><thead><tr><th>Product</th><th>SKU</th><th>Available</th><th>Threshold</th></tr></thead><tbody>{data.lowStock.map((row) => <tr key={row.sku}><td>{row.label}</td><td>{row.sku}</td><td>{row.available}</td><td>{row.threshold}</td></tr>)}</tbody></table></div> : <p className="report-empty">No products are at or below their reorder threshold.</p>}</article></div>
    <p className="report-definition ceo-report-footnote">Figures are organization-specific. Inventory valuation uses current selling prices, not purchase cost or accounting valuation. Trend dates use Asia/Kolkata. Public liquor price snapshots are not used in these business reports.</p>
  </section>;
}
