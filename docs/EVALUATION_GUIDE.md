# FD Upcycling Marketplace — Evaluation Guide

## 1. Problem statement and objective

Upcycled fashion and design products are usually scattered across social media or local events. Student creators lack a focused platform for listing products, managing stock and receiving orders, while buyers cannot easily discover or trade sustainable items.

The objective is to create a dedicated online marketplace where users can buy, sell and trade upcycled FD items, maintain profiles, manage product lifecycles and complete a safe demonstration checkout.

**Say this:** “ReThread connects student creators and conscious buyers while keeping usable materials in circulation. It demonstrates the core architecture of a scalable e-commerce application.”

## 2. Basic concept and working

1. A visitor can browse, search, filter and sort active listings.
2. A registered user can create a seller listing with material, category, price, story and trade preference.
3. Products are stored in PostgreSQL and immediately appear in the marketplace.
4. A buyer adds products to an account-specific cart and places a demo order.
5. Checkout creates an order and immutable order-item snapshots so history keeps the name and price used at purchase time.
6. Trade-enabled products accept written proposals, while sellers control listing status.
7. Buyer, Seller and Administrator permissions are enforced on the server; the workspace shows each role only its relevant tools.

## 3. Development and implementation

The frontend and backend are implemented in one Next.js App Router codebase. React Server Components query server-side data. Server Actions handle registration, profiles, listings, carts, checkout and trades. Zod validates inputs; Auth.js identifies the user; Prisma performs typed PostgreSQL operations.

The data model uses relations between users, products, cart items, orders, order items and trade proposals. Unique constraints prevent duplicate cart rows, indexes help marketplace queries, and status enums prevent invalid lifecycle values.

## 4. Technologies and purpose

| Technology            | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| Next.js 16 App Router | Full-stack pages, routing, backend actions and API |
| React 19              | Component-based interface                          |
| TypeScript            | Type-safe application code                         |
| Tailwind CSS 4        | Responsive editorial styling                       |
| Auth.js 5             | JWT sessions and protected user flows              |
| bcryptjs              | Secure password hashing                            |
| Zod                   | Runtime validation at the server boundary          |
| Prisma ORM 6          | Typed queries, relations and transactions          |
| PostgreSQL            | Hosted relational marketplace database             |
| Vitest                | Unit tests for commerce helpers                    |
| ESLint                | Static code-quality checks                         |

## 5. Completed and remaining work

The classroom project is **feature complete**: accounts, role-based workspaces, profiles, catalogue discovery, seller product management, cart, demo checkout, orders, trade proposals, administrator moderation, impact metrics, database, API, validation, seed data and documentation are complete.

Only external deployment onboarding remains: choosing a cloud host, adding a real merchant payment account and webhook secrets, and connecting optional shipping or notification providers. Those services need the owner’s commercial accounts and are intentionally outside the offline classroom build.

## 6. Expected outcome and practical application

The expected outcome is a working niche commerce platform that helps creators earn from discarded materials and lets buyers choose lower-waste products. It can be applied to campus maker clubs, fashion/design departments, exhibitions or expanded into a city-wide sustainable marketplace.

## Technical questions to expect

**Is payment implemented?** The complete checkout and order flow is implemented in safe demo mode. A live provider requires the owner’s merchant account, secret keys and verified webhooks; the UI never stores raw card data.

**Why keep OrderItem as well as Product?** It preserves the purchased name, price and quantity even if the seller later edits or removes the product.

**How are roles enforced?** Seller actions check seller capability and product ownership; buyer actions check buyer capability and use the authenticated buyer ID. Administrator actions require the administrator role. These checks run in Server Actions, not only in the UI.

**Why Server Actions?** They keep form mutations server-side with typed code and avoid building unnecessary client fetch wrappers for each form.

**Where is the backend?** `src/app/actions.ts`, Auth.js route handlers and `/api/products` are server code. PostgreSQL access never runs in the browser.

**Why PostgreSQL?** It provides durable relational tables, constraints and transactions, while the isolated `fd_marketplace` schema prevents overlap with the finance project.
