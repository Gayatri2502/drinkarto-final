import type { PriceRow } from '@/content/public';
export type LensProduct = { key: string; name: string; category: string; sizes: Record<string, Record<string, PriceRow[]>> };
export function compareStateRates(product: LensProduct, size: string, states: string[]) {
  const entries = states.map(state => {
    const rows = (product.sizes[size]?.[state] ?? []).filter(row => Number.isFinite(row.price) && row.price > 0);
    const prices = rows.map(row => row.price);
    return { state, rows, min: prices.length ? Math.min(...prices) : null, max: prices.length ? Math.max(...prices) : null };
  });
  const covered = entries.filter(entry => entry.min !== null);
  const low = covered.length ? Math.min(...covered.map(entry => entry.min!)) : null;
  const high = covered.length ? Math.max(...covered.map(entry => entry.max!)) : null;
  return { entries, covered: covered.length, low, high, comparable: covered.length >= 2, spread: low !== null && high !== null ? high - low : null };
}
