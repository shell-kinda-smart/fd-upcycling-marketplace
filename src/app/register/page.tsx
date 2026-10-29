import Link from "next/link";
import { BadgeCheck, ShoppingBag, Store } from "lucide-react";
import { registerAction } from "@/app/actions";
export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;
  return (
    <main className="auth-shell">
      <section className="auth-aside">
        <p className="section-kicker">
          <BadgeCheck className="size-3.5" /> ReThread membership
        </p>
        <h1>Choose how you take part.</h1>
        <p>
          Buy one-of-one pieces, sell upcycled work, or do both from one
          account.
        </p>
        <div className="auth-role-preview">
          <span>
            <ShoppingBag className="size-4" /> Buyer: shop, save, order and
            trade.
          </span>
          <span>
            <Store className="size-4" /> Seller: publish, manage stock and
            accept swaps.
          </span>
        </div>
      </section>
      <section className="card auth-card">
        <p className="eyebrow">CREATE ACCOUNT</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-.05em]">
          Start your marketplace account.
        </h1>
        {q.error && (
          <p className="mt-4 bg-red-50 p-3 text-sm text-red-700">
            Check details or email already exists.
          </p>
        )}
        <form action={registerAction} className="mt-7 space-y-4">
          <label>
            Name
            <input className="mt-1" name="name" required />
          </label>
          <label>
            Email
            <input className="mt-1" name="email" type="email" required />
          </label>
          <label>
            Password
            <input
              className="mt-1"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </label>
          <label>
            Role
            <select className="mt-1" name="role">
              <option value="BOTH">Buyer & seller</option>
              <option value="BUYER">Buyer</option>
              <option value="CREATOR">Seller</option>
            </select>
          </label>
          <label>
            College
            <input className="mt-1" name="college" />
          </label>
          <button className="btn btn-primary w-full">Create account</button>
        </form>
        <p className="mt-5 text-center text-sm">
          Already joined?{" "}
          <Link className="font-bold text-[#cf5036]" href="/signin">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
