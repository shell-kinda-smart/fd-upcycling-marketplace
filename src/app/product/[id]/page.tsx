import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  Leaf,
  Plus,
  ShieldCheck,
  Truck,
  Droplets,
  Recycle,
  Lock,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/commerce";
import { addToCart, buyNow, proposeTrade } from "@/app/actions";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          college: true,
          role: true,
        },
      },
    },
  });

  if (!product) notFound();

  // Find 3 related items from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
      status: "ACTIVE",
    },
    take: 3,
  });

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#cf5036]"
        >
          <ArrowLeft className="size-3.5" /> Back to Marketplace
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Left: Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-[#29243d] bg-[#d8e2df] shadow-[8px_8px_0_#29243d18]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <span className="grid size-full place-items-center text-9xl">
              {product.symbol}
            </span>
          )}
          {product.tradeEnabled && (
            <span className="absolute left-4 top-4 border-2 border-[#29243d] bg-[#f3c94b] px-3 py-1 text-xs font-black shadow-xs">
              TRADE OPEN
            </span>
          )}
          <span className="absolute right-4 top-4 rounded bg-[#29243d]/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
            {product.category}
          </span>
        </div>

        {/* Right: Details & Buying options */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#f1ddd0] px-2.5 py-1 text-xs font-bold text-[#cf5036]">
                {product.category}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">
                Created by {product.seller?.name || "ReThread Studio"}
                {product.seller?.college && ` (${product.seller.college})`}
              </span>
            </div>

            <h1 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-black tracking-[-.05em] text-slate-900 leading-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 sm:text-4xl">
                {inr(product.price.toNumber())}
              </span>
              <span className="text-xs text-green-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> Ready for dispatch
              </span>
            </div>

            {/* Rescued Material & Story */}
            <div className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-[#fffaf3] p-5">
              <div>
                <b className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Rescued Material Source:
                </b>
                <p className="mt-1 font-semibold text-slate-800">
                  {product.material}
                </p>
              </div>
              <div className="border-t border-slate-200/80 pt-3">
                <b className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Item Provenance & Craft Story:
                </b>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  {product.story}
                </p>
              </div>
            </div>

            {/* Eco Impact Stats */}
            <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3.5 text-emerald-950">
              <div className="flex flex-col items-center text-center">
                <Recycle className="size-4 text-emerald-700" />
                <span className="mt-1 text-xs font-black">0.8 kg</span>
                <span className="text-[10px] text-emerald-800/80">Waste Saved</span>
              </div>
              <div className="flex flex-col items-center border-x border-emerald-200 text-center">
                <Droplets className="size-4 text-emerald-700" />
                <span className="mt-1 text-xs font-black">~1,850 L</span>
                <span className="text-[10px] text-emerald-800/80">Water Saved</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Leaf className="size-4 text-emerald-700" />
                <span className="mt-1 text-xs font-black">4.2 kg</span>
                <span className="text-[10px] text-emerald-800/80">CO2e Diverted</span>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="mt-8 space-y-4">
            {session ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <form action={addToCart} className="flex-1">
                  <input type="hidden" name="productId" value={product.id} />
                  <button className="btn btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2">
                    <Plus className="size-4" /> Add to Bag · {inr(product.price.toNumber())}
                  </button>
                </form>
                <form action={buyNow} className="sm:w-auto w-full">
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    className="btn border-2 border-[#0c2340] bg-[#0c2340] py-3.5 px-6 text-center text-sm font-bold text-white hover:bg-[#1a385e] w-full flex items-center justify-center gap-2"
                  >
                    <Lock className="size-4 text-[#f3c94b]" /> Buy with Razorpay
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded border border-slate-200 bg-white p-4 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Sign in to purchase this piece or propose a trade.
                </p>
                <Link href="/signin" className="btn btn-primary mt-3 inline-block">
                  Sign in to Continue
                </Link>
              </div>
            )}

            {/* Trade proposal form */}
            {session && product.tradeEnabled && (
              <div className="rounded-xl border-2 border-[#f3c94b] bg-[#fff9ea] p-5">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <ArrowRightLeft className="size-4 text-[#cf5036]" /> Propose a
                  Trade Swap
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Have an upcycled piece or salvage material? Submit your offer directly to {product.seller?.name || "the maker"}.
                </p>
                <form action={proposeTrade} className="mt-3 space-y-2">
                  <input type="hidden" name="productId" value={product.id} />
                  <textarea
                    name="offerText"
                    placeholder="Describe what you want to trade (e.g. vintage Levi's chore coat, handwoven scarf)..."
                    className="w-full rounded border border-amber-300 bg-white p-2.5 text-xs focus:ring-2 focus:ring-[#cf5036]"
                    rows={2}
                    required
                  />
                  <button className="btn btn-primary text-xs font-bold">
                    Send Trade Proposal
                  </button>
                </form>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1">
                <Truck className="size-3.5" /> Campus pickup or doorstep delivery
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-green-700" /> Razorpay 256-Bit SSL Protected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t-2 border-[#29243d] pt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">
              More {product.category} in Upcycling
            </h2>
            <Link
              href={`/marketplace?category=${product.category}`}
              className="text-xs font-bold text-[#cf5036] hover:underline"
            >
              View all in {product.category} →
            </Link>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={`/product/${rp.id}`}
                className="card overflow-hidden transition hover:-translate-y-1"
              >
                <div className="relative h-48 bg-[#d8e2df]">
                  {rp.imageUrl ? (
                    <Image
                      src={rp.imageUrl}
                      alt={rp.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid size-full place-items-center text-4xl">
                      {rp.symbol}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <b className="block text-sm">{rp.name}</b>
                  <p className="mt-1 text-xs text-slate-500">{rp.material}</p>
                  <b className="mt-3 block text-base">{inr(rp.price.toNumber())}</b>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
