import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ArrowRightLeft,
  CreditCard,
} from "lucide-react";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_.9fr] lg:gap-12">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="eyebrow">FD UPCYCLING MARKETPLACE</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
              CIRCULAR COMMERCE
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-[-.05em] text-slate-900 sm:text-5xl lg:text-6xl xl:text-7xl leading-tight">
            Old materials.
            <br />
            <span className="text-[#cf5036]">New stories.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600">
            A full-stack circular fashion marketplace where student designers
            and makers buy, sell, and trade upcycled pieces. Features verified
            creator profiles, secure <strong>Razorpay payment integration</strong>,
            and peer-to-peer trade proposals.
          </p>

          <div className="mt-7 flex flex-wrap gap-3 sm:gap-4">
            <Link className="btn btn-primary text-xs sm:text-sm font-bold" href="/marketplace">
              <ShoppingBag className="size-4" /> Explore marketplace
            </Link>
            <Link className="btn border border-[#29243d] text-xs sm:text-sm font-bold" href="/sell">
              <Sparkles className="size-4" /> Sell an item{" "}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-6 border-t border-slate-200/80 pt-6">
            <Stat
              icon={<CreditCard />}
              value="Razorpay"
              label="Secure Payments"
            />
            <Stat
              icon={<ArrowRightLeft />}
              value="P2P Swaps"
              label="Direct Trades"
            />
            <Stat
              icon={<ShieldCheck />}
              value="Verified"
              label="Maker Accounts"
            />
          </div>
        </div>

        {/* Hero Product Card with Real Image */}
        <div className="relative h-[380px] sm:h-[460px] lg:h-[500px] w-full overflow-hidden rounded-2xl sm:rounded-[2rem_2rem_5rem_2rem] border-2 border-[#29243d] bg-[#ead1ba] shadow-[8px_8px_0_#29243d18]">
          <Image
            src="/products/rethread-denim-revival-tote.jpg"
            alt="Denim Revival Tote"
            width={900}
            height={600}
            priority
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#29243d]/90 via-transparent to-black/20" />

          <div className="absolute left-4 top-4 sm:left-6 sm:top-6 rounded-full border border-[#29243d] bg-[#f3c94b] px-3 py-1 text-[11px] font-black text-[#29243d] shadow-sm z-10">
            ♻ 100% UPCYCLED DENIM
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-[#29243d]/95 p-4 sm:p-6 text-white backdrop-blur-xs z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <small className="font-bold text-[#f3c94b] uppercase tracking-wider text-[10px] sm:text-xs">
                  FEATURED DROP · BAGS
                </small>
                <b className="mt-0.5 block text-lg sm:text-2xl font-black">
                  Denim Revival Tote
                </b>
                <p className="mt-1 text-xs text-slate-300 line-clamp-1 sm:line-clamp-none">
                  Cleaned, cut, and reinforced discarded denim jeans.
                </p>
              </div>
              <Link
                href="/marketplace?category=Bags"
                className="btn btn-primary text-xs font-bold shrink-0 self-start sm:self-auto"
              >
                View Piece →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Explorer */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="border-b-2 border-[#29243d] pb-3">
          <p className="eyebrow">CURATED MATERIAL CATEGORIES</p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
            Browse by material focus.
          </h2>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            {
              name: "Bags",
              desc: "Totes, weekender duffels, slings & pouches",
              img: "/products/rethread-coffee-sack-backpack.jpg",
              count: "13 items",
            },
            {
              name: "Clothing",
              desc: "Reworked jackets, vests, shirts & trousers",
              img: "/products/rethread-denim-cutoff-jacket.jpg",
              count: "13 items",
            },
            {
              name: "Accessories",
              desc: "Jewelry, belts, wallets, cuffs & brooches",
              img: "/products/rethread-bottle-cap-studs.jpg",
              count: "12 items",
            },
            {
              name: "Home",
              desc: "Lamps, stools, coasters, mirrors & mats",
              img: "/products/rethread-newspaper-desk-lamp.jpg",
              count: "12 items",
            },
          ].map((cat) => (
            <Link
              key={cat.name}
              href={`/marketplace?category=${cat.name}`}
              className="card group overflow-hidden transition hover:-translate-y-1 block"
            >
              <div className="relative h-32 sm:h-40 w-full overflow-hidden bg-slate-100">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  width={400}
                  height={250}
                  className="h-32 sm:h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <b className="font-bold text-slate-900 text-xs sm:text-sm">{cat.name}</b>
                  <span className="text-[10px] font-bold text-slate-400">
                    {cat.count}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="border-l-2 border-[#cf5036] pl-2 sm:pl-3 min-w-0">
      <span className="mb-1 block text-[#cf5036] [&>svg]:size-3.5 sm:[&>svg]:size-4">{icon}</span>
      <b className="block text-xs sm:text-base font-black truncate">{value}</b>
      <small className="text-slate-500 text-[10px] sm:text-xs block truncate">{label}</small>
    </div>
  );
}
