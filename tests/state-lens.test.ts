import { describe, expect, it } from 'vitest';
import { compareStateRates, type LensProduct } from '../src/lib/state-lens';
import type { PriceRow } from '../src/content/public';
const row = (price: number, state: string, sizeMl = 750) => ({ price, state, sizeMl } as PriceRow);
const product: LensProduct = { key: 'rum|example', name: 'Example', category: 'Rum', sizes: { '750': { Kerala: [row(1000, 'Kerala'), row(1200, 'Kerala')], 'Tamil Nadu': [row(1100, 'Tamil Nadu')] }, '375': { Kerala: [row(500, 'Kerala', 375)] } } };
describe('StateLens exact size comparison', () => {
  it('preserves multiple source rates and compares their full range', () => { const result = compareStateRates(product, '750', ['Kerala', 'Tamil Nadu']); expect(result.comparable).toBe(true); expect([result.low, result.high, result.spread]).toEqual([1000, 1200, 200]); expect(result.entries[0].rows).toHaveLength(2); });
  it('does not compare across bottle sizes or missing states', () => { const result = compareStateRates(product, '375', ['Kerala', 'Tamil Nadu', 'Goa']); expect(result.covered).toBe(1); expect(result.comparable).toBe(false); expect(result.entries[1].min).toBeNull(); expect(result.high).toBe(500); });
  it('handles empty selections and equal prices', () => { expect(compareStateRates(product, '750', []).low).toBeNull(); const equal = { ...product, sizes: { '750': { Kerala: [row(1000, 'Kerala')], Goa: [row(1000, 'Goa')] } } }; expect(compareStateRates(equal, '750', ['Kerala', 'Goa']).spread).toBe(0); });
});
