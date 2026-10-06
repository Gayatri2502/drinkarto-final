import { describe, it, expect } from "vitest";
import {
  authorize,
  stockChange,
  available,
  assertTenant,
} from "../src/lib/policy";
describe("stock invariants", () => {
  it("subtracts reservations and damaged stock", () =>
    expect(available({ physical: 20, reserved: 7, damaged: 3 })).toBe(10));
  it("cannot remove reserved stock", () =>
    expect(() =>
      stockChange({ physical: 20, reserved: 15, damaged: 2 }, -4),
    ).toThrow());
  it("rejects fractional adjustments", () =>
    expect(() =>
      stockChange({ physical: 20, reserved: 0, damaged: 0 }, 1.5),
    ).toThrow());
  it("allows receiving stock", () =>
    expect(stockChange({ physical: 20, reserved: 15, damaged: 2 }, 10)).toBe(
      30,
    ));
});
describe("authorization", () => {
  it("denies sales stock changes", () =>
    expect(() => authorize("SALES", "stock")).toThrow());
  it("denies unknown roles", () =>
    expect(() => authorize("SUPERADMIN", "read")).toThrow());
  it("permits warehouse stock changes", () =>
    expect(() => authorize("WAREHOUSE", "stock")).not.toThrow());
  it("rejects cross tenant records", () =>
    expect(() => assertTenant("A", "B")).toThrow());
});
