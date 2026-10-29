# Architecture

```text
Buyer / Seller / Administrator browser
  └─ Next.js pages + Tailwind UI
       ├─ Auth.js session
       ├─ Server Actions
       │    ├─ Zod validation
       │    └─ Prisma transaction/query
       └─ Route Handler (/api/products)
                       ↓
              PostgreSQL database
```

## Main data relationships

- A `User` can own products, cart items, orders and trade proposals.
- A `Product` belongs to an optional seller and can be ACTIVE, SOLD or ARCHIVED.
- `CartItem` has a compound unique key on user and product, so adding again increases quantity.
- `Order` contains `OrderItem` snapshots and a payment/status field.
- `TradeProposal` connects a requester to a trade-enabled product.

## Role boundary

- **Buyer** accounts can browse, add items to a bag, check out and send trade proposals.
- **Seller** accounts can publish listings, manage only their own inventory and respond to incoming trade proposals.
- **Administrator** accounts can access moderation, order fulfillment and role management.
- The internal Prisma enum calls the Seller value `CREATOR`; the product interface consistently calls it Seller. Server Actions enforce these capabilities before database changes.

## Example product flow

The Sell form calls `createProduct`. The server verifies the session, validates fields, assigns the current user as seller and inserts through Prisma. `/marketplace` queries only ACTIVE products. `/listings` queries only products owned by that session and status updates also include seller ownership.

## Payment boundary

`checkout` is a payment-gateway simulation suitable for evaluation: it records the chosen demo method and marks `paymentStatus` as `DEMO_PAID`. In production, the server would create a provider checkout session and update the order only after a signed webhook. Raw card numbers should never enter this database.

Managed PostgreSQL makes data persistent across local and serverless deployments. The `fd_marketplace` schema isolates all marketplace tables from other projects in the same Neon database.
