# ReThread — FD Upcycling Marketplace (100% Complete)

**Topic:** Create an online marketplace where users can buy, sell and trade upcycled FD (Fashion & Design) items. BTech students develop e-commerce functionality with user profiles, payment gateways, product management, and circular trading.

ReThread is a full-stack, multi-page marketplace built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Auth.js v5**, **Prisma ORM**, and **SQLite**. The evaluation build is **100% complete**, including a built-in **Razorpay Demo Payment Gateway** that requires **no Razorpay merchant account**.

---

## 🚀 Working Features (100% Complete)

- **Authentication & Roles**: Register, sign in, sign out, and use dedicated Buyer, Seller, Buyer & Seller, or Administrator access. (The database keeps `CREATOR` as the internal name for the Seller role.)
- **Role-based Workspace (`/workspace`)**: Each account sees only the relevant buyer, seller, and administrator activity, counts, and actions in one clear workspace.
- **Product Catalog & Search**: Browse 50 curated upcycled products with high-resolution photos, real-time keyword search, category filtering, and price sorting.
- **Dedicated Product Detail Page (`/product/[id]`)**: High-res image view, craft story, rescued material provenance, circular eco-impact metrics (CO2e, water saved, waste diverted), and direct buying/trading.
- **Seller Studio (`/sell`)**: Publish new upcycled creations with category, pricing, material story, photo URL/path, and trade eligibility.
- **Inventory Lifecycle (`/listings`)**: Sellers can update product statuses (`ACTIVE`, `SOLD`, `ARCHIVED`) and manage active stock.
- **Persistent Shopping Bag (`/cart`)**: User-bound database cart, quantity calculations, item removal, and subtotal summaries.
- **Razorpay Demo Payment Gateway**:
  - High-fidelity Razorpay modal with official navy styling.
  - Test UPI (Google Pay, PhonePe, Paytm, BHIM, custom VPA).
  - Test Card auto-filler (`4111 1111 1111 1111`).
  - Top Indian Netbanking simulator.
  - Cash on Delivery (COD) alternative.
  - Live animated gateway progression and real transaction reference IDs (`pay_demo_...`).
  - **Zero external accounts or merchant verification needed.**
- **Order Management & Receipts (`/orders`)**: Persistent order history with items, thumbnails, shipping address, status badges, and Razorpay transaction IDs.
- **Peer-to-Peer Trade Hub (`/trades`)**: Full circular swap system. Sellers can review incoming swap offers and click **Accept Trade** (auto-marks item as sold) or **Decline**. Buyers can track sent offers.
- **Platform Admin Dashboard (`/admin`)**:
  - Catalog metrics, gross revenue, user count, and trade volume.
  - Product moderation (status toggling & deletion).
  - Order fulfillment advancement (`CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`).
  - Community user role assignment.
  - Grant admin access via CLI: `npm run admin:grant -- your-email@example.com`.
- **Circular Impact (`/impact`)**: Live metrics displaying recirculated items, estimated landfill waste diverted, and design thinking pillars.
- **Public API (`/api/products`)**: JSON endpoint returning active marketplace items.

---

## 💻 Run Locally

**Requirements:** Node.js 22+. SQLite is embedded and requires no external database server or Docker.

```bash
# 1. Install dependencies
npm install

# 2. Setup SQLite database & seed 50 items with images
npm run db:setup

# 3. Start development server
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001).

### Demo Credentials

| Role              | Email                    | Password         | Access                                         |
| ----------------- | ------------------------ | ---------------- | ---------------------------------------------- |
| **Admin & Maker** | `demo.maker@example.com` | `DemoPass123!`   | Marketplace, Sell, Trades, Orders, Admin Panel |
| **Seller**        | `studio@rethread.demo`   | `StudioDemo123!` | Seller inventory and catalogue                 |

_To grant admin access to any newly registered user:_

```bash
npm run admin:grant -- your-email@example.com
```

---

## 🧪 Quality & Verification Commands

```bash
# Run unit tests
npm test

# Run ESLint check
npm run lint

# Run production build
npm run build

# Open Prisma visual database studio
npm run db:studio
```

---

## 📚 Evaluation Documents

- [100% Completion Summary](docs/100_PERCENT_COMPLETION.md)
- [Architecture](docs/ARCHITECTURE.md)
- [File Guide](docs/FILE_GUIDE.md)
- [Demo Script](docs/DEMO_SCRIPT.md)
- [Viva Guide](docs/VIVA_GUIDE.md)
- [Teacher Requirements](docs/TEACHER_REQUIREMENTS.md)
