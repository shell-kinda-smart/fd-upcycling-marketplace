"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
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

export function WishlistButton({
  productId,
  productName,
  className = "",
  size = "sm",
}: WishlistButtonProps) {
  const wishlistJson = useSyncExternalStore(
    subscribe,
    getWishlistSnapshot,
    getServerSnapshot,
  );

  const isSaved = wishlistJson.includes(`"${productId}"`);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(
        localStorage.getItem("rethread_wishlist") || "[]",
      );
      let updated: string[];
      if (saved.includes(productId)) {
        updated = saved.filter((id) => id !== productId);
      } else {
        updated = [...saved, productId];
      }
      localStorage.setItem("rethread_wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch {
      // Fallback
    }
  };

  const iconSizes = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5",
  };

  const btnSizes = {
    sm: "size-7 sm:size-8",
    md: "size-9",
    lg: "size-10",
  };

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      aria-label={
        isSaved
          ? `Remove ${productName || "item"} from favorites`
          : `Save ${productName || "item"} to favorites`
      }
      title={isSaved ? "Saved to favorites" : "Save to favorites"}
      className={`grid place-items-center rounded-full border border-slate-200 bg-white/90 backdrop-blur-xs transition hover:scale-110 active:scale-95 shadow-xs ${btnSizes[size]} ${className}`}
    >
      <Heart
        className={`${iconSizes[size]} transition ${
          isSaved
            ? "fill-[#cf5036] text-[#cf5036]"
            : "text-slate-600 hover:text-[#cf5036]"
        }`}
      />
    </button>
  );
}
