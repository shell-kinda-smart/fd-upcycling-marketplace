import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PackageOpen, Plus, RefreshCw } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inr } from "@/lib/commerce";
import { updateProductStatus } from "@/app/actions";
export default async function Listings() {
  const s = await auth();
  if (!s?.user.id) redirect("/signin");
  const products = await prisma.product.findMany({
    where: { sellerId: s.user.id },
    orderBy: { createdAt: "desc" },
  });
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">PRODUCT MANAGEMENT</p>
      <h1 className="mt-2 text-4xl font-black tracking-[-.06em] sm:text-6xl">
        Your listings.
      </h1>
      <div className="mt-9 space-y-3">
        {products.map((p) => (
          <article
            key={p.id}
            className="card grid items-center gap-4 p-5 sm:grid-cols-[55px_1fr_auto]"
          >
            <span className="relative grid size-14 place-items-center overflow-hidden bg-[#f1ddd0] text-2xl">
              {p.imageUrl ? (
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                p.symbol
              )}
            </span>
            <div>
              <h2 className="font-bold">{p.name}</h2>
              <p className="text-sm text-slate-500">
                {p.category} · {inr(p.price.toNumber())}
              </p>
            </div>
            <form
              action={updateProductStatus}
              className="flex flex-wrap gap-2 sm:flex-nowrap"
            >
              <input type="hidden" name="id" value={p.id} />
              <select name="status" defaultValue={p.status}>
                <option>ACTIVE</option>
                <option>SOLD</option>
                <option>ARCHIVED</option>
              </select>
              <button className="btn border border-[#29243d]">
                <RefreshCw className="size-4" /> Update
              </button>
            </form>
          </article>
        ))}
        {!products.length && (
          <div className="card grid place-items-center p-10 text-center">
            <PackageOpen className="size-10 text-[#cf5036]" />
            <p className="mt-3 font-bold">No listings yet.</p>
            <Link className="btn btn-primary mt-5" href="/sell">
              <Plus className="size-4" /> Publish your first product
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
