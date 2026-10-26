import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldAlert,
  Users,
  ShoppingBag,
  CreditCard,
  Trash2,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/commerce";
import {
  adminUpdateProductStatus,
  adminDeleteProduct,
  adminUpdateOrderStatus,
  adminUpdateUserRole,
} from "@/app/actions";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!currentUser) redirect("/signin");

  const isAdmin = currentUser?.role === "ADMIN";

  // Fetch metrics
  const [totalProducts, activeProducts, soldProducts, totalUsers, orders, tradeCount] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.product.count({ where: { status: "SOLD" } }),
      prisma.user.count(),
      prisma.order.findMany({
        include: { buyer: true, items: true },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      prisma.tradeProposal.count(),
    ]);

  const totalRevenue = orders.reduce(
    (sum, o) => sum + o.total.toNumber(),
    0,
  );

  const allProducts = await prisma.product.findMany({
    include: { seller: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  if (!isAdmin) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-16 text-center">
        <div className="card p-10">
          <ShieldAlert className="mx-auto size-16 text-[#cf5036]" />
          <h1 className="mt-4 text-3xl font-black">Admin Access Required</h1>
          <p className="mt-2 text-slate-600">
            Your current account (<strong>{currentUser?.email}</strong>) has the role{" "}
            <span className="font-bold uppercase text-[#cf5036]">{currentUser?.role}</span>.
          </p>
          <div className="mt-6 rounded bg-[#fff5e9] p-5 text-left text-sm">
            <b className="block font-bold">Administrator Console Access:</b>
            <p className="mt-1 text-slate-600">
              Run this command in the terminal to grant admin privileges to your email:
            </p>
            <pre className="mt-2 rounded bg-[#29243d] p-3 text-xs text-white">
              npm run admin:grant -- {currentUser?.email}
            </pre>
            <p className="mt-2 text-xs text-slate-500">
              Or sign in with the pre-configured admin account from the Sign In page.
            </p>
          </div>
          <Link href="/marketplace" className="btn btn-primary mt-6 text-xs font-bold">
            Back to Marketplace <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-3 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-1.5 !text-purple-700">
            <Sparkles className="size-3.5" /> RE-THREAD CONTROL CENTER
          </p>
          <h1 className="mt-1.5 text-2xl sm:text-4xl font-black tracking-[-.05em] text-slate-900">
            Admin Dashboard.
          </h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-950">
            Admin: {currentUser?.name}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <article className="card p-4 sm:p-5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TOTAL CATALOG</p>
          <b className="mt-1.5 block text-2xl sm:text-3xl font-black text-slate-900">{totalProducts}</b>
          <span className="mt-1 block text-xs text-green-700">
            {activeProducts} Active · {soldProducts} Sold
          </span>
        </article>
        <article className="card p-4 sm:p-5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TOTAL ORDERS</p>
          <b className="mt-1.5 block text-2xl sm:text-3xl font-black text-slate-900">{orders.length}</b>
          <span className="mt-1 block text-xs text-slate-500">
            {inr(totalRevenue)} GMV
          </span>
        </article>
        <article className="card p-4 sm:p-5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">COMMUNITY USERS</p>
          <b className="mt-1.5 block text-2xl sm:text-3xl font-black text-slate-900">{totalUsers}</b>
          <span className="mt-1 block text-xs text-slate-500">
            Makers & Buyers
          </span>
        </article>
        <article className="card p-4 sm:p-5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TRADE OFFERS</p>
          <b className="mt-1.5 block text-2xl sm:text-3xl font-black text-slate-900">{tradeCount}</b>
          <span className="mt-1 block text-xs text-purple-700">
            Circular Swaps
          </span>
        </article>
      </div>

      {/* Product Moderation Table */}
      <section className="mt-10">
        <div className="border-b-2 border-[#29243d] pb-2.5">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="size-4 sm:size-5 text-[#cf5036]" /> Product Moderation
          </h2>
        </div>
        <div className="mt-4 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[#fff5e9] text-[11px] uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Seller</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
              {allProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-[#d8e2df]">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <span className="grid size-full place-items-center text-sm">
                            ♻
                          </span>
                        )}
                      </div>
                      <b className="font-bold">{p.name}</b>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-slate-600">
                    {p.seller?.name || "ReThread Studio"}
                  </td>
                  <td className="p-3 text-xs font-semibold">{p.category}</td>
                  <td className="p-3 font-mono font-bold text-xs">
                    {inr(p.price.toNumber())}
                  </td>
                  <td className="p-3">
                    <form action={adminUpdateProductStatus} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={p.id} />
                      <select
                        name="status"
                        defaultValue={p.status}
                        className="rounded border border-slate-300 p-1 text-xs"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SOLD">SOLD</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                      <button className="grid size-7 place-items-center rounded bg-slate-100 hover:bg-slate-200">
                        <RefreshCw className="size-3" />
                      </button>
                    </form>
                  </td>
                  <td className="p-3 text-right">
                    <form action={adminDeleteProduct} className="inline">
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        className="text-red-500 hover:text-red-700"
                        title="Delete product"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>

      {/* Orders Fulfillment Table */}
      <section className="mt-10">
        <div className="border-b-2 border-[#29243d] pb-2.5">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <CreditCard className="size-4 sm:size-5 text-[#cf5036]" /> Order Fulfillment & Payment Logs
          </h2>
        </div>
        <div className="mt-4 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[#fff5e9] text-[11px] uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Buyer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Gateway</th>
                  <th className="p-3">Payment Ref</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-xs font-bold text-slate-900">
                      #{o.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-3 text-xs">
                      <b className="text-slate-900">{o.buyer.name}</b>
                      <span className="block text-slate-500 text-[11px]">{o.buyer.email}</span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{inr(o.total.toNumber())}</td>
                    <td className="p-3">
                      <span className="rounded bg-[#0c2340] px-2 py-0.5 text-[10px] font-bold text-white">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-600 break-all">
                      {o.razorpayPaymentId || "N/A"}
                    </td>
                    <td className="p-3">
                      <form action={adminUpdateOrderStatus} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={o.id} />
                        <select
                          name="status"
                          defaultValue={o.status}
                          className="rounded border border-slate-300 p-1 text-xs"
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <button className="grid size-7 place-items-center rounded bg-slate-100 hover:bg-slate-200">
                          <RefreshCw className="size-3" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500 text-xs">
                      No orders placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* User Management Table */}
      <section className="mt-10 mb-8">
        <div className="border-b-2 border-[#29243d] pb-2.5">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Users className="size-4 sm:size-5 text-[#cf5036]" /> User Accounts & Roles
          </h2>
        </div>
        <div className="mt-4 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="bg-[#fff5e9] text-[11px] uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">College</th>
                  <th className="p-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold">{u.name}</td>
                  <td className="p-3 text-xs text-slate-600">{u.email}</td>
                  <td className="p-3 text-xs">{u.college || "Independent"}</td>
                  <td className="p-3">
                    <form action={adminUpdateUserRole} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="rounded border border-slate-300 p-1 text-xs"
                      >
                        <option value="BUYER">BUYER</option>
                        <option value="CREATOR">CREATOR</option>
                        <option value="BOTH">BOTH</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button className="grid size-7 place-items-center rounded bg-slate-100 hover:bg-slate-200">
                        <RefreshCw className="size-3" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    </main>
  );
}
