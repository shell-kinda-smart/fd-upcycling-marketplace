"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("wishlist-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("wishlist-updated", callback);
    window.removeEventListener("storage", callback);
  };
}

function getWishlistCount(): number {
  try {
    const list = JSON.parse(localStorage.getItem("rethread_wishlist") || "[]");
    return Array.isArray(list) ? list.length : 0;
  } catch {
    return 0;
  }
}

function getServerSnapshot(): number {
  return 0;
}

export function WishlistHeaderCount() {
  const count = useSyncExternalStore(
    subscribe,
    getWishlistCount,
    getServerSnapshot,
  );

  return (
    <Link
      href="/wishlist"
      className="btn border border-[#29243d] !px-2.5 sm:!px-3 !py-2 text-xs flex items-center gap-1.5 transition hover:border-[#cf5036]"
      aria-label={`Wishlist with ${count} saved items`}
      title="View your saved items"
    >
      <Heart
        className={`size-4 transition ${
          count > 0 ? "fill-[#cf5036] text-[#cf5036]" : "text-slate-700"
        }`}
      />
      <span className="hidden sm:inline">Saved</span>
      <b className="bg-[#f3c94b] px-1.5 py-0.5 rounded-xs text-[11px] font-black text-slate-900">
        {count}
      </b>
    </Link>
  );
}
