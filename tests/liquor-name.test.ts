import { describe, it, expect } from "vitest";
import { canonicalLiquorName } from "../src/lib/liquor-name";
describe("official bottle label comparison", () => {
  it("groups case-pack and bottle-size variants without erasing the actual variant", () => {
    expect(canonicalLiquorName("Khodays XXX Rum 750MLx12Btls(0001)")).toBe(
      "Khodays XXX Rum",
    );
    expect(canonicalLiquorName("Khodays XXX Rum 180 ML × 48 Bottles")).toBe(
      "Khodays XXX Rum",
    );
    expect(canonicalLiquorName("Absolut Citron Vodka 750ML")).toBe(
      "Absolut Citron Vodka",
    );
    expect(canonicalLiquorName("Absolut Original Vodka 750ML")).not.toBe(
      canonicalLiquorName("Absolut Citron Vodka 750ML"),
    );
  });
});
