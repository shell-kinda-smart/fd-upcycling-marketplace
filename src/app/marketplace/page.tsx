import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightLeft,
  PackageSearch,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/commerce";
import { addToCart, proposeTrade } from "@/app/actions";
import { WishlistButton } from "@/components/wishlist-button";

interface MarketplaceProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    material?: string;
    price?: string;
    sort?: string;
    trade?: string;
  }>;
}

const MATERIAL_PRESETS = [
  "Denim",
  "Burlap",
  "Fire Hose",
  "Banner",
  "Silk",
  "Wood",
  "Leather",
  "Cork",
];

export default async function Marketplace({ searchParams }: MarketplaceProps) {
  const q = await searchParams;
  const session = await auth();

  // Price filtering logic
  let priceFilter: { lte?: number; gte?: number } | undefined;
  if (q.price === "under-500") {
    priceFilter = { lte: 500 };
  } else if (q.price === "500-1500") {
    priceFilter = { gte: 500, lte: 1500 };
  } else if (q.price === "above-1500") {
    priceFilter = { gte: 1500 };
  }

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(q.category && q.category !== "All" ? { category: q.category } : {}),
      ...(q.material ? { material: { contains: q.material } } : {}),
      ...(priceFilter ? { price: priceFilter } : {}),
      ...(q.trade === "1" ? { tradeEnabled: true } : {}),
      ...(q.q
        ? {
            OR: [
              { name: { contains: q.q } },
              { material: { contains: q.q } },
              { story: { contains: q.q } },
            ],
          }
        : {}),
    },
    include: { seller: { select: { name: true, college: true } } },
    orderBy:
      q.sort === "low"
        ? { price: "asc" }
        : q.sort === "high"
          ? { price: "desc" }
          : { createdAt: "desc" },
  });

  const hasActiveFilters = Boolean(
    q.q ||
      (q.category && q.category !== "All") ||
      q.material ||
      q.price ||
      q.trade ||
      (q.sort && q.sort !== "featured"),
  );

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-3 sm:px-6 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow flex items-center gap-1.5">
            <Sparkles className="size-3 text-[#cf5036]" />
            CURATED ARTISAN MARKETPLACE
          </p>
          <h1 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Find your next statement piece.
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
            Discover verified upcycled fashion, circular streetwear, and rescued materials transformed by independent creators.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="rounded-full bg-[#fff5e9] border border-[#29243d]/20 px-3 py-1 text-xs font-bold text-slate-800">
            <strong>{products.length}</strong> items available
          </span>
          {hasActiveFilters && (
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#cf5036] hover:underline"
            >
              <X className="size-3.5" /> Clear Filters
            </Link>
          )}
        </div>
      </div>

      {/* Main Search & Category Form */}
      <form className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_160px_160px_auto] gap-2.5">
        <div className="relative">
          <input
            name="q"
            defaultValue={q.q}
            placeholder="Search items, materials, or craft stories..."
            className="w-full text-xs sm:text-sm pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        </div>

        <select
          name="category"
          defaultValue={q.category || "All"}
          className="text-xs sm:text-sm"
        >
          {["All", "Bags", "Clothing", "Accessories", "Home"].map((x) => (
            <option key={x} value={x}>
              {x === "All" ? "All Categories" : x}
            </option>
          ))}
        </select>

        <select
          name="sort"
          defaultValue={q.sort || "featured"}
          className="text-xs sm:text-sm"
        >
          <option value="featured">Featured First</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>

        <button className="btn btn-primary text-xs sm:text-sm font-bold w-full sm:w-auto flex items-center justify-center gap-1.5">
          <SlidersHorizontal className="size-3.5" /> Filter
        </button>
      </form>

      {/* Quick Material Filter Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
          Rescued Material:
        </span>
        <Link
          href={`/marketplace${q.category ? `?category=${q.category}` : ""}`}
          className={`rounded-full px-3 py-1 text-xs font-bold transition border ${
            !q.material
              ? "bg-[#29243d] text-white border-[#29243d]"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
          }`}
        >
          All
        </Link>
        {MATERIAL_PRESETS.map((mat) => {
          const isActive = q.material?.toLowerCase() === mat.toLowerCase();
          const href = `/marketplace?material=${encodeURIComponent(mat)}${
            q.category ? `&category=${q.category}` : ""
          }`;
          return (
            <Link
              key={mat}
              href={href}
              className={`rounded-full px-3 py-1 text-xs font-bold transition border ${
                isActive
                  ? "bg-[#cf5036] text-white border-[#cf5036] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
              }`}
            >
              {mat}
            </Link>
          );
        })}
      </div>

      {/* Quick Price Range & Trade Toggles */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
          Price Range:
        </span>
        {[
          { label: "All Prices", value: "" },
          { label: "Under ₹500", value: "under-500" },
          { label: "₹500 - ₹1,500", value: "500-1500" },
          { label: "Above ₹1,500", value: "above-1500" },
        ].map((tier) => {
          const isActive = (q.price || "") === tier.value;
          const params = new URLSearchParams();
          if (q.category) params.set("category", q.category);
          if (q.material) params.set("material", q.material);
          if (q.q) params.set("q", q.q);
          if (tier.value) params.set("price", tier.value);
          if (q.trade) params.set("trade", q.trade);
          const href = `/marketplace${params.toString() ? `?${params.toString()}` : ""}`;

          return (
            <Link
              key={tier.label}
              href={href}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition border ${
                isActive
                  ? "bg-[#0c2340] text-white border-[#0c2340]"
                  : "bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200"
              }`}
            >
              {tier.label}
            </Link>
          );
        })}

        {/* Trade enabled toggle */}
        <Link
          href={`/marketplace?trade=${q.trade === "1" ? "" : "1"}${
            q.category ? `&category=${q.category}` : ""
          }`}
          className={`ml-auto rounded px-2.5 py-1 text-xs font-black uppercase tracking-wider transition border ${
            q.trade === "1"
              ? "bg-[#f3c94b] text-[#29243d] border-[#29243d]"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
          }`}
        >
          ♻ Trade Open Only
        </Link>
      </div>

      {/* Product Catalog Grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {products.map((p) => (
          <article
            key={p.id}
            className="card group flex flex-col justify-between overflow-hidden transition hover:-translate-y-1 shadow-xs"
          >
            <div>
              {/* Product Thumbnail with Wishlist Heart */}
              <div className="relative block h-48 w-full overflow-hidden bg-[#d8e2df]">
                <Link href={`/product/${p.id}`} className="block size-full">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      width={400}
                      height={300}
                      className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid size-full place-items-center text-5xl">
                      {p.symbol}
                    </span>
                  )}
                </Link>

                {/* Trade Badge */}
                {p.tradeEnabled && (
                  <span className="absolute left-2.5 top-2.5 border border-[#29243d] bg-[#f3c94b] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#29243d] shadow-xs z-10 pointer-events-none">
                    TRADE OPEN
                  </span>
                )}

                {/* Interactive Wishlist Heart Button */}
                <div className="absolute right-2.5 top-2.5 z-10">
                  <WishlistButton productId={p.id} productName={p.name} />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3.5 sm:p-4">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-[#cf5036]">{p.category}</span>
                  <span className="truncate max-w-[100px] text-slate-400">
                    {p.seller?.name || "Studio"}
                  </span>
                </div>

                <h2 className="mt-1 font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                  <Link href={`/product/${p.id}`} className="hover:text-[#cf5036] transition">
                    {p.name}
                  </Link>
                </h2>

                <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                  {p.material}
                </p>
              </div>

              {/* Trade Proposal Section */}
              {session && p.tradeEnabled && (
                <details className="mt-1 px-3.5 sm:px-4 pb-2 text-xs text-[#cf5036]">
                  <summary className="flex cursor-pointer items-center gap-1.5 font-bold hover:underline">
                    <ArrowRightLeft className="size-3.5" /> Propose a trade
                  </summary>
                  <form action={proposeTrade} className="mt-2 flex gap-1.5">
                    <input type="hidden" name="productId" value={p.id} />
                    <input
                      name="offerText"
                      placeholder="Your swap offer..."
                      required
                      className="text-xs !py-1 !px-2"
                    />
                    <button className="btn btn-primary text-xs !px-2.5 !py-1 font-bold">
                      Send
                    </button>
                  </form>
                </details>
              )}
            </div>

            {/* Bottom Price & Add to Bag row */}
            <div className="border-t border-slate-100 p-3.5 sm:p-4 pt-2.5 flex items-center justify-between">
              <Link href={`/product/${p.id}`}>
                <b className="text-sm sm:text-base font-black text-slate-900">
                  {inr(p.price.toNumber())}
                </b>
              </Link>

              {session ? (
                <form action={addToCart}>
                  <input type="hidden" name="productId" value={p.id} />
                  <button
                    className="grid size-8 sm:size-9 place-items-center rounded bg-[#29243d] text-white transition hover:bg-[#cf5036] active:scale-95"
                    aria-label={`Add ${p.name} to bag`}
                    title="Add to bag"
                  >
                    <Plus className="size-4" />
                  </button>
                </form>
              ) : (
                <Link
                  className="grid size-8 sm:size-9 place-items-center rounded bg-[#29243d] text-white transition hover:bg-[#cf5036]"
                  href="/signin"
                  aria-label="Sign in to add product"
                  title="Sign in to add product"
                >
                  <Plus className="size-4" />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Empty Search Results State */}
      {!products.length && (
        <div className="mt-14 card p-10 grid place-items-center text-center text-slate-500 max-w-md mx-auto">
          <PackageSearch className="size-10 text-[#cf5036]" />
          <p className="mt-3 font-bold text-base text-slate-800">No matching products found.</p>
          <p className="mt-1 text-xs">
            Try adjusting your search keywords, clear material filters, or pick another category.
          </p>
          <Link href="/marketplace" className="btn btn-primary mt-4 text-xs font-bold">
            Reset All Filters
          </Link>
        </div>
      )}
    </main>
  );
}
