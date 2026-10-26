import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Save,
  UserRound,
  Package,
  ArrowRightLeft,
  ReceiptText,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/auth";
import { updateProfile } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export default async function Profile({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) redirect("/signin");
  const query = await searchParams;

  const isAdmin = user.role === "ADMIN";

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">PROFILE</p>
      <h1 className="mt-2 flex items-center gap-3 text-4xl font-black tracking-[-.06em] sm:text-6xl">
        <UserRound className="size-9 text-[#cf5036] sm:size-12" />
        Your identity.
      </h1>

      {/* Profile Card */}
      <article className="card mt-9 grid gap-8 p-6 sm:p-8 md:grid-cols-[180px_1fr] md:gap-10">
        <div>
          <div className="grid size-24 place-items-center rounded-full bg-[#29243d] text-2xl font-bold text-white shadow-md">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <p className="mt-4 text-xs font-mono font-semibold text-slate-500 break-all">
            {user.email}
          </p>
          <span className="mt-2 inline-block rounded bg-[#f3c94b] px-2.5 py-0.5 text-xs font-black text-[#29243d]">
            {user.role}
          </span>
        </div>

        <form action={updateProfile} className="grid gap-5">
          {query.saved && (
            <p className="rounded bg-green-100 p-3 text-sm font-bold text-green-800">
              Profile saved successfully.
            </p>
          )}
          {query.error && (
            <p className="rounded bg-red-100 p-3 text-sm font-bold text-red-800">
              Check the form fields.
            </p>
          )}
          <label>
            Name
            <input
              name="name"
              defaultValue={user.name}
              required
              minLength={2}
            />
          </label>
          <label>
            College / Institution
            <input name="college" defaultValue={user.college || ""} />
          </label>
          <label>
            Marketplace role
            <select name="role" defaultValue={user.role}>
              <option value="BUYER">Buyer</option>
              <option value="CREATOR">Creator</option>
              <option value="BOTH">Buyer and creator</option>
              {isAdmin && <option value="ADMIN">Admin</option>}
            </select>
          </label>
          <button className="btn btn-primary w-fit">
            <Save className="size-4" /> Save profile
          </button>
        </form>
      </article>

      {/* Account Navigation Quick Links */}
      <section className="mt-10">
        <p className="eyebrow">QUICK ACCESS</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Link
            href="/listings"
            className="card flex items-center justify-between p-4 transition hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <Package className="size-5 text-[#cf5036]" />
              <div>
                <b className="block text-sm">Your Listings</b>
                <span className="text-xs text-slate-500">Manage products</span>
              </div>
            </div>
            <ArrowRight className="size-4 text-slate-400" />
          </Link>

          <Link
            href="/trades"
            className="card flex items-center justify-between p-4 transition hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="size-5 text-purple-700" />
              <div>
                <b className="block text-sm">Trade Swaps</b>
                <span className="text-xs text-slate-500">Incoming & Sent</span>
              </div>
            </div>
            <ArrowRight className="size-4 text-slate-400" />
          </Link>

          <Link
            href="/orders"
            className="card flex items-center justify-between p-4 transition hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <ReceiptText className="size-5 text-emerald-700" />
              <div>
                <b className="block text-sm">Order History</b>
                <span className="text-xs text-slate-500">Receipts & Tracking</span>
              </div>
            </div>
            <ArrowRight className="size-4 text-slate-400" />
          </Link>
        </div>

        {isAdmin && (
          <div className="mt-4 rounded-xl border-2 border-purple-300 bg-purple-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-6 text-purple-700" />
                <div>
                  <b className="text-sm font-black text-purple-950">
                    Administrator Control Panel
                  </b>
                  <p className="text-xs text-purple-800">
                    You have platform moderation and order management rights.
                  </p>
                </div>
              </div>
              <Link
                href="/admin"
                className="btn btn-primary !bg-purple-800 text-xs hover:!bg-purple-900"
              >
                Open Admin Panel →
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
