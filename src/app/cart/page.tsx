import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cartTotal, inr } from "@/lib/commerce";
import { removeCartItem } from "@/app/actions";
import { RazorpayCheckout } from "@/components/razorpay-checkout";

export default async function Cart({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const s = await auth();
  if (!s?.user.id) redirect("/signin");
  const q = searchParams ? await searchParams : {};
  const items = await prisma.cartItem.findMany({
    where: { userId: s.user.id },
    include: { product: true },
  });
  const total = cartTotal(
    items.map((x) => ({
      price: x.product.price.toNumber(),
      quantity: x.quantity,
    })),
  );
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-3 sm:px-6 py-8 sm:py-14">
      <p className="eyebrow">YOUR BAG</p>
      <h1 className="mt-1.5 text-3xl sm:text-5xl font-black tracking-[-.05em] text-slate-900">
        Cart & checkout.
      </h1>

      {q.error && (
        <div className="mt-4 rounded border-2 border-red-500 bg-red-50 p-3.5 text-xs font-bold text-red-900">
          ⚠️ Please check your shipping address: it must be at least 5 characters long.
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-3">
          {items.map((x) => (
            <article
              key={x.id}
              className="card relative grid grid-cols-[52px_1fr_auto] items-center gap-3 p-3.5 sm:grid-cols-[60px_1fr_auto_auto] sm:gap-4 sm:p-4"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-[#f1ddd0]">
                {x.product.imageUrl ? (
                  <Image
                    src={x.product.imageUrl}
                    alt={x.product.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-2xl">
                    {x.product.symbol}
                  </span>
                )}
              </div>
              <div className="min-w-0 pr-6 sm:pr-0">
                <b className="block text-xs sm:text-sm font-bold truncate text-slate-900">
                  {x.product.name}
                </b>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  {x.quantity} × {inr(x.product.price.toNumber())}
                </p>
              </div>
              <strong className="text-xs sm:text-sm font-bold text-slate-900">
                {inr(x.product.price.toNumber() * x.quantity)}
              </strong>
              <form
                action={removeCartItem}
                className="absolute right-2 top-2 sm:static"
              >
                <input type="hidden" name="id" value={x.id} />
                <button
                  className="grid size-7 sm:size-8 place-items-center text-red-500 transition hover:bg-red-50 rounded"
                  aria-label={`Remove ${x.product.name}`}
                  title="Remove"
                >
                  <Trash2 className="size-3.5 sm:size-4" />
                </button>
              </form>
            </article>
          ))}
          {!items.length && (
            <div className="card grid place-items-center p-8 sm:p-12 text-center">
              <ShoppingBag className="size-10 text-[#cf5036]" />
              <p className="mt-3 font-bold text-base text-slate-800">Your bag is empty.</p>
              <p className="mt-1 text-xs text-slate-500">Discover unique upcycled pieces crafted by independent artisans.</p>
              <Link className="btn btn-primary mt-5 text-xs font-bold" href="/marketplace">
                Browse products <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>

        <article className="card p-5 sm:p-6 h-fit w-full overflow-hidden">
          <p className="eyebrow flex items-center gap-1.5">
            <CreditCard className="size-3.5 text-[#cf5036]" /> ORDER SUMMARY
          </p>
          <b className="mt-2 block text-3xl font-black text-slate-900">{inr(total)}</b>
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-green-700 shrink-0" />
            <span>256-Bit SSL Encrypted Razorpay Checkout</span>
          </p>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <RazorpayCheckout
              total={total}
              user={{ name: s.user.name, email: s.user.email }}
              hasItems={items.length > 0}
            />
          </div>
          <LinkOrders />
        </article>
      </div>
    </main>
  );
}
function LinkOrders() {
  return (
    <Link
      href="/orders"
      className="mt-5 flex items-center gap-2 text-sm font-bold text-[#cf5036]"
    >
      View order history <ArrowRight className="size-4" />
    </Link>
  );
}
