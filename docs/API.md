# API v1

All routes live below `/api/v1`. Responses are JSON. Errors use `{error: string}` and HTTP 400, 401, 403, 404, 409, 429, 502 or 503. POST requests must include `Content-Type: application/json` and an Origin equal to APP_ORIGIN. Authentication uses the session cookie issued by registration or login. Never send organizationId as request data.

| Method | Route              | Input / result                                                                                             |
| ------ | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| POST   | auth/register      | email, password, name, organization, jurisdiction → owner account and workspace                            |
| POST   | auth/login         | email, password → session cookie                                                                           |
| POST   | auth/logout        | empty object → current session revoked                                                                     |
| GET    | me                 | Current user, role and organization                                                                        |
| GET    | products           | First 100 products, current available stock                                                                |
| POST   | products           | name, sku, brand, category, unitPrice, minimumStock; owner                                                 |
| GET    | retailers          | First 100 retailers; owner/manager                                                                         |
| POST   | retailers          | name, creditLimit; optional email and licenceNumber; owner/manager                                         |
| POST   | inventory/adjust   | productId, signed integer quantity, reason (5+ characters); owner/manager/warehouse                        |
| GET    | orders             | Most recent 100 orders; owner/manager                                                                      |
| POST   | orders             | retailerId, items: [{productId, quantity}]; owner/manager                                                  |
| POST   | orders/:id/approve | empty object; explicit credit exception approval; owner/manager                                            |
| POST   | orders/:id/cancel  | empty object; releases reservations; owner/manager                                                         |
| GET    | analytics          | Order value, order count, retailer count, low stock count and stock valued at selling price; owner/manager |
| GET    | audit              | Most recent 100 audit records; owner/manager                                                               |
| POST   | ai/chat            | question (3–1000 characters), optional conversationId; owner/manager; stores question/answer and returns scoped conversationId |
| GET    | ai/conversations   | Latest 30 conversations for the signed-in owner/manager member; never other members' conversations       |
| GET    | ai/conversations/:id | One conversation and latest 40 messages; owner/manager creator only                                  |
| DELETE | ai/conversations/:id | Delete the signed-in member's conversation and messages                                               |

Read lists are bounded but pagination is pending. Order value is not recognized revenue. Inventory valuation currently uses selling prices, not cost accounting. Cancelled orders are excluded from overview count/value and AI summaries. AI summaries state the period. No API endpoint edits or deletes audit history.

Example order request:

```json
{ "retailerId": "<uuid>", "items": [{ "productId": "<uuid>", "quantity": 5 }] }
```

The server obtains prices, calculates decimal totals, checks stock and credit exposure, and writes an audit trail. An order crossing its retailer's credit limit returns PENDING_APPROVAL, without reserving stock. Approval is a deliberate credit exception and rechecks inventory before reserving.

## Public reference and report additions

- `GET /api/public/prices`: q, state, category, size, page and limit (1–40). Database snapshots only. Includes exact bottle rate, source URL and last successful check. No tenant data.
- `GET /api/public/catalogue`: q, category, page; 18 normalized workbook identities per page. Returns name/category/reference sizes; excludes workbook prices, descriptions, images and stock claims.
- `GET /api/v1/reports?days=30`: owner/manager membership required; days 1–365. Tenant-scoped current stock, reorder list, credit, order value, status, product/retailer breakdown and inventory movement counts. Cancelled orders excluded from value; pending approval included. This is not invoiced sales or cash collections.
- Official source refresh is a separate CLI worker with a database advisory lock; it has no unauthenticated public write endpoint.

### Fulfilment and operational finance

- `POST inventory/receive`: stock permission; positive integer `quantity`, `productId`, receipt `reason`.
- `POST orders/:id/fulfil`: approval permission. Atomic shipment + internal invoice + receivable. Repeated fulfilment returns the same invoice while the order remains fulfilled.
- `GET invoices`: owner, manager or accounts; latest 100 tenant invoices, line items, finance entries and signed balance. Negative balance means customer credit.
- `POST invoices/:id/payment` and `/refund`: finance permission; decimal-string `amount`, external receipt `reference`, UUID `requestKey`. Replays with identical data are idempotent. Different data using the same key is rejected.
- `POST orders/:id/return`: approval permission; saleable received `items:[{productId,quantity}]`, `reason`, UUID `requestKey`. Stock is restored, a credit entry is issued and the receivable decreases only by the unpaid balance. Paid returns create customer credit.
- `GET price-health`: owners/managers can inspect shared source status. Candidate imports are visible only to configured platform reviewers.
- `POST price-reviews/:id/approve|reject`: explicit platform reviewer allowlist plus approval permission. Approval revalidates candidates and checks the last-good snapshot has not changed.
- `POST price-alerts/acknowledge`: platform reviewer only, `{authority}`. Acknowledgement does not resolve the source failure.

All mutations use the configured same-origin check. Operational finance entries are append-only; related stock, credit and audit writes use serializable transactions. A concurrency conflict returns HTTP 409 and can be retried with the same request key.

AI chat history is stored in PostgreSQL under both organization and creating-member keys, with composite foreign keys and cascade deletion. Only the creating member can list, read or delete a conversation. The model receives up to the prior six user/assistant exchanges for context; no model-supplied tenant ID is accepted. AI analytics remain read-only. Provider requests use `store:false`; this disables Responses application-state storage, not every form of provider safety logging.
