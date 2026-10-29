import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutView } from "@/components/checkout-view";
import { canBuy } from "@/lib/access";

export default async function Cart({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const s = await auth();
  if (!s?.user?.id) redirect("/signin");
  const q = searchParams ? await searchParams : {};
  const [items, user] = await Promise.all([
    prisma.cartItem.findMany({
      where: { userId: s.user.id },
      include: { product: true },
      orderBy: { product: { createdAt: "desc" } },
    }),
    prisma.user.findUnique({
      where: { id: s.user.id },
      select: { id: true, name: true, email: true, college: true, role: true },
    }),
  ]);
  if (!canBuy(user?.role)) redirect("/workspace?access=buyer");

  const cleanItems = items.map((x) => ({
    id: x.id,
    quantity: x.quantity,
    product: {
      id: x.product.id,
      name: x.product.name,
      price: Number(x.product.price),
      category: x.product.category,
      material: x.product.material,
      imageUrl: x.product.imageUrl || null,
      symbol: x.product.symbol,
      tradeEnabled: Boolean(x.product.tradeEnabled),
    },
  }));

  const cleanUser = {
    name: user?.name || s.user.name || null,
    email: user?.email || s.user.email || null,
    college: user?.college || null,
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-3 sm:px-6 py-8 sm:py-12">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#29243d] pb-4">
        <div>
          <p className="eyebrow">SHOPPING BAG & SECURE CHECKOUT</p>
          <h1 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Cart & Checkout
          </h1>
        </div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#cf5036] transition"
        >
          <ArrowLeft className="size-3.5" /> Continue Shopping
        </Link>
      </div>

      {q.error && (
        <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-50 p-3.5 text-xs font-bold text-red-900">
          ⚠️{" "}
          {q.error === "own-listing"
            ? "A seller cannot order their own listing. Remove that item to continue."
            : "Please check your shipping address: it must be at least 5 characters long."}
        </div>
      )}

      <CheckoutView items={cleanItems} user={cleanUser} />
    </main>
  );
}
