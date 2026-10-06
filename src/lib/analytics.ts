import { z } from "zod";
import { db } from "./db";
import { available, HttpError } from "./policy";
import { Prisma } from "@/generated/prisma/client";
export const analyticsNames = [
  "getOrderSummary",
  "getInventoryStatus",
  "getRetailerCount",
  "getPendingApprovals",
  "getInvoiceBalances",
] as const;
export async function analyticsTool(
  organizationId: string,
  name: string,
  args: unknown,
) {
  const where = { organizationId };
  if (name === "getOrderSummary") {
    const { days } = z.object({ days: z.number().int().min(1).max(366) }).strict().parse(args);
    const since = new Date(Date.now() - days * 86400000);
    const result = await db.order.aggregate({
      where: {
        ...where,
        createdAt: { gte: since },
        status: { not: "CANCELLED" },
      },
      _count: true,
      _sum: { total: true },
    });
    return {
      periodDays: days,
      orders: result._count,
      orderValue: result._sum.total?.toString() ?? "0",
      definition: "Order value, not recognized revenue or payments.",
    };
  }
  if (name === "getInventoryStatus") {
    z.object({}).strict().parse(args);
    const products = await db.product.findMany({
      where,
      select: {
        name: true,
        sku: true,
        physical: true,
        reserved: true,
        damaged: true,
        minimumStock: true,
      },
      take: 100,
      orderBy: { sku: "asc" },
    });
    return {
      products: products.map((p) => ({
        ...p,
        available: available(p),
        lowStock: available(p) <= p.minimumStock,
      })),
      limit: 100,
    };
  }
  if (name === "getRetailerCount") {
    z.object({}).strict().parse(args);
    return { retailers: await db.retailer.count({ where }) };
  }
  if (name === "getPendingApprovals") {
    z.object({}).strict().parse(args);
    const [count, orders] = await Promise.all([
      db.order.count({ where: { ...where, status: "PENDING_APPROVAL" } }),
      db.order.findMany({ where: { ...where, status: "PENDING_APPROVAL" }, take: 20, orderBy: { createdAt: "desc" }, include: { retailer: { select: { name: true } } } }),
    ]);
    return {
      pendingApprovalCount: count,
      recentOrders: orders.map((order) => ({ retailer: order.retailer.name, orderId: order.id, total: order.total.toString(), createdAt: order.createdAt.toISOString() })),
      sampleLimit: 20,
    };
  }
  if (name === "getInvoiceBalances") {
    z.object({}).strict().parse(args);
    const invoices = await db.invoice.findMany({ where, take: 100, orderBy: { createdAt: "desc" }, include: { order: { include: { retailer: { select: { name: true } } } } } });
    const open = invoices.map((invoice) => ({ invoiceNumber: invoice.number, retailer: invoice.order.retailer.name, balance: invoice.total.minus(invoice.credited).minus(invoice.paid).plus(invoice.refunded), issuedAt: invoice.createdAt })).filter((invoice) => invoice.balance.gt(0));
    return {
      openInvoiceCountInLatest100: open.length,
      outstandingBalanceInLatest100: open.reduce((sum, invoice) => sum.plus(invoice.balance), new Prisma.Decimal(0)).toString(),
      invoices: open.slice(0, 20).map((invoice) => ({ invoiceNumber: invoice.invoiceNumber, retailer: invoice.retailer, balance: invoice.balance.toString(), issuedAt: invoice.issuedAt.toISOString() })),
      sampleLimit: 100,
    };
  }
  throw new HttpError(400, "Unknown analytics tool");
}
