# ReThread — Viva Quick Revision

## 30-second introduction

“ReThread is a full-stack upcycling marketplace for buying, selling and trading FD products. It includes accounts, editable profiles, product discovery and management, cart, demo payment checkout, orders and trade proposals. I built it with Next.js, TypeScript and Tailwind, use SQLite through Prisma, Auth.js for sessions, bcrypt for passwords and Zod for validation.”

## Questions and answers

1. **Frontend vs backend?** React/Tailwind pages are the frontend. Server Actions, APIs, Auth.js and Prisma queries are the backend.
2. **Why SQLite?** Commerce data is relational, and SQLite provides transactions, constraints and indexed queries without requiring a separate server for the demonstration.
3. **Why are order items separate?** They snapshot name, price and quantity at checkout so order history stays correct.
4. **How do you prevent users editing another seller's listing?** The update condition includes both listing ID and authenticated seller ID.
5. **What is a compound unique key?** `userId + productId` allows only one cart row per user/product.
6. **How is checkout safe?** This build simulates a gateway and stores no card/UPI secret. Production would trust only a signed provider webhook.
7. **What is a database transaction?** A group of writes succeeds or rolls back together; checkout creates the order, marks items sold and clears related carts together.
8. **Why Server Actions?** Forms call server code directly while secrets and database access stay outside the browser bundle.
9. **How do search and filters work?** URL search parameters become a Prisma `where` and `orderBy` query for ACTIVE products.
10. **How would it scale?** Use managed PostgreSQL and pooling, object storage/CDN for images, provider-hosted payment, queues for notifications and horizontally scaled Next.js servers.

Read `EVALUATION_GUIDE.md` for the teacher's six points and `DEMO_SCRIPT.md` for the presentation order.
