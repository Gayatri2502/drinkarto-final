import { db } from "./db";
import { Prisma } from "@/generated/prisma/client";
import { HttpError, available, stockChange } from "./policy";
type Actor = { organizationId: string; userId: string };
export async function adjustStock(
  actor: Actor,
  input: { productId: string; quantity: number; reason: string; receipt?:boolean },
) {
  return db.$transaction(
    async (tx) => {
      const where = {
        organizationId_id: {
          organizationId: actor.organizationId,
          id: input.productId,
        },
      };
      const p = await tx.product.findUnique({ where });
      if (!p) throw new HttpError(404, "Product not found");
      const physical = stockChange(p, input.quantity);
      await tx.product.update({ where, data: { physical } });
      await tx.inventoryMovement.create({
        data: {
          organizationId: actor.organizationId,
          productId: p.id,
          actorId: actor.userId,
          kind: input.receipt ? "RECEIPT" : "ADJUSTMENT",
          quantity: input.quantity,
          previousPhysical: p.physical,
          newPhysical: physical,
          previousReserved: p.reserved,
          newReserved: p.reserved,
          reason: input.reason,
        },
      });
      await tx.auditLog.create({
        data: {
          organizationId: actor.organizationId,
          actorId: actor.userId,
          action: input.receipt ? "stock.receive" : "stock.adjust",
          entity: "Product",
          entityId: p.id,
          data: {
            previous: p.physical,
            current: physical,
            reason: input.reason,
          },
        },
      });
      return { physical };
    },
    { isolationLevel: "Serializable" },
  );
}
export async function createOrder(
  actor: Actor,
  input: {
    retailerId: string;
    items: { productId: string; quantity: number }[];
  },
) {
  return db.$transaction(
    async (tx) => {
      const retailer = await tx.retailer.findUnique({
        where: {
          organizationId_id: {
            organizationId: actor.organizationId,
            id: input.retailerId,
          },
        },
      });
      if (!retailer) throw new HttpError(404, "Retailer not found");
      if (
        new Set(input.items.map((i) => i.productId)).size !== input.items.length
      )
        throw new HttpError(400, "Duplicate products");
      const products = await tx.product.findMany({
        where: {
          organizationId: actor.organizationId,
          id: { in: input.items.map((i) => i.productId) },
        },
      });
      let total = new Prisma.Decimal(0);
      const items = input.items.map((i) => {
        const p = products.find((p) => p.id === i.productId);
        if (!p) throw new HttpError(404, "Product not found");
        if (available(p) < i.quantity)
          throw new HttpError(409, "Insufficient inventory for " + p.name);
        total = total.plus(p.unitPrice.mul(i.quantity));
        return { ...i, unitPrice: p.unitPrice };
      });
      const exposure = await tx.order.aggregate({
        where: {
          organizationId: actor.organizationId,
          retailerId: retailer.id,
          status: { in: ["SUBMITTED", "PROCESSING"] },
        },
        _sum: { total: true },
      });
      const requiresApproval = retailer.outstanding
        .plus(exposure._sum.total ?? 0)
        .plus(total)
        .gt(retailer.creditLimit);
      const order = await tx.order.create({
        data: {
          organizationId: actor.organizationId,
          retailerId: retailer.id,
          total,
          status: requiresApproval ? "PENDING_APPROVAL" : "SUBMITTED",
        },
      });
      await tx.orderItem.createMany({
        data: items.map((i) => ({
          ...i,
          organizationId: actor.organizationId,
          orderId: order.id,
        })),
      });
      if (!requiresApproval)
        for (const i of items) {
          const p = products.find((p) => p.id === i.productId)!;
          await tx.product.update({
            where: {
              organizationId_id: {
                organizationId: actor.organizationId,
                id: p.id,
              },
            },
            data: { reserved: { increment: i.quantity } },
          });
          await tx.inventoryMovement.create({
            data: {
              organizationId: actor.organizationId,
              productId: p.id,
              actorId: actor.userId,
              kind: "RESERVATION",
              quantity: i.quantity,
              previousPhysical: p.physical,
              newPhysical: p.physical,
              previousReserved: p.reserved,
              newReserved: p.reserved + i.quantity,
              reason: "Order submitted",
              orderId: order.id,
            },
          });
        }
      await tx.auditLog.create({
        data: {
          organizationId: actor.organizationId,
          actorId: actor.userId,
          action: "order.create",
          entity: "Order",
          entityId: order.id,
          data: { status: order.status, total: total.toString() },
        },
      });
      return order;
    },
    { isolationLevel: "Serializable" },
  );
}

export async function transitionOrder(
  actor: Actor,
  id: string,
  action: "approve" | "cancel",
) {
  return db.$transaction(
    async (tx) => {
      const where = {
        organizationId_id: { organizationId: actor.organizationId, id },
      };
      const order = await tx.order.findUnique({
        where,
        include: { items: true },
      });
      if (!order) throw new HttpError(404, "Order not found");
      if (action === "approve" && order.status !== "PENDING_APPROVAL")
        throw new HttpError(409, "Order is not awaiting approval");
      if (
        action === "cancel" &&
        !["SUBMITTED", "PENDING_APPROVAL"].includes(order.status)
      )
        throw new HttpError(409, "Order cannot be cancelled");
      for (const item of order.items) {
        const key = {
          organizationId_id: {
            organizationId: actor.organizationId,
            id: item.productId,
          },
        };
        const p = await tx.product.findUniqueOrThrow({ where: key });
        const change =
          action === "approve"
            ? item.quantity
            : order.status === "SUBMITTED"
              ? -item.quantity
              : 0;
        if (change > 0 && available(p) < change)
          throw new HttpError(409, "Insufficient inventory for approval");
        if (change !== 0) {
          await tx.product.update({
            where: key,
            data: { reserved: { increment: change } },
          });
          await tx.inventoryMovement.create({
            data: {
              organizationId: actor.organizationId,
              productId: p.id,
              actorId: actor.userId,
              kind: change > 0 ? "RESERVATION" : "RELEASE",
              quantity: change,
              previousPhysical: p.physical,
              newPhysical: p.physical,
              previousReserved: p.reserved,
              newReserved: p.reserved + change,
              reason: "Order " + action,
              orderId: id,
            },
          });
        }
      }
      const status = action === "approve" ? "SUBMITTED" : "CANCELLED";
      const updated = await tx.order.update({ where, data: { status } });
      await tx.auditLog.create({
        data: {
          organizationId: actor.organizationId,
          actorId: actor.userId,
          action: "order." + action,
          entity: "Order",
          entityId: id,
          data: {
            previous: order.status,
            current: status,
            creditException: action === "approve",
          },
        },
      });
      return updated;
    },
    { isolationLevel: "Serializable" },
  );
}
