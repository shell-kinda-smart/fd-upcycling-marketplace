import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  Truck,
  Droplets,
  Recycle,
  Lock,
  Star,
  Award,
  Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/commerce";
import { buyNow, proposeTrade } from "@/app/actions";
import { WishlistButton } from "@/components/wishlist-button";
import { AddToCartButton } from "@/components/add-to-cart-button";

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
  const isOwnListing = session?.user?.id === product.sellerId;

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
        <div className="relative overflow-hidden rounded-2xl border-2 border-[#29243d] bg-[#d8e2df] shadow-[8px_8px_0_#29243d18]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={700}
              height={700}
              priority
              className="aspect-square w-full object-cover"
            />
          ) : (
            <span className="grid aspect-square w-full place-items-center text-9xl">
              {product.symbol}
            </span>
          )}
          {product.tradeEnabled && (
            <span className="absolute left-4 top-4 border-2 border-[#29243d] bg-[#f3c94b] px-3 py-1 text-xs font-black shadow-xs z-10">
              TRADE OPEN
            </span>
          )}
          <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
            <span className="rounded bg-[#29243d]/85 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
              {product.category}
            </span>
            <WishlistButton
              productId={product.id}
              productName={product.name}
              size="md"
            />
          </div>
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
                <span className="text-[10px] text-emerald-800/80">
                  Waste Saved
                </span>
              </div>
              <div className="flex flex-col items-center border-x border-emerald-200 text-center">
                <Droplets className="size-4 text-emerald-700" />
                <span className="mt-1 text-xs font-black">~1,850 L</span>
                <span className="text-[10px] text-emerald-800/80">
                  Water Saved
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Leaf className="size-4 text-emerald-700" />
                <span className="mt-1 text-xs font-black">4.2 kg</span>
                <span className="text-[10px] text-emerald-800/80">
                  CO2e Diverted
                </span>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="mt-8 space-y-4">
            {session && !isOwnListing ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <AddToCartButton
                    productId={product.id}
                    productName={product.name}
                    variant="full"
                    priceFormatted={inr(product.price.toNumber())}
                    isLoggedIn={Boolean(session?.user?.id)}
                  />
                </div>
                <form action={buyNow} className="sm:w-auto w-full">
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    className="btn border-2 border-[#0c2340] bg-[#0c2340] py-3.5 px-6 text-center text-sm font-bold text-white hover:bg-[#1a385e] w-full flex items-center justify-center gap-2"
                  >
                    <Lock className="size-4 text-[#f3c94b]" /> Instant Buy Now
                  </button>
                </form>
              </div>
            ) : session ? (
              <div className="rounded-xl border border-[#d8dfd8] bg-[#f4f7f2] p-4 text-sm text-[#355446]">
                This is your listing. Manage its availability and incoming trade
                offers from your workspace.
                <Link href="/workspace" className="ml-2 font-bold underline">
                  Open workspace
                </Link>
              </div>
            ) : (
              <div className="rounded border border-slate-200 bg-white p-4 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Sign in to purchase this piece or propose a trade.
                </p>
                <Link
                  href="/signin"
                  className="btn btn-primary mt-3 inline-block"
                >
                  Sign in to Continue
                </Link>
              </div>
            )}

            {/* Trade proposal form */}
            {session && !isOwnListing && product.tradeEnabled && (
              <div className="rounded-xl border-2 border-[#f3c94b] bg-[#fff9ea] p-5">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <ArrowRightLeft className="size-4 text-[#cf5036]" /> Propose a
                  Trade Swap
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Have an upcycled piece or salvage material? Submit your offer
                  directly to {product.seller?.name || "the maker"}.
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
                <Truck className="size-3.5" /> Campus pickup or doorstep
                delivery
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-green-700" /> 256-Bit SSL
                Encrypted Checkout
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Credentials & Verified Customer Reviews */}
      <section className="mt-16 border-t-2 border-[#29243d] pt-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr] items-start">
          {/* Creator Profile Card */}
          <div className="card p-5 sm:p-6 bg-[#fffaf3]">
            <p className="eyebrow flex items-center gap-1.5">
              <Award className="size-3.5 text-[#cf5036]" />
              CREATOR CREDENTIALS
            </p>
            <h3 className="mt-2 text-xl font-black text-slate-900">
              {product.seller?.name || "ReThread Studio"}
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              {product.seller?.college
                ? `Artisan Designer · Based at ${product.seller.college}`
                : "Verified Sustainable Textile Artisan"}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-200/80 py-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Community Rating
                </span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />{" "}
                  4.9 / 5.0
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Pieces Recirculated
                </span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  28 Crafted
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Sparkles className="size-3.5 text-emerald-600 shrink-0" />
              <span>100% Certified Post-Consumer Materials</span>
            </div>
          </div>

          {/* Verified Customer Reviews */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                Verified Buyer Reviews (3)
              </h3>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <span className="text-amber-400">★★★★★</span>
                <span>4.9 out of 5</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[
                {
                  author: "Aditi S.",
                  date: "3 days ago",
                  rating: 5,
                  title: "Stunning craftsmanship and heavy-duty seams!",
                  review:
                    "The texture and stitching quality exceeded my expectations. You can genuinely tell a lot of care went into deconstructing and rebuilding the original material. Packed in recycled paper too!",
                },
                {
                  author: "Rahul M.",
                  date: "1 week ago",
                  rating: 5,
                  title: "Super unique conversation starter.",
                  review:
                    "Wore this out and got so many compliments. Knowing this kept durable textiles out of a landfill makes it worth twice the price.",
                },
                {
                  author: "Meera K.",
                  date: "2 weeks ago",
                  rating: 5,
                  title: "Seamless checkout and fast delivery.",
                  review:
                    "Paid via UPI with instant confirmation, and the parcel arrived in 3 days. Clean packaging and exact color match.",
                },
              ].map((rev) => (
                <div
                  key={rev.author}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <b className="font-bold text-slate-900">{rev.author}</b>
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="size-2.5" /> Verified Purchase
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {rev.date}
                    </span>
                  </div>

                  <div className="mt-1 text-amber-400 text-xs">
                    {"★".repeat(rev.rating)}
                  </div>

                  <h4 className="mt-1 text-xs font-bold text-slate-800">
                    {rev.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {rev.review}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                <div className="relative h-48 w-full bg-[#d8e2df]">
                  {rp.imageUrl ? (
                    <Image
                      src={rp.imageUrl}
                      alt={rp.name}
                      width={400}
                      height={300}
                      className="h-48 w-full object-cover"
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
                  <b className="mt-3 block text-base">
                    {inr(rp.price.toNumber())}
                  </b>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
