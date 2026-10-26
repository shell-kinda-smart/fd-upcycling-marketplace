import Link from "next/link";
import Image from "next/image";
import { ArrowRightLeft, PackageSearch, Plus, Search } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/commerce";
import { addToCart, proposeTrade } from "@/app/actions";

export default async function Marketplace({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const q = await searchParams;
  const session = await auth();

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(q.category && q.category !== "All" ? { category: q.category } : {}),
      ...(q.q
        ? {
            OR: [{ name: { contains: q.q } }, { material: { contains: q.q } }],
          }
        : {}),
    },
    include: { seller: { select: { name: true } } },
    orderBy:
      q.sort === "low"
        ? { price: "asc" }
        : q.sort === "high"
          ? { price: "desc" }
          : { createdAt: "desc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-3 sm:px-6 py-8 sm:py-12">
      <div className="max-w-2xl">
        <p className="eyebrow">CURATED ARTISAN MARKETPLACE</p>
        <h1 className="mt-1.5 text-2xl sm:text-4xl font-black tracking-[-.05em] text-slate-900">
          Find your next statement piece.
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Browse upcycled fashion, circular design goods, and rescued textile pieces.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <form className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_160px_160px_auto] gap-2.5">
        <div className="relative">
          <input
            name="q"
            defaultValue={q.q}
            placeholder="Search products or rescued materials..."
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
        <button className="btn btn-primary text-xs sm:text-sm font-bold w-full sm:w-auto">
          Filter
        </button>
      </form>

      {/* Product Catalog Grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {products.map((p) => (
          <article
            key={p.id}
            className="card group flex flex-col justify-between overflow-hidden transition hover:-translate-y-1"
          >
            <div>
              <Link
                href={`/product/${p.id}`}
                className="relative block h-48 w-full overflow-hidden bg-[#d8e2df]"
              >
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
                {p.tradeEnabled && (
                  <span className="absolute left-2.5 top-2.5 border border-[#29243d] bg-[#f3c94b] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#29243d] shadow-xs">
                    TRADE OPEN
                  </span>
                )}
              </Link>

              <div className="p-3.5 sm:p-4">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-[#cf5036]">{p.category}</span>
                  <span className="truncate max-w-[100px] text-slate-400">
                    {p.seller?.name || "Studio"}
                  </span>
                </div>

                <h2 className="mt-1 font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                  <Link href={`/product/${p.id}`} className="hover:text-[#cf5036]">
                    {p.name}
                  </Link>
                </h2>

                <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                  {p.material}
                </p>
              </div>

              {/* Trade Proposal Section */}
              {session && p.tradeEnabled && (
                <details className="mt-2 px-3.5 sm:px-4 pb-1 text-xs text-[#cf5036]">
                  <summary className="flex cursor-pointer items-center gap-1.5 font-bold">
                    <ArrowRightLeft className="size-3.5" /> Propose a trade
                  </summary>
                  <form action={proposeTrade} className="mt-2 flex gap-2">
                    <input type="hidden" name="productId" value={p.id} />
                    <input name="offerText" placeholder="Your offer..." required className="text-xs" />
                    <button className="btn btn-primary text-xs !px-3 !py-1.5">Send</button>
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
                    className="grid size-8 sm:size-9 place-items-center rounded bg-[#29243d] text-white transition hover:bg-[#cf5036]"
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

      {!products.length && (
        <div className="mt-14 card p-10 grid place-items-center text-center text-slate-500 max-w-md mx-auto">
          <PackageSearch className="size-10 text-[#cf5036]" />
          <p className="mt-3 font-bold text-base text-slate-800">No matching products found.</p>
          <p className="mt-1 text-xs">Try selecting another category or clear your search keyword.</p>
          <Link href="/marketplace" className="btn btn-primary mt-4 text-xs font-bold">
            Reset Filters
          </Link>
        </div>
      )}
    </main>
  );
}
