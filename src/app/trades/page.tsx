import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Clock,
  PackageOpen,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/commerce";
import { acceptTrade, rejectTrade } from "@/app/actions";

export default async function Trades() {
  const session = await auth();
  if (!session?.user.id) redirect("/signin");

  const userId = session.user.id;

  // 1. Proposals received for items this user is selling
  const incomingProposals = await prisma.tradeProposal.findMany({
    where: {
      product: {
        sellerId: userId,
      },
    },
    include: {
      product: true,
      requester: {
        select: {
          name: true,
          email: true,
          college: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Proposals this user has sent for other items
  const outgoingProposals = await prisma.tradeProposal.findMany({
    where: {
      requesterId: userId,
    },
    include: {
      product: {
        include: {
          seller: {
            select: {
              name: true,
              college: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">CIRCULAR TRADING HUB</p>
      <h1 className="mt-2 text-4xl font-black tracking-[-.06em] sm:text-6xl">
        Trade proposals.
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Exchange upcycled pieces directly with fellow creators and students. Accept
        an offer to finalize the swap and mark the item as traded.
      </p>

      {/* Section 1: Received Proposals */}
      <section className="mt-12">
        <div className="flex items-center justify-between border-b-2 border-[#29243d] pb-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="size-5 text-[#cf5036]" /> Offers on Your Items
            <span className="rounded bg-[#f3c94b] px-2 py-0.5 text-xs font-black">
              {incomingProposals.length}
            </span>
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          {incomingProposals.map((trade) => (
            <article
              key={trade.id}
              className="card grid items-center gap-5 p-5 md:grid-cols-[80px_1fr_auto]"
            >
              <div className="relative size-20 overflow-hidden rounded bg-[#d8e2df]">
                {trade.product.imageUrl ? (
                  <Image
                    src={trade.product.imageUrl}
                    alt={trade.product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-2xl">
                    ♻
                  </span>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <b className="text-base">{trade.product.name}</b>
                  <span className="text-xs text-slate-500">
                    ({inr(trade.product.price.toNumber())})
                  </span>
                  <StatusBadge status={trade.status} />
                </div>

                <div className="mt-2 rounded bg-[#fff5e9] p-3 text-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Buyer&apos;s Offer:
                  </p>
                  <p className="mt-1 font-medium text-slate-800">
                    &ldquo;{trade.offerText}&rdquo;
                  </p>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Offered by <strong>{trade.requester.name}</strong>
                  {trade.requester.college && ` (${trade.requester.college})`} ·{" "}
                  {new Date(trade.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {trade.status === "PENDING" ? (
                  <>
                    <form action={acceptTrade}>
                      <input type="hidden" name="tradeId" value={trade.id} />
                      <button className="btn btn-primary text-xs font-bold !bg-green-700 hover:!bg-green-800">
                        <CheckCircle2 className="size-4" /> Accept Trade
                      </button>
                    </form>
                    <form action={rejectTrade}>
                      <input type="hidden" name="tradeId" value={trade.id} />
                      <button className="btn border border-red-300 text-xs font-bold text-red-600 hover:bg-red-50">
                        <XCircle className="size-4" /> Decline
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-xs font-bold text-slate-500">
                    {trade.status === "ACCEPTED" ? "Trade Completed" : "Declined"}
                  </div>
                )}
              </div>
            </article>
          ))}

          {!incomingProposals.length && (
            <div className="card p-8 text-center text-slate-500">
              <PackageOpen className="mx-auto size-8 text-slate-400" />
              <p className="mt-2 text-sm font-bold">No incoming offers yet.</p>
              <p className="text-xs">
                Ensure your listings have &ldquo;Accept trade proposals&rdquo; enabled in Sell.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Sent Proposals */}
      <section className="mt-14">
        <div className="flex items-center justify-between border-b-2 border-[#29243d] pb-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="size-5 text-[#cf5036]" /> Offers You Sent
            <span className="rounded bg-[#f3c94b] px-2 py-0.5 text-xs font-black">
              {outgoingProposals.length}
            </span>
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          {outgoingProposals.map((trade) => (
            <article
              key={trade.id}
              className="card grid items-center gap-5 p-5 md:grid-cols-[70px_1fr_auto]"
            >
              <div className="relative size-16 overflow-hidden rounded bg-[#d8e2df]">
                {trade.product.imageUrl ? (
                  <Image
                    src={trade.product.imageUrl}
                    alt={trade.product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-xl">
                    ♻
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <b className="font-bold">{trade.product.name}</b>
                  <StatusBadge status={trade.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Seller: {trade.product.seller?.name || "ReThread Studio"} · Listed at{" "}
                  {inr(trade.product.price.toNumber())}
                </p>
                <p className="mt-2 text-xs italic text-slate-700">
                  Your offer: &ldquo;{trade.offerText}&rdquo;
                </p>
              </div>

              <div className="text-right">
                <small className="text-xs text-slate-400">
                  {new Date(trade.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </small>
              </div>
            </article>
          ))}

          {!outgoingProposals.length && (
            <div className="card p-8 text-center text-slate-500">
              <p className="text-sm font-bold">You haven&apos;t sent any trade offers.</p>
              <Link href="/marketplace" className="btn btn-primary mt-3 text-xs inline-flex items-center gap-1.5">
                Browse Trade-enabled Items <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: "PENDING" | "ACCEPTED" | "REJECTED" }) {
  if (status === "ACCEPTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-800">
        <CheckCircle2 className="size-3" /> ACCEPTED
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">
        <XCircle className="size-3" /> DECLINED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
      <Clock className="size-3" /> PENDING REVIEW
    </span>
  );
}
