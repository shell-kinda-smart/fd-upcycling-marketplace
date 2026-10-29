"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";
import { loginAction } from "@/app/actions";

export default function SignIn() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fillCredentials = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <main className="auth-shell auth-shell-compact">
      <section className="auth-aside">
        <p className="section-kicker">
          <ShieldCheck className="size-3.5" /> Secure workspace
        </p>
        <h1>Back to circular commerce.</h1>
        <p>
          Buyers, sellers and administrators each see the tools that match their
          account role.
        </p>
      </section>
      <section className="card auth-card">
        <p className="eyebrow">WELCOME BACK</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-.05em] sm:text-4xl">
          Sign in to ReThread.
        </h1>

        {error && (
          <p className="mt-4 rounded bg-red-50 p-3 text-xs font-bold text-red-700">
            ⚠️ Incorrect email or password.
          </p>
        )}
        {registered && (
          <p className="mt-4 rounded bg-green-50 p-3 text-xs font-bold text-green-700">
            ✓ Account created successfully! Please sign in.
          </p>
        )}

        {/* Quick Access Accounts */}
        <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50/70 p-3.5 text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <Sparkles className="size-3.5 text-amber-600" />
            <span>Quick Access Accounts (Click to Fill):</span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                fillCredentials("demo.maker@example.com", "DemoPass123!")
              }
              className="flex items-center justify-between rounded border border-amber-200 bg-white p-2 text-left transition hover:border-[#cf5036]"
            >
              <div>
                <b className="block text-slate-900">demo.maker@example.com</b>
                <span className="text-[10px] text-slate-500">
                  Role: ADMIN & SELLER
                </span>
              </div>
              <span className="rounded bg-[#f3c94b] px-1.5 py-0.5 text-[10px] font-bold text-[#29243d]">
                Auto Fill
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                fillCredentials("studio@rethread.demo", "StudioDemo123!")
              }
              className="flex items-center justify-between rounded border border-amber-200 bg-white p-2 text-left transition hover:border-[#cf5036]"
            >
              <div>
                <b className="block text-slate-900">studio@rethread.demo</b>
                <span className="text-[10px] text-slate-500">Role: SELLER</span>
              </div>
              <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                Auto Fill
              </span>
            </button>
          </div>
        </div>

        <form action={loginAction} className="mt-5 space-y-4">
          <label className="block text-xs font-bold">
            Email address
            <input
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-xs font-bold">
            Password
            <input
              className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <button className="btn btn-primary w-full py-3 text-sm font-bold">
            Sign in to account
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          New buyer or seller?{" "}
          <Link
            className="font-bold text-[#cf5036] hover:underline"
            href="/register"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
