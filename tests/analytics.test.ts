import { afterEach, describe, expect, it, vi } from "vitest";
const queries = vi.hoisted(() => ({
  invoiceFindMany: vi.fn(),
  orderCount: vi.fn(),
  orderFindMany: vi.fn(),
}));
vi.mock("../src/lib/db", () => ({ db: {
  invoice: { findMany: queries.invoiceFindMany },
  order: { count: queries.orderCount, findMany: queries.orderFindMany },
} }));
import { Prisma } from "@/generated/prisma/client";
import { analyticsTool } from "../src/lib/analytics";

afterEach(() => vi.clearAllMocks());

describe("tenant-scoped AI analytics", () => {
  it("returns outstanding balances from the latest invoice sample only", async () => {
    queries.invoiceFindMany.mockResolvedValue([
      { number: "INV-1", total: new Prisma.Decimal("125"), credited: new Prisma.Decimal("25"), paid: new Prisma.Decimal("50"), refunded: new Prisma.Decimal("0"), createdAt: new Date("2026-10-01T00:00:00Z"), order: { retailer: { name: "Corner Store" } } },
      { number: "INV-2", total: new Prisma.Decimal("60"), credited: new Prisma.Decimal("0"), paid: new Prisma.Decimal("60"), refunded: new Prisma.Decimal("0"), createdAt: new Date("2026-10-02T00:00:00Z"), order: { retailer: { name: "Bottle Shop" } } },
    ]);
    const result = await analyticsTool("tenant-a", "getInvoiceBalances", {});
    expect(queries.invoiceFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { organizationId: "tenant-a" }, take: 100 }));
    expect(result).toMatchObject({ openInvoiceCountInLatest100: 1, outstandingBalanceInLatest100: "50", sampleLimit: 100 });
  });

  it("returns pending approval records only for the trusted workspace", async () => {
    queries.orderCount.mockResolvedValue(2);
    queries.orderFindMany.mockResolvedValue([{ id: "order-1", total: new Prisma.Decimal("75"), createdAt: new Date("2026-10-01T00:00:00Z"), retailer: { name: "Store A" } }]);
    const result = await analyticsTool("tenant-b", "getPendingApprovals", {});
    expect(queries.orderCount).toHaveBeenCalledWith({ where: { organizationId: "tenant-b", status: "PENDING_APPROVAL" } });
    expect(result).toMatchObject({ pendingApprovalCount: 2, recentOrders: [{ retailer: "Store A", orderId: "order-1", total: "75" }] });
  });

  it("rejects unrecognized tools and malformed arguments", async () => {
    await expect(analyticsTool("tenant-a", "unknown", {})).rejects.toThrow("Unknown analytics tool");
    await expect(analyticsTool("tenant-a", "getInvoiceBalances", { organizationId: "tenant-b" })).rejects.toThrow();
  });
});
