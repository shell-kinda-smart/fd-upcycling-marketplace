import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  PackageOpen,
  ReceiptText,
  ShieldCheck,
  Truck,
  Lock,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/commerce";

export default async function Orders({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; pay_id?: string }>;
}) {
  const s = await auth();
  if (!s?.user.id) redirect("/signin");
  const params = await searchParams;

  const orders = await prisma.order.findMany({
    where: { buyerId: s.user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-3 sm:px-6 py-8 sm:py-14">
      {params.success && (
        <div className="mb-8 rounded-xl border-2 border-green-600 bg-green-50 p-4 sm:p-5 text-green-950 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 sm:size-6 shrink-0 text-green-600" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black">
                Payment Confirmed & Order Placed!
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-green-800">
                Your transaction has been securely processed via <strong>Razorpay</strong>. The maker has received your order and will prepare dispatch.
              </p>
              {params.pay_id && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-green-200/80 px-2.5 py-1 text-[11px] font-mono font-bold text-green-950 break-all">
                  <ShieldCheck className="size-3.5 text-green-800 shrink-0" />
                  Transaction Ref: {params.pay_id}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="eyebrow">ORDER HISTORY</p>
          <h1 className="mt-1.5 text-2xl sm:text-4xl font-black tracking-[-.05em] text-slate-900">
            Your orders.
          </h1>
        </div>
        <Link href="/marketplace" className="btn border border-[#29243d] text-xs font-bold self-start sm:self-auto">
          Continue shopping <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {orders.map((o) => (
          <article
            key={o.id}
            className="card overflow-hidden p-4 sm:p-6 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
              <div className="min-w-0">
                <small className="flex items-center gap-1.5 font-mono font-bold text-slate-600 text-xs truncate">
                  <ReceiptText className="size-3.5 text-[#cf5036] shrink-0" /> ORDER #
                  {o.id.slice(-8).toUpperCase()}
                </small>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                  <span>
                    Placed on {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-slate-700">
                    {o.items.length} {o.items.length === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {o.paymentMethod.toLowerCase().includes("razorpay") ? (
                  <span className="flex items-center gap-1 rounded bg-[#0c2340] px-2.5 py-1 text-[11px] font-bold text-white">
                    <Lock className="size-3 text-[#f3c94b]" /> Razorpay
                  </span>
                ) : (
                  <span className="rounded bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-800">
                    {o.paymentMethod}
                  </span>
                )}
                <b className="flex items-center gap-1 bg-[#f3c94b] px-2.5 py-1 text-[11px] font-black">
                  <CheckCircle2 className="size-3.5 text-slate-900" /> {o.status}
                </b>
              </div>
            </div>

            {/* Order Items with Images */}
            <div className="mt-3.5 space-y-2.5">
              {o.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded bg-[#fff5e9]/50 p-2 sm:p-2.5 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-[#d8e2df]">
                      {item.product?.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.productName}
                          width={48}
                          height={48}
                          className="h-12 w-12 object-cover"
                        />
                      ) : (
                        <span className="grid size-full place-items-center text-lg">
                          ♻
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <b className="block font-bold text-slate-900 truncate">{item.productName}</b>
                      <span className="text-[11px] text-slate-500">
                        Qty: {item.quantity} × {inr(item.price.toNumber())}
                      </span>
                    </div>
                  </div>
                  <strong className="text-xs sm:text-sm text-slate-900 shrink-0 font-bold">
                    {inr(item.price.toNumber() * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            {/* Footer with address and total */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <div className="flex items-start gap-1.5 min-w-0">
                <Truck className="size-3.5 shrink-0 text-slate-400 mt-0.5" />
                <span className="break-words">
                  Deliver to: <strong className="text-slate-800">{o.shippingAddress}</strong>
                </span>
              </div>
              <div className="text-right sm:shrink-0">
                <span className="text-slate-500 text-[11px]">Total: </span>
                <b className="text-base sm:text-lg font-black text-slate-900">
                  {inr(o.total.toNumber())}
                </b>
              </div>
            </div>

            {o.razorpayPaymentId && (
              <div className="mt-2.5 border-t border-dashed border-slate-200 pt-2 text-[10px] font-mono text-slate-500 break-all">
                Razorpay ID: <strong className="text-slate-700">{o.razorpayPaymentId}</strong>
                {o.razorpayOrderId && ` · Order ID: ${o.razorpayOrderId}`}
              </div>
            )}
          </article>
        ))}
      </div>

      {!orders.length && (
        <div className="card mt-9 grid place-items-center p-8 sm:p-12 text-center max-w-md mx-auto">
          <PackageOpen className="size-10 text-[#cf5036]" />
          <p className="mt-3 text-base font-bold text-slate-800">No orders yet.</p>
          <p className="mt-1 text-xs text-slate-500">
            Start browsing upcycled pieces created by student designers.
          </p>
          <Link href="/marketplace" className="btn btn-primary mt-4 text-xs font-bold">
            Explore marketplace <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </main>
  );
}
