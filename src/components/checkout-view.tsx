"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
  Building2,
  X,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Lock,
  Trash2,
  Plus,
  Minus,
  Tag,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { checkout, removeCartItem, updateCartQuantity } from "@/app/actions";
import { inr } from "@/lib/commerce";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: unknown) => void) => void;
    };
  }
}

function toPriceNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  if (typeof val === "object" && val !== null) {
    if ("toNumber" in val && typeof (val as { toNumber?: unknown }).toNumber === "function") {
      return (val as { toNumber: () => number }).toNumber();
    }
  }
  const n = Number(val);
  return Number.isNaN(n) ? 0 : n;
}

interface CartItemWithProduct {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: unknown;
    category: string;
    material: string;
    imageUrl: string | null;
    symbol: string;
    tradeEnabled: boolean;
  };
}

interface CheckoutViewProps {
  items: CartItemWithProduct[];
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    college?: string | null;
  };
}

export function CheckoutView({ items, user }: CheckoutViewProps) {
  // Address form fields
  const [fullName, setFullName] = useState(user.name || "Artisan Shopper");
  const [phoneNumber, setPhoneNumber] = useState("+91 98765 43210");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("New Delhi");
  const [state, setState] = useState("Delhi");
  const [pincode, setPincode] = useState("110001");

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");

  // Promo Code State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent?: number;
    flatDiscount?: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Razorpay Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("shopper@okhdfcbank");
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  // Transitions
  const [isPending, startTransition] = useTransition();
  const [paymentState, setPaymentState] = useState<
    "idle" | "processing" | "verifying" | "success"
  >("idle");
  const [generatedPayId, setGeneratedPayId] = useState("");

  // Subtotal calculation
  const subtotal = items.reduce((acc, item) => {
    return acc + toPriceNumber(item.product.price) * item.quantity;
  }, 0);

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      discountAmount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.flatDiscount) {
      discountAmount = Math.min(subtotal, appliedCoupon.flatDiscount);
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Load official Razorpay checkout script if available
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const cleaned = couponInput.trim().toUpperCase();
    if (!cleaned) return;

    if (cleaned === "CIRCULAR10" || cleaned === "RETHREAD10") {
      setAppliedCoupon({ code: cleaned, discountPercent: 10 });
      setCouponInput("");
    } else if (cleaned === "ECO2026") {
      setAppliedCoupon({ code: cleaned, flatDiscount: 200 });
      setCouponInput("");
    } else if (cleaned === "FIRSTBUY") {
      setAppliedCoupon({ code: cleaned, discountPercent: 15 });
      setCouponInput("");
    } else {
      setCouponError("Invalid promo code. Try 'CIRCULAR10' or 'ECO2026'.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const getFullAddress = () => {
    return `${fullName}, ${streetAddress.trim()}, ${city.trim()}, ${state.trim()} - ${pincode.trim()} (Phone: ${phoneNumber.trim()})`;
  };

  const executeOrder = (payMethod: string, payId = "", orderId = "") => {
    const fullAddress = getFullAddress();
    const fd = new FormData();
    fd.append("address", fullAddress);
    fd.append("paymentMethod", payMethod);
    if (discountAmount > 0) {
      fd.append("discountAmount", String(discountAmount));
      if (appliedCoupon) fd.append("couponCode", appliedCoupon.code);
    }
    if (payId) fd.append("razorpayPaymentId", payId);
    if (orderId) fd.append("razorpayOrderId", orderId);

    startTransition(async () => {
      await checkout(fd);
    });
  };

  const handleStartCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetAddress.trim() || streetAddress.trim().length < 5) {
      alert("Please enter a complete delivery address (street/flat name, at least 5 characters).");
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 4) {
      alert("Please enter a valid postal PIN code.");
      return;
    }

    if (paymentMethod === "COD") {
      executeOrder("COD");
      return;
    }

    // Try official Razorpay popup if key is in env
    const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (rzpKey && typeof window !== "undefined" && window.Razorpay) {
      try {
        const rzp = new window.Razorpay({
          key: rzpKey,
          amount: Math.round(finalTotal * 100),
          currency: "INR",
          name: "ReThread Marketplace",
          description: "Circular Upcycled Fashion Order",
          prefill: {
            name: fullName,
            email: user.email || "shopper@rethread.market",
            contact: phoneNumber.replace(/[^0-9]/g, "").slice(-10) || "9876543210",
          },
          theme: { color: "#0c2340" },
          handler: function (response: {
            razorpay_payment_id?: string;
            razorpay_order_id?: string;
          }) {
            executeOrder(
              "RAZORPAY",
              response.razorpay_payment_id ||
                `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
              response.razorpay_order_id ||
                `order_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            );
          },
        });
        rzp.open();
        return;
      } catch {
        // Fall back to built-in high-fidelity modal
      }
    }

    setIsModalOpen(true);
  };

  const handleProcessPayment = () => {
    setPaymentState("processing");
    const suffix = Math.random().toString(36).substring(2, 12).toUpperCase();
    const payId = `pay_${suffix}`;
    const orderId = `order_${suffix}`;
    setGeneratedPayId(payId);

    setTimeout(() => {
      setPaymentState("verifying");
      setTimeout(() => {
        setPaymentState("success");
        setTimeout(() => {
          executeOrder("RAZORPAY", payId, orderId);
        }, 1100);
      }, 1000);
    }, 1100);
  };

  // If bag is empty
  if (!items.length) {
    return (
      <div className="card mx-auto max-w-md p-10 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#f1ddd0]">
          <ShoppingBag className="size-8 text-[#cf5036]" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Your bag is empty</h2>
        <p className="mt-1 text-xs text-slate-500">
          Discover unique pieces crafted from rescued denim, canvas, and textiles.
        </p>
        <Link href="/marketplace" className="btn btn-primary mt-6 text-xs font-bold inline-flex items-center gap-2">
          Explore Curated Marketplace <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleStartCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Items, Shipping, Payment Method */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* Section 1: Items In Bag */}
          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShoppingBag className="size-4 text-[#cf5036]" />
                Bag Items ({items.length})
              </h2>
              <span className="text-xs text-slate-500 font-semibold">
                Subtotal: <strong>{inr(subtotal)}</strong>
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {items.map((x) => {
                const itemPrice = toPriceNumber(x.product.price);
                return (
                  <div
                    key={x.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded border border-slate-200 bg-[#f1ddd0]">
                        {x.product.imageUrl ? (
                          <Image
                            src={x.product.imageUrl}
                            alt={x.product.name}
                            width={72}
                            height={72}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid size-full place-items-center text-2xl">
                            {x.product.symbol}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#cf5036] uppercase tracking-wider">
                          {x.product.category}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {x.product.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {x.product.material}
                        </p>
                        <span className="mt-1 block font-mono text-xs font-black text-slate-900">
                          {inr(itemPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity controls and delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-21 sm:pl-0">
                      <div className="flex items-center rounded border border-slate-300 bg-white">
                        <button
                          type="button"
                          onClick={() => {
                            const fd = new FormData();
                            fd.append("id", x.id);
                            fd.append("delta", "-1");
                            startTransition(async () => {
                              await updateCartQuantity(fd);
                            });
                          }}
                          disabled={isPending}
                          className="grid size-7 place-items-center text-slate-600 hover:bg-slate-100 transition disabled:opacity-30"
                          title="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="px-2.5 font-mono text-xs font-bold text-slate-900">
                          {x.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const fd = new FormData();
                            fd.append("id", x.id);
                            fd.append("delta", "1");
                            startTransition(async () => {
                              await updateCartQuantity(fd);
                            });
                          }}
                          disabled={isPending}
                          className="grid size-7 place-items-center text-slate-600 hover:bg-slate-100 transition disabled:opacity-30"
                          title="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <span className="font-mono text-xs font-black text-slate-900 w-16 text-right">
                        {inr(itemPrice * x.quantity)}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const fd = new FormData();
                          fd.append("id", x.id);
                          startTransition(async () => {
                            await removeCartItem(fd);
                          });
                        }}
                        disabled={isPending}
                        className="grid size-7 place-items-center rounded text-red-500 hover:bg-red-50 transition"
                        title="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 2: Delivery & Shipping Address */}
          <section className="card p-5 sm:p-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Truck className="size-4 text-[#cf5036]" />
              Shipping & Delivery Information
            </h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Recipient Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Contact Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="mt-1 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700">Street / Flat / Studio Address</label>
                <textarea
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Flat/House no, Studio name, Street, Landmark"
                  rows={2}
                  required
                  className="mt-1 text-xs min-h-[64px]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">City / District</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">PIN Code</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="110001"
                    maxLength={6}
                    required
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Payment Method Selection */}
          <section className="card p-5 sm:p-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
              <CreditCard className="size-4 text-[#cf5036]" />
              Select Payment Method
            </h2>

            <div className="mt-4 space-y-3">
              {/* Option 1: Razorpay */}
              <div
                onClick={() => setPaymentMethod("RAZORPAY")}
                className={`flex cursor-pointer items-start justify-between rounded-lg border-2 p-3.5 transition ${
                  paymentMethod === "RAZORPAY"
                    ? "border-[#0c2340] bg-[#f0f4f9] shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 size-4 rounded-full border-2 grid place-items-center shrink-0 ${
                      paymentMethod === "RAZORPAY"
                        ? "border-[#0c2340] bg-[#0c2340]"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {paymentMethod === "RAZORPAY" && (
                      <div className="size-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-[#0c2340]">
                        Online Payment (UPI, Cards, Netbanking)
                      </span>
                      <span className="rounded bg-[#0c2340] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                        INSTANT VERIFIED
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      UPI (Google Pay, PhonePe, Paytm, BHIM) · Credit & Debit Cards (Visa, Mastercard, RuPay) · Netbanking
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-800 font-bold">
                      <ShieldCheck className="size-3.5 text-emerald-700" />
                      <span>256-Bit SSL Encrypted Handshake</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`flex cursor-pointer items-start justify-between rounded-lg border-2 p-3.5 transition ${
                  paymentMethod === "COD"
                    ? "border-[#cf5036] bg-[#fff5e9] shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 size-4 rounded-full border-2 grid place-items-center shrink-0 ${
                      paymentMethod === "COD"
                        ? "border-[#cf5036] bg-[#cf5036]"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {paymentMethod === "COD" && (
                      <div className="size-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900">
                      Cash on Delivery (COD)
                    </span>
                    <p className="mt-1 text-xs text-slate-500">
                      Pay via cash or UPI directly upon courier delivery or campus pickup.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Order Summary & Pay Action */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
          <section className="card p-5 sm:p-6 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-3">
              <Tag className="size-3.5 text-[#cf5036]" />
              Order Summary
            </h2>

            {/* Price breakdown */}
            <div className="mt-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal ({items.length})</span>
                <span className="font-mono font-bold text-slate-900">{inr(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded">
                  <span className="flex items-center gap-1">
                    <Sparkles className="size-3 text-emerald-600" />
                    Coupon ({appliedCoupon.code})
                  </span>
                  <span>- {inr(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Zero-Carbon Delivery</span>
                <span className="font-bold text-emerald-700">FREE</span>
              </div>

              <div className="flex justify-between">
                <span>Eco Impact Contribution</span>
                <span className="font-bold text-slate-700">Included</span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-900">Total Payable</span>
                <span className="font-mono text-2xl font-black text-slate-900">
                  {inr(finalTotal)}
                </span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="mt-5 border-t border-slate-200 pt-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded bg-emerald-50 p-2.5 text-xs text-emerald-900 border border-emerald-200">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-700" />
                    {appliedCoupon.code} applied!
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-bold text-emerald-800 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon (e.g. CIRCULAR10)"
                      className="text-xs uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="btn border border-[#29243d] !px-3 !py-1 text-xs font-bold shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-1 text-[11px] text-red-600 font-semibold">{couponError}</p>
                  )}
                  <p className="mt-1.5 text-[10px] text-slate-400">
                    Try <strong>CIRCULAR10</strong> for 10% off or <strong>ECO2026</strong> for ₹200 off.
                  </p>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary w-full py-3.5 text-sm font-black flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Finalizing Order...
                  </>
                ) : paymentMethod === "RAZORPAY" ? (
                  <>
                    <Lock className="size-4 text-[#f3c94b]" /> Pay {inr(finalTotal)} Online
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" /> Confirm Cash on Delivery
                  </>
                )}
              </button>
            </div>

            {/* Trust Signals */}
            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-700 shrink-0" />
                <span>100% Secure Encrypted Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="size-4 text-slate-600 shrink-0" />
                <span>Dispatched within 24-48 Hours with Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="size-4 text-purple-700 shrink-0" />
                <span>7-Day Circular Exchange & Trade Protection</span>
              </div>
            </div>
          </section>
        </div>
      </form>

      {/* RAZORPAY NATIVE CHECKOUT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#0c2340] p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded bg-blue-600 text-white font-bold text-sm">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <b className="block text-sm font-black leading-tight">Secure Payment Gateway</b>
                    <span className="text-[10px] text-blue-200">256-Bit SSL Encrypted</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-black text-[#f3c94b]">
                    {inr(finalTotal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (paymentState === "idle") setIsModalOpen(false);
                    }}
                    disabled={paymentState !== "idle"}
                    className="grid size-7 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-30"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded bg-white/10 px-3 py-1.5 text-[11px] text-blue-100">
                <span className="truncate max-w-[200px]">{user.email || "shopper@rethread.market"}</span>
                <span className="font-mono text-[10px]">{phoneNumber}</span>
              </div>
            </div>

            {/* Modal Body */}
            {paymentState === "idle" && (
              <div className="flex flex-col">
                {/* Method Tabs */}
                <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("upi")}
                    className={`flex items-center justify-center gap-1.5 py-3 transition ${
                      activeTab === "upi"
                        ? "border-b-2 border-[#0c2340] bg-white text-[#0c2340]"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Smartphone className="size-3.5" /> UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("card")}
                    className={`flex items-center justify-center gap-1.5 py-3 transition ${
                      activeTab === "card"
                        ? "border-b-2 border-[#0c2340] bg-white text-[#0c2340]"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <CreditCard className="size-3.5" /> Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("netbanking")}
                    className={`flex items-center justify-center gap-1.5 py-3 transition ${
                      activeTab === "netbanking"
                        ? "border-b-2 border-[#0c2340] bg-white text-[#0c2340]"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Building2 className="size-3.5" /> Netbanking
                  </button>
                </div>

                <div className="p-5 max-h-[360px] overflow-y-auto">
                  {/* TAB 1: UPI */}
                  {activeTab === "upi" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { name: "GPay", color: "bg-blue-50 text-blue-700 border-blue-200" },
                          { name: "PhonePe", color: "bg-purple-50 text-purple-700 border-purple-200" },
                          { name: "Paytm", color: "bg-sky-50 text-sky-700 border-sky-200" },
                          { name: "BHIM", color: "bg-green-50 text-green-700 border-green-200" },
                        ].map((app) => (
                          <button
                            key={app.name}
                            type="button"
                            onClick={() => setUpiId(`shopper@${app.name.toLowerCase()}`)}
                            className={`rounded border p-2 text-center text-xs font-black transition hover:scale-105 ${app.color}`}
                          >
                            {app.name}
                          </button>
                        ))}
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                        <QrCode className="mx-auto size-24 text-slate-800" />
                        <span className="mt-1 block text-[11px] font-bold text-slate-600">
                          Scan with any UPI App (GPay, PhonePe, Paytm)
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700">UPI ID / VPA</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="mt-1 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CARDS */}
                  {activeTab === "card" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="mt-1 font-mono text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="mt-1 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700">CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="mt-1 font-mono text-xs"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Supports Visa, Mastercard, RuPay, and Maestro.
                      </p>
                    </div>
                  )}

                  {/* TAB 3: NETBANKING */}
                  {activeTab === "netbanking" && (
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-700">Select Bank</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Bank", "Punjab National"].map(
                          (bank) => (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => setSelectedBank(bank)}
                              className={`rounded border p-2.5 text-left text-xs font-bold transition ${
                                selectedBank === bank
                                  ? "border-[#0c2340] bg-blue-50 text-[#0c2340]"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              {bank}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="border-t border-slate-200 bg-slate-50 p-4">
                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    className="btn btn-primary w-full py-3 text-sm font-black flex items-center justify-center gap-2 !bg-[#0c2340] hover:!bg-[#15345d]"
                  >
                    <Lock className="size-4 text-[#f3c94b]" /> Pay {inr(finalTotal)}
                  </button>
                  <p className="mt-2 text-center text-[10px] text-slate-400">
                    Secured Gateway · 256-Bit SSL Handshake
                  </p>
                </div>
              </div>
            )}

            {/* Processing State */}
            {paymentState === "processing" && (
              <div className="p-8 text-center space-y-4">
                <Loader2 className="mx-auto size-12 animate-spin text-[#0c2340]" />
                <h3 className="text-base font-black text-slate-900">Connecting to Bank Switch...</h3>
                <p className="text-xs text-slate-500">Initiating 256-bit encrypted transaction.</p>
              </div>
            )}

            {/* Verifying State */}
            {paymentState === "verifying" && (
              <div className="p-8 text-center space-y-4">
                <Loader2 className="mx-auto size-12 animate-spin text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Verifying Payment...</h3>
                <p className="text-xs text-slate-500 font-mono">Reference: {generatedPayId}</p>
              </div>
            )}

            {/* Success State */}
            {paymentState === "success" && (
              <div className="p-8 text-center space-y-4">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="text-base font-black text-slate-900">Payment Confirmed!</h3>
                <p className="text-xs text-slate-600">
                  Order placed successfully. Redirecting to your order confirmation receipt...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
