# File Guide

| Path                            | Responsibility                                        |
| ------------------------------- | ----------------------------------------------------- |
| `src/app/page.tsx`              | Public editorial landing page                         |
| `src/components/header.tsx`     | Shared navigation, session state and cart count       |
| `src/app/marketplace/page.tsx`  | Catalog search, filters, sorting, cart and trade UI   |
| `src/app/sell/page.tsx`         | Product-publishing form                               |
| `src/app/listings/page.tsx`     | Seller-owned product management                       |
| `src/app/cart/page.tsx`         | Persistent cart and demo checkout                     |
| `src/app/orders/page.tsx`       | Buyer order history                                   |
| `src/app/profile/page.tsx`      | Editable account name, college and role               |
| `src/app/impact/page.tsx`       | Live circular-economy metrics                         |
| `src/app/actions.ts`            | Backend account, commerce and trade mutations         |
| `src/app/api/products/route.ts` | Public product JSON endpoint                          |
| `src/auth.ts`                   | Auth.js credentials and JWT session logic             |
| `src/lib/validation.ts`         | Zod account/product/checkout schemas                  |
| `src/lib/commerce.ts`           | Cart total, symbols and INR formatting                |
| `src/lib/prisma.ts`             | Shared database client                                |
| `prisma/schema.prisma`          | PostgreSQL models, relations, indexes and money fields |
| `prisma/seed.ts`                | Repeat-safe demonstration catalog loader              |
| `src/lib/commerce.test.ts`      | Unit tests for commerce helpers                       |
| `.env.example`                  | Safe PostgreSQL environment-variable template         |

Every main feature is a separate URL and `page.tsx`; this is not one HTML file hiding and showing sections.
