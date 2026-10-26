"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Loader2, ShoppingBag } from "lucide-react";
import { addToCartDirect } from "@/app/actions";

interface AddToCartButtonProps {
  productId: string;
  productName?: string;
  variant?: "icon" | "full";
  priceFormatted?: string;
  className?: string;
  isLoggedIn?: boolean;
}

export function AddToCartButton({
  productId,
  productName = "Product",
  variant = "icon",
  priceFormatted,
  className = "",
  isLoggedIn = true,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push(`/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await addToCartDirect(productId);
        if (res.requireAuth) {
          router.push("/signin");
          return;
        }

        if (res.success) {
          setIsSuccess(true);
          setToastMessage(`Added "${productName}" to bag!`);

          // Emit global cart update event for any listeners
          window.dispatchEvent(new Event("cart-updated"));

          // Auto-hide success state after 2.2s
          setTimeout(() => {
            setIsSuccess(false);
            setToastMessage(null);
          }, 2200);
        }
      } catch {
        // Fallback error handling
      }
    });
  };

  if (variant === "full") {
    return (
      <div className="relative w-full">
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className={`btn w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition duration-200 active:scale-98 ${
            isSuccess
              ? "!bg-emerald-600 !text-white border-emerald-600"
              : "!bg-[#29243d] !text-white hover:!bg-[#cf5036]"
          } ${className}`}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin text-white" />
              <span>Adding to Bag...</span>
            </>
          ) : isSuccess ? (
            <>
              <Check className="size-4 text-white stroke-[3]" />
              <span>Added to Bag! ✓</span>
            </>
          ) : (
            <>
              <Plus className="size-4" />
              <span>
                Add to Bag {priceFormatted ? `· ${priceFormatted}` : ""}
              </span>
            </>
          )}
        </button>

        {/* Inline Confirmation Toast */}
        {toastMessage && (
          <div className="absolute -bottom-10 left-0 right-0 z-20 flex items-center justify-between rounded bg-[#0c2340] px-3 py-1.5 text-xs text-white shadow-lg animate-in fade-in slide-in-from-top-1">
            <span className="truncate">{toastMessage}</span>
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="ml-2 shrink-0 font-bold text-[#f3c94b] hover:underline flex items-center gap-1"
            >
              <ShoppingBag className="size-3" /> View Bag →
            </button>
          </div>
        )}
      </div>
    );
  }

  // Icon Variant (used in product cards in marketplace & wishlist)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`grid size-8 sm:size-9 place-items-center rounded transition duration-200 active:scale-95 shadow-xs ${
          isSuccess
            ? "!bg-emerald-600 !text-white scale-105"
            : "!bg-[#29243d] !text-white hover:!bg-[#cf5036]"
        } ${className}`}
        aria-label={`Add ${productName} to bag`}
        title={isSuccess ? "Added to bag!" : "Add to bag"}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin text-white" />
        ) : isSuccess ? (
          <Check className="size-4 text-white stroke-[3]" />
        ) : (
          <Plus className="size-4" />
        )}
      </button>

      {/* Floating mini popover when clicked from grid */}
      {isSuccess && (
        <div className="absolute bottom-full right-0 mb-2 z-30 whitespace-nowrap rounded-md bg-[#0c2340] px-2.5 py-1 text-[11px] font-bold text-white shadow-xl flex items-center gap-1.5 animate-in fade-in zoom-in-95">
          <Check className="size-3 text-emerald-400 stroke-[3]" />
          <span>Added!</span>
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="text-[#f3c94b] hover:underline ml-1"
          >
            Bag →
          </button>
        </div>
      )}
    </div>
  );
}
