import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const password = process.env.SEED_PASSWORD;
if (!password || password.length < 12)
  throw new Error("Set SEED_PASSWORD (12+ characters).");
const email = "owner@example.test";
async function main() {
  if (await db.user.findUnique({ where: { email } }))
    throw new Error("Seed already exists; no data overwritten.");
  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: "Demo Owner",
        passwordHash: await hash(password!, 12),
      },
    });
    const org = await tx.organization.create({
      data: {
        name: "Northstar Distribution (fictional)",
        jurisdiction: "Demo — configure before use",
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });
    for (let i = 1; i <= 50; i++)
      await tx.retailer.create({
        data: {
          organizationId: org.id,
          name: `Fictional Retailer ${i}`,
          creditLimit: 100000,
        },
      });
    for (let i = 1; i <= 20; i++) {
      const p = await tx.product.create({
        data: {
          organizationId: org.id,
          name: `Sample Beverage ${i}`,
          sku: `DEMO-${i}`,
          brand: ["Northstar", "Riverbend", "Orchard"][i % 3],
          category: "Configurable category",
          unitPrice: 1000 + i * 100,
          physical: 50 + i * 2,
          minimumStock: 15,
        },
      });
      await tx.inventoryMovement.create({
        data: {
          organizationId: org.id,
          productId: p.id,
          actorId: user.id,
          kind: "RECEIPT",
          quantity: p.physical,
          previousPhysical: 0,
          newPhysical: p.physical,
          previousReserved: 0,
          newReserved: 0,
          reason: "Fictional development seed",
        },
      });
    }
  });
  console.log(
    "Fictional development organization seeded. Sign in as owner@example.test.",
  );
}
main().finally(() => db.$disconnect());
