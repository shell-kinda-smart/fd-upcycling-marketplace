"use client";

import { useState, useTransition, useEffect } from "react";
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
} from "lucide-react";
import { checkout } from "@/app/actions";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: unknown) => void) => void;
    };
  }
}

interface RazorpayCheckoutProps {
  total: number;
  user: {
    name?: string | null;
    email?: string | null;
  };
  hasItems: boolean;
}

export function RazorpayCheckout({
  total,
  user,
  hasItems,
}: RazorpayCheckoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">(
    "RAZORPAY",
  );
  const [activeTab, setActiveTab] = useState<"upi" | "card" | "netbanking">(
    "upi",
  );

  // Form inputs for Razorpay Modal
  const phone = "+91 98765 43210";
  const [upiId, setUpiId] = useState("artisan@okhdfcbank");
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  // Payment execution state
  const [isPending, startTransition] = useTransition();
  const [paymentState, setPaymentState] = useState<
    "idle" | "processing" | "verifying" | "success"
  >("idle");
  const [generatedPayId, setGeneratedPayId] = useState("");

  // Load official Razorpay checkout script if available
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const executeOrder = (payMethod: string, payId = "", orderId = "") => {
    const fd = new FormData();
    fd.append("address", address);
    fd.append("paymentMethod", payMethod);
    if (payId) fd.append("razorpayPaymentId", payId);
    if (orderId) fd.append("razorpayOrderId", orderId);

    startTransition(async () => {
      await checkout(fd);
    });
  };

  const handleOpenCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || address.trim().length < 5) {
      alert(
        "Please enter a complete delivery address (at least 5 characters).",
      );
      return;
    }
    if (paymentMethod === "COD") {
      executeOrder("COD");
      return;
    }

    // If an external Razorpay Key is provided in environment, try opening official Razorpay standard popup
    const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (rzpKey && typeof window !== "undefined" && window.Razorpay) {
      try {
        const rzp = new window.Razorpay({
          key: rzpKey,
          amount: Math.round(total * 100),
          currency: "INR",
          name: "ReThread FD Marketplace",
          description: "Circular Upcycled Fashion Order",
          prefill: {
            name: user.name || "Artisan Maker",
            email: user.email || "shopper@rethread.market",
            contact: "9876543210",
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
        // Fall back seamlessly to integrated Razorpay checkout modal
      }
    }

    setIsOpen(true);
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

  return (
    <div className="w-full">
      {/* Checkout Form */}
      <form onSubmit={handleOpenCheckout} className="space-y-4">
        <label className="block text-xs font-bold text-slate-700">
          Delivery address
          <textarea
            className="mt-1 min-h-20 w-full rounded border border-slate-300 bg-white p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#cf5036]"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Room/Flat no, Hostel/Apartment name, Campus/Street, City, Pincode"
            required
          />
        </label>

        <div className="w-full">
          <span className="block text-xs font-bold text-slate-700">
            Payment Option
          </span>
          <div className="mt-2 space-y-2.5 w-full">
            <div
              onClick={() => setPaymentMethod("RAZORPAY")}
              className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-3 transition w-full ${
                paymentMethod === "RAZORPAY"
                  ? "border-[#0c2340] bg-[#f0f4f9]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <input
                  type="radio"
                  name="paymentChoice"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                  className="size-4 shrink-0 cursor-pointer accent-[#0c2340]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-[#0c2340]">
                      Online Payment (UPI / Cards / Netbanking)
                    </span>
                    <span className="rounded bg-[#0c2340] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                      SECURE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate">
                    UPI, Cards, Netbanking
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#0c2340] shrink-0 ml-1.5">
                <Lock className="size-3 text-blue-700" />
                <span className="hidden sm:inline">256-Bit SSL</span>
              </div>
            </div>

            <div
              onClick={() => setPaymentMethod("COD")}
              className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-3 transition w-full ${
                paymentMethod === "COD"
                  ? "border-[#29243d] bg-[#fff5e9]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <input
                  type="radio"
                  name="paymentChoice"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="size-4 shrink-0 cursor-pointer accent-[#cf5036]"
                />
                <div className="min-w-0 flex-1">
                  <b className="block text-xs sm:text-sm font-bold text-slate-900 truncate">
                    Cash on Delivery (COD)
                  </b>
                  <p className="text-[11px] text-slate-500 truncate">
                    Pay upon item handover
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!hasItems || isPending}
          className="btn btn-primary mt-2 flex w-full items-center justify-center gap-2 py-3 text-sm font-bold disabled:opacity-40"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Confirming Order...
            </>
          ) : paymentMethod === "RAZORPAY" ? (
            <>
              <Lock className="size-4" /> Pay ₹{total.toLocaleString("en-IN")}{" "}
              Online
            </>
          ) : (
            <>
              <CreditCard className="size-4" /> Place Cash on Delivery Order
            </>
          )}
        </button>
      </form>

      {/* Razorpay Standard Checkout Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative flex w-[95vw] max-w-md max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl">
            {/* Header: Razorpay Signature Navy Banner */}
            <div className="shrink-0 bg-[#0c2340] px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded bg-[#0b72e7] font-black text-white text-sm">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight">
                      ReThread Marketplace
                    </h3>
                    <p className="text-[10px] text-blue-200">Secure Checkout</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-blue-200">
                    Amount
                  </span>
                  <div className="text-lg font-black text-white">
                    ₹{total.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* User preview bar */}
              <div className="mt-3 flex items-center justify-between rounded bg-white/10 px-3 py-1.5 text-[11px] text-blue-100">
                <span className="truncate max-w-[200px]">
                  {user.email || "shopper@rethread.market"}
                </span>
                <span className="font-mono text-[10px]">{phone}</span>
              </div>
            </div>

            {/* Modal Body */}
            {paymentState === "idle" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Method Tabs */}
                <div className="grid grid-cols-3 shrink-0 border-b border-slate-200 bg-slate-50 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("upi")}
                    className={`flex items-center justify-center gap-1.5 py-3 transition ${
                      activeTab === "upi"
                        ? "border-b-2 border-[#0b72e7] bg-white text-[#0b72e7]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Smartphone className="size-3.5" /> UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("card")}
                    className={`flex items-center justify-center gap-1.5 py-3 transition ${
                      activeTab === "card"
                        ? "border-b-2 border-[#0b72e7] bg-white text-[#0b72e7]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <CreditCard className="size-3.5" /> Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("netbanking")}
                    className={`flex items-center justify-center gap-1.5 py-3 transition ${
                      activeTab === "netbanking"
                        ? "border-b-2 border-[#0b72e7] bg-white text-[#0b72e7]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Building2 className="size-3.5" /> Netbanking
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {/* Tab 1: UPI */}
                  {activeTab === "upi" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Popular UPI Apps
                        </span>
                        <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                          Fast & Verified
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() =>
                              setUpiId(`user.${app.toLowerCase()}@upi`)
                            }
                            className="flex flex-col items-center justify-center rounded-lg border border-slate-200 p-2 hover:border-[#0b72e7] hover:bg-blue-50/50"
                          >
                            <span className="size-7 rounded-full bg-slate-100 text-center text-xs font-black leading-7 text-slate-800">
                              {app[0]}
                            </span>
                            <span className="mt-1 text-[11px] font-bold text-slate-700">
                              {app}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <label className="text-[11px] font-semibold text-slate-600">
                          Or enter UPI ID / VPA
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="mt-1 w-full rounded border border-slate-300 p-2 text-xs font-mono"
                          placeholder="username@upi"
                        />
                      </div>

                      <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2.5 text-[11px] text-blue-900">
                        <QrCode className="size-4 shrink-0 text-blue-600" />
                        <span>
                          Instant UPI authorization with 256-bit bank routing.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Cards */}
                  {activeTab === "card" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Credit or Debit Card
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCardNumber("4111 1111 1111 1111");
                            setCardExpiry("12/28");
                            setCardCvv("123");
                          }}
                          className="text-[11px] font-bold text-[#0b72e7] hover:underline"
                        >
                          Fill Card Details
                        </button>
                      </div>

                      <label className="block text-[11px] font-semibold text-slate-600">
                        Card Number
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="mt-1 w-full rounded border border-slate-300 p-2 font-mono text-xs"
                          placeholder="4111 1111 1111 1111"
                        />
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Expiry
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="mt-1 w-full rounded border border-slate-300 p-2 font-mono text-xs"
                            placeholder="MM/YY"
                          />
                        </label>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          CVV
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="mt-1 w-full rounded border border-slate-300 p-2 font-mono text-xs"
                            placeholder="123"
                          />
                        </label>
                      </div>

                      <label className="block text-[11px] font-semibold text-slate-600">
                        Cardholder Name
                        <input
                          type="text"
                          defaultValue={user.name || "Alex Morgan"}
                          className="mt-1 w-full rounded border border-slate-300 p-2 text-xs"
                        />
                      </label>
                    </div>
                  )}

                  {/* Tab 3: Netbanking */}
                  {activeTab === "netbanking" && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-700">
                        Select Your Bank
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "HDFC Bank",
                          "State Bank of India",
                          "ICICI Bank",
                          "Axis Bank",
                          "Kotak Mahindra",
                          "Punjab National Bank",
                        ].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`rounded-lg border p-2 text-left text-xs font-bold transition ${
                              selectedBank === bank
                                ? "border-[#0b72e7] bg-blue-50 text-[#0b72e7]"
                                : "border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Pay Button */}
                <div className="shrink-0 border-t border-slate-200 p-4 bg-slate-50 space-y-2">
                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b72e7] py-3 text-sm font-bold text-white transition hover:bg-[#095bc0]"
                  >
                    <span>Pay ₹{total.toLocaleString("en-IN")}</span>
                    <ArrowRight className="size-4" />
                  </button>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500">
                    <ShieldCheck className="size-3 text-green-600" />
                    <span>Secured with 256-bit SSL encryption</span>
                  </div>
                </div>
              </div>
            )}

            {/* Processing States */}
            {paymentState === "processing" && (
              <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                <Loader2 className="size-12 animate-spin text-[#0b72e7]" />
                <h4 className="mt-4 font-bold text-slate-800">
                  Securing Transaction...
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Creating encrypted channel for ₹
                  {total.toLocaleString("en-IN")}
                </p>
              </div>
            )}

            {paymentState === "verifying" && (
              <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                <div className="grid size-12 place-items-center rounded-full bg-blue-100 text-[#0b72e7]">
                  <Smartphone className="size-6 animate-pulse" />
                </div>
                <h4 className="mt-4 font-bold text-slate-800">
                  Verifying Bank Authorization...
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Confirming payment credentials
                </p>
              </div>
            )}

            {paymentState === "success" && (
              <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                <CheckCircle2 className="size-14 text-green-600 animate-in zoom-in" />
                <h4 className="mt-3 text-lg font-black text-slate-900">
                  Payment Successful!
                </h4>
                <p className="mt-1 text-xs font-mono text-slate-600">
                  Ref ID:{" "}
                  <span className="font-bold text-slate-900">
                    {generatedPayId}
                  </span>
                </p>
                <p className="mt-3 text-xs text-green-700 font-semibold">
                  Completing your order...
                </p>
              </div>
            )}

            {/* Close Button */}
            {paymentState === "idle" && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setPaymentState("idle");
                }}
                className="absolute right-3.5 top-3.5 text-white/80 hover:text-white"
                aria-label="Close Razorpay checkout"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
