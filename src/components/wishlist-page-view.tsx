"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ArrowLeft, Store, ArrowRight } from "lucide-react";
import { inr } from "@/lib/commerce";
import { AddToCartButton } from "@/components/add-to-cart-button";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  category: string;
  material: string;
  imageUrl: string | null;
  symbol: string;
  tradeEnabled: boolean;
}

interface WishlistPageViewProps {
  allProducts: ProductItem[];
  isLoggedIn: boolean;
}

function subscribe(callback: () => void) {
  window.addEventListener("wishlist-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("wishlist-updated", callback);
    window.removeEventListener("storage", callback);
  };
}

function getWishlistSnapshot(): string {
  try {
    return localStorage.getItem("rethread_wishlist") || "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

export function WishlistPageView({ allProducts, isLoggedIn }: WishlistPageViewProps) {
  const wishlistJson = useSyncExternalStore(
    subscribe,
    getWishlistSnapshot,
    getServerSnapshot,
  );

  let savedIds: string[] = [];
  try {
    savedIds = JSON.parse(wishlistJson);
  } catch {
    savedIds = [];
  }

  const savedProducts = allProducts.filter((p) => savedIds.includes(p.id));

  const removeSaved = (id: string) => {
    try {
      const updated = savedIds.filter((x) => x !== id);
      localStorage.setItem("rethread_wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch {
      // Fallback
    }
  };

  const clearAllSaved = () => {
    try {
      localStorage.setItem("rethread_wishlist", "[]");
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch {
      // Fallback
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#29243d] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#cf5036]">
            <Heart className="size-4 fill-[#cf5036] text-[#cf5036]" />
            <span>SAVED COLLECTION</span>
          </div>
          <h1 className="mt-1 text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Your Wishlist.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            {savedProducts.length} {savedProducts.length === 1 ? "piece" : "pieces"} saved from verified artisans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/marketplace"
            className="btn border border-[#29243d] !py-2 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" /> Continue Shopping
          </Link>
          {savedProducts.length > 0 && (
            <button
              type="button"
              onClick={clearAllSaved}
              className="text-xs font-bold text-slate-500 hover:text-red-600 transition"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Grid of Saved Items */}
      {savedProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {savedProducts.map((p) => (
            <article
              key={p.id}
              className="card group flex flex-col justify-between overflow-hidden shadow-xs hover:-translate-y-0.5 transition"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden bg-[#d8e2df]">
                  <Link href={`/product/${p.id}`} className="block size-full">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        width={400}
                        height={300}
                        className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="grid size-full place-items-center text-4xl">
                        {p.symbol}
                      </span>
                    )}
                  </Link>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeSaved(p.id)}
                    className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-white/90 shadow-sm text-slate-400 hover:text-red-600 transition"
                    title="Remove from saved"
                    aria-label={`Remove ${p.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>

                  {p.tradeEnabled && (
                    <span className="absolute left-2.5 top-2.5 rounded bg-[#f3c94b] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#29243d]">
                      Trade Open
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-3.5">
                  <span className="text-[11px] font-bold text-[#cf5036]">
                    {p.category}
                  </span>
                  <h3 className="mt-0.5 text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    <Link href={`/product/${p.id}`} className="hover:text-[#cf5036]">
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                    {p.material}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="border-t border-slate-100 p-3 pt-2 flex items-center justify-between">
                <b className="text-sm font-black text-slate-900">{inr(p.price)}</b>
                <AddToCartButton
                  productId={p.id}
                  productName={p.name}
                  variant="icon"
                  isLoggedIn={isLoggedIn}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="mt-16 card p-10 sm:p-14 text-center max-w-md mx-auto">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-rose-50 text-[#cf5036]">
            <Heart className="size-8" />
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-900">
            Your Wishlist is Empty
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            Discover rescued-material pieces on the marketplace and tap the heart icon on any product to save it here for later.
          </p>
          <Link
            href="/marketplace"
            className="btn btn-primary mt-6 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Store className="size-3.5" /> Explore Marketplace <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
