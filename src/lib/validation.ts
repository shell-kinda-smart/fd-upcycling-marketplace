import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.email(),
  password: z.string().min(8).max(72),
  role: z.enum(["BUYER", "CREATOR", "BOTH"]),
  college: z.string().trim().max(80).optional(),
});

export const profileSchema = registerSchema.pick({
  name: true,
  role: true,
  college: true,
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(80),
  price: z.coerce.number().positive(),
  category: z.enum(["Bags", "Clothing", "Accessories", "Home"]),
  material: z.string().trim().min(3).max(120),
  story: z.string().trim().min(10).max(500),
  imageUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .refine(
      (val) => !val || val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://"),
      { message: "Must be a valid web URL or a local /products path" }
    )
    .or(z.literal("")),
  tradeEnabled: z.string().optional(),
});

export const checkoutSchema = z.object({
  address: z.string().trim().min(5).max(300),
  paymentMethod: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(["RAZORPAY", "RAZORPAY_DEMO", "UPI", "CARD", "COD"])),
  razorpayPaymentId: z.string().optional(),
  razorpayOrderId: z.string().optional(),
});
