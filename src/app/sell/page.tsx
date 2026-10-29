import { redirect } from "next/navigation";
import { PackagePlus, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { createProduct } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { canSell } from "@/lib/access";

export default async function Sell({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!canSell(user?.role)) redirect("/workspace?access=seller");
  const q = searchParams ? await searchParams : {};

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
      <div>
        <p className="eyebrow">SELLER STUDIO</p>
        <h1 className="mt-3 text-4xl font-black leading-[.95] tracking-[-.07em] sm:text-6xl">
          Made something worth sharing?
        </h1>
        <p className="mt-6 text-slate-500">
          List an upcycled creation in minutes. The product goes live for
          shoppers once you publish it, and you retain control of its status.
        </p>
        <div className="mt-10 space-y-5">
          {[
            ["01", "Describe your creation and set a price"],
            ["02", "Publish instantly to the marketplace"],
            ["03", "Track sales and manage your listings"],
          ].map(([n, t]) => (
            <p key={n} className="flex items-center gap-4">
              <b className="grid size-9 place-items-center bg-[#f3c94b]">{n}</b>
              <strong>{t}</strong>
            </p>
          ))}
        </div>
      </div>

      <article className="card p-6 sm:p-8">
        <p className="eyebrow">NEW LISTING</p>
        <h2 className="mt-2 flex items-center gap-3 text-2xl font-bold">
          <PackagePlus className="size-6 text-[#cf5036]" /> Add upcycled product
        </h2>

        {q.error && (
          <div className="mt-4 rounded border-2 border-red-500 bg-red-50 p-3 text-xs font-bold text-red-900">
            ⚠️ Please check your details: name needs at least 2 characters,
            material at least 3 characters, story at least 10 characters, and
            price must be greater than zero.
          </div>
        )}

        <form action={createProduct} className="mt-7 space-y-4">
          <label>
            Product name
            <input className="mt-1" name="name" required />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label>
              Price
              <input
                className="mt-1"
                name="price"
                type="number"
                min="1"
                required
              />
            </label>
            <label>
              Category
              <select className="mt-1" name="category">
                {["Bags", "Clothing", "Accessories", "Home"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Rescued material
            <input className="mt-1" name="material" required />
          </label>

          <label>
            Image URL or Local Product Path{" "}
            <span className="text-xs text-slate-400">
              (optional, e.g. /products/rethread-denim-revival-tote.jpg or
              https://...)
            </span>
            <input
              className="mt-1"
              name="imageUrl"
              type="text"
              placeholder="/products/rethread-denim-revival-tote.jpg"
            />
          </label>

          <label>
            Product story
            <textarea className="mt-1 min-h-28" name="story" required />
          </label>

          <label className="flex items-center gap-2">
            <input className="!w-auto" name="tradeEnabled" type="checkbox" />
            Accept trade proposals
          </label>

          <button className="btn btn-primary w-full">
            <Sparkles className="size-4" /> Publish product
          </button>
        </form>
      </article>
    </main>
  );
}
