import Link from "next/link";
import { registerAction } from "@/app/actions";
export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;
  return (
    <main className="grid min-h-[calc(100vh-80px)] place-items-center p-6">
      <section className="card w-full max-w-md p-9">
        <p className="eyebrow">JOIN THE CIRCULAR MARKET</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-.05em]">
          Create your account.
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
              <option value="BOTH">Buyer & creator</option>
              <option value="BUYER">Buyer</option>
              <option value="CREATOR">Creator</option>
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
