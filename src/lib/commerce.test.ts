import { describe, expect, it } from "vitest";
import { cartTotal, inr } from "./commerce";
import { checkoutSchema, productSchema } from "./validation";

describe("commerce helpers", () => {
  it("calculates a cart total using price and quantity", () => {
    expect(
      cartTotal([
        { quantity: 2, price: 499 },
        { quantity: 1, price: 250 },
      ]),
    ).toBe(1248);
  });

  it("formats Indian rupees", () => {
    expect(inr(1250)).toContain("1,250");
  });

  it("handles empty cart total calculation", () => {
    expect(cartTotal([])).toBe(0);
  });
});

describe("Razorpay and Checkout validation", () => {
  it("validates RAZORPAY_DEMO payment method successfully", () => {
    const result = checkoutSchema.safeParse({
      address: "Hostel 4, Room 201, Campus Road, New Delhi",
      paymentMethod: "RAZORPAY_DEMO",
      razorpayPaymentId: "pay_demo_12345",
      razorpayOrderId: "order_demo_67890",
    });
    expect(result.success).toBe(true);
  });

  it("validates Cash on Delivery payment method", () => {
    const result = checkoutSchema.safeParse({
      address: "Design Studio, Block B, College of Fashion",
      paymentMethod: "COD",
    });
    expect(result.success).toBe(true);
  });

  it("validates products with local /products image paths", () => {
    const result = productSchema.safeParse({
      name: "Denim Upcycled Bag",
      price: 899,
      category: "Bags",
      material: "Post-consumer denim jeans",
      story: "Crafted from discarded jeans rescued from campus donation drives.",
      imageUrl: "/products/rethread-denim-revival-tote.jpg",
      tradeEnabled: "on",
    });
    expect(result.success).toBe(true);
  });
});
