import { describe, it, expect } from "vitest";
import {
  indiaMarkets,
  generalPriceUnavailable,
  marketFor,
  taxExplanation,
} from "../src/content/india-markets";
import {
  reconcilesRetail,
  priceBreakdownSchema,
} from "../src/lib/price-breakdown";
import { validateSnapshot } from "../src/lib/price-validation";
describe("India price directory coverage and disclosure", () => {
  it("lists exactly 28 states and 8 union territories without duplicates", () => {
    expect(indiaMarkets).toHaveLength(36);
    expect(new Set(indiaMarkets.map((item) => item.name)).size).toBe(36);
    expect(indiaMarkets.filter((item) => item.kind === "State")).toHaveLength(
      28,
    );
    expect(
      indiaMarkets.filter((item) => item.kind === "Union territory"),
    ).toHaveLength(8);
    expect(marketFor("Andhra Pradesh")).toBeDefined();
    expect(marketFor("Arunachal Pradesh")).toBeDefined();
  });
  it("keeps prohibition and category-specific restrictions separate from missing source data", () => {
    expect(generalPriceUnavailable("Bihar")).toBe(true);
    expect(generalPriceUnavailable("Gujarat")).toBe(true);
    expect(marketFor("Mizoram")?.note).toContain("wine");
    expect(marketFor("Lakshadweep")?.note).toContain("commencement");
    expect(generalPriceUnavailable("Andhra Pradesh")).toBe(false);
  });
  it("never labels an unverified state tax formula as ready", () => {
    expect(taxExplanation("Andhra Pradesh").status).toContain("awaiting");
    expect(taxExplanation("Tamil Nadu").detail).toContain("cannot");
    expect(taxExplanation("Kerala").formula).toContain("FL-1");
    expect(
      indiaMarkets.every((item) => item.source.startsWith("https://")),
    ).toBe(true);
  });
  it("reconciles bottle tax components without adding case costs twice", () => {
    const details = priceBreakdownSchema.parse({
      source: "bevco-published-columns",
      bottlesPerCase: 12,
      landedCostPerCase: 2276,
      exciseDutyPerCase: 1599.75,
      importFeePerCase: 33.75,
      warehouseBeforeTaxPerCase: 4507.12,
      warehouseTaxPerCase: 11312.88,
      warehouseAfterTaxPerCase: 16300,
      retailBeforeTax: 430.2,
      retailTax: 1079.8,
      retailCess: 40,
      retailAdjustment: 0,
    });
    expect(reconcilesRetail(1550, details)).toBe(true);
    expect(reconcilesRetail(16300, details)).toBe(false);
  });
  it("rejects a fabricated tax receipt even when its final price is positive", () => {
    const breakdown = {
      source: "bevco-published-columns",
      bottlesPerCase: 12,
      landedCostPerCase: 2276,
      exciseDutyPerCase: 1599.75,
      importFeePerCase: 33.75,
      warehouseBeforeTaxPerCase: 4507.12,
      warehouseTaxPerCase: 11312.88,
      warehouseAfterTaxPerCase: 16300,
      retailBeforeTax: 430.2,
      retailTax: 1079.8,
      retailCess: 40,
      retailAdjustment: 0,
    };
    const rows = Array.from({ length: 100 }, (_, index) => ({
      id: "kl-" + index,
      name: "Source Brandy",
      category: "Brandy",
      state: "Kerala",
      sizeMl: 750,
      price: 1400,
      sourceId: "bevco-2026-09",
      sourceCode: String(index),
      breakdown,
    }));
    expect(() =>
      validateSnapshot(
        {
          rows,
          sourceUrl: "https://bevco.in/prices.pdf",
          published: null,
          effective: null,
        },
        "bevco-2026-09",
        0,
      ),
    ).toThrow("reconcile");
  });
});
