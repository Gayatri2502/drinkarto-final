import "dotenv/config";
import { db } from "../src/lib/db";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
type Client = { cookie: string };
const a: Client = { cookie: "" },
  b: Client = { cookie: "" };
let checks = 0;
const health = await fetch(base + "/api/health");
assert.equal(health.status, 200);
assert.equal((await health.json()).status, "ok");
checks++;
async function request(
  client: Client,
  path: string,
  body?: unknown,
  expected = 200,
) {
  const response = await fetch(base + "/api/v1/" + path, {
    method: body ? "POST" : "GET",
    headers: {
      origin: base,
      ...(body ? { "Content-Type": "application/json" } : {}),
      cookie: client.cookie,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  assert.equal(response.status, expected, JSON.stringify(data));
  const cookie = response.headers.get("set-cookie");
  if (cookie) client.cookie = cookie.split(";")[0];
  checks++;
  return data;
}
const suffix = randomUUID();
const credentials = {
  name: "Test Owner",
  password: "TestPassword123!",
  jurisdiction: "Test jurisdiction",
};
await request(
  a,
  "auth/register",
  {
    ...credentials,
    email: "a-" + suffix + "@example.test",
    organization: "Tenant A",
  },
  201,
);
await request(
  b,
  "auth/register",
  {
    ...credentials,
    email: "b-" + suffix + "@example.test",
    organization: "Tenant B",
  },
  201,
);
const p = await request(
  a,
  "products",
  {
    name: "Test beverage",
    sku: "TEST",
    brand: "Brand",
    category: "Category",
    unitPrice: 150,
    minimumStock: 5,
  },
  201,
);
const r = await request(
  a,
  "retailers",
  { name: "Test retailer", creditLimit: 10000 },
  201,
);
const p2 = await request(
  a,
  "products",
  {
    name: "Test companion",
    sku: "TEST-2",
    brand: "Brand",
    category: "Category",
    unitPrice: 100,
    minimumStock: 5,
  },
  201,
);
await request(a, "inventory/adjust", {
  productId: p2.id,
  quantity: 20,
  reason: "Companion test receipt",
});
await request(a, "inventory/adjust", {
  productId: p.id,
  quantity: 20,
  reason: "Test receipt",
});
assert.equal((await request(b, "products")).length, 0);
await request(
  b,
  "inventory/adjust",
  { productId: p.id, quantity: 50, reason: "Cross tenant attack" },
  404,
);
await request(
  b,
  "orders",
  { retailerId: r.id, items: [{ productId: p.id, quantity: 1 }] },
  404,
);
const ownR = await request(
  b,
  "retailers",
  { name: "Tenant B retailer", creditLimit: 10000 },
  201,
);
await request(
  b,
  "orders",
  { retailerId: ownR.id, items: [{ productId: p.id, quantity: 1 }] },
  404,
);
await request(
  a,
  "orders",
  {
    retailerId: r.id,
    items: [{ productId: p.id, quantity: 2 }],
    organizationId: (await request(b, "me")).organizationId,
  },
  400,
);
const order = await request(
  a,
  "orders",
  {
    retailerId: r.id,
    items: [
      { productId: p.id, quantity: 5 },
      { productId: p2.id, quantity: 2 },
    ],
  },
  201,
);
assert.equal(order.total, "950");
assert.equal(order.status, "SUBMITTED");
assert.equal((await request(a, "products"))[0].reserved, 5);
await request(
  a,
  "inventory/adjust",
  { productId: p.id, quantity: -16, reason: "Would remove reserved stock" },
  409,
);
await request(b, "orders/" + order.id + "/cancel", {}, 404);
await request(a, "orders/" + order.id + "/cancel", {});
assert.equal((await request(a, "products"))[0].reserved, 0);
assert.equal(
  (await request(a, "products")).find((product: any) => product.id === p2.id)
    .reserved,
  0,
);
await request(a, "orders/" + order.id + "/cancel", {}, 409);
const limited = await request(
  a,
  "retailers",
  { name: "Credit limited retailer", creditLimit: 0 },
  201,
);
const pending = await request(
  a,
  "orders",
  { retailerId: limited.id, items: [{ productId: p.id, quantity: 2 }] },
  201,
);
assert.equal(pending.status, "PENDING_APPROVAL");
assert.equal((await request(a, "products"))[0].reserved, 0);
await request(a, "orders/" + pending.id + "/approve", {});
assert.equal((await request(a, "products"))[0].reserved, 2);
const wrongOrigin = await fetch(base + "/api/v1/inventory/adjust", {
  method: "POST",
  headers: {
    origin: "https://attacker.test",
    cookie: a.cookie,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    productId: p.id,
    quantity: 5,
    reason: "CSRF attempt",
  }),
});
assert.equal(wrongOrigin.status, 403);
checks++;
await request({ cookie: "" }, "products", undefined, 401);
assert.ok(
  (await request(a, "audit")).some((x: any) => x.action === "stock.adjust"),
);
const actor = await request(a, "me");
const conversation = await db.aiConversation.create({
  data: {
    organizationId: actor.organizationId,
    userId: actor.userId,
    title: "Storage check",
  },
});
await db.aiMessage.create({
  data: {
    organizationId: actor.organizationId,
    conversationId: conversation.id,
    role: "user",
    content: "Show the stock summary",
  },
});
assert.ok(
  (await request(a, "ai/conversations")).some(
    (item: any) => item.id === conversation.id,
  ),
);
assert.equal(
  (await request(a, "ai/conversations/" + conversation.id)).messages[0].content,
  "Show the stock summary",
);
await request(b, "ai/conversations/" + conversation.id, undefined, 404);
const deletedConversation = await fetch(
  base + "/api/v1/ai/conversations/" + conversation.id,
  { method: "DELETE", headers: { origin: base, cookie: a.cookie } },
);
assert.equal(deletedConversation.status, 200);
checks++;
await db.member.update({
  where: {
    organizationId_userId: {
      organizationId: actor.organizationId,
      userId: actor.userId,
    },
  },
  data: { role: "WAREHOUSE" },
});
await request(a, "reports", undefined, 403);
try {
  await request(a, "retailers", undefined, 403);
  await request(a, "audit", undefined, 403);
  await request(
    a,
    "products",
    {
      name: "Unauthorized",
      sku: "DENIED",
      brand: "Brand",
      category: "Category",
      unitPrice: 1,
      minimumStock: 1,
    },
    403,
  );
  await request(a, "inventory/adjust", {
    productId: p.id,
    quantity: 1,
    reason: "Warehouse receipt",
  });
} finally {
  await db.member.update({
    where: {
      organizationId_userId: {
        organizationId: actor.organizationId,
        userId: actor.userId,
      },
    },
    data: { role: "OWNER" },
  });
}
await assert.rejects(
  db.product.update({
    where: {
      organizationId_id: { organizationId: actor.organizationId, id: p.id },
    },
    data: { physical: -1 },
  }),
);
checks++;
const audit = await db.auditLog.findFirstOrThrow({
  where: { organizationId: actor.organizationId },
});
await assert.rejects(
  db.auditLog.update({ where: { id: audit.id }, data: { action: "tamper" } }),
);
checks++;
const results = await Promise.all(
  [1, 2].map(() =>
    fetch(base + "/api/v1/orders", {
      method: "POST",
      headers: {
        origin: base,
        cookie: a.cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        retailerId: r.id,
        items: [{ productId: p.id, quantity: 14 }],
      }),
    }),
  ),
);
assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
checks += 2;
const stock = (await request(a, "products"))[0];
assert.ok(stock.reserved <= stock.physical);
assert.equal(Number((await request(a, "analytics")).orderValue), 2400);
const reportA = await request(a, "reports?days=30");
assert.equal(reportA.summary.orderValue, 2400);
assert.ok(reportA.lowStock.every((x: { sku: string }) => x.sku === p.sku));
const reportB = await request(b, "reports?days=30");
assert.equal(reportB.summary.orderValue, 0);
assert.equal(reportB.categories.length, 0);
await request(a, "reports?days=999", undefined, 400);
await request(a, "auth/logout", {});
await request(a, "products", undefined, 401);
await db.$disconnect();
console.log(
  checks +
    " API integration checks passed: authentication, tenant isolation, stock ledger, credit approval, CSRF, logout.",
);
