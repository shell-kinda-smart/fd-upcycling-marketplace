"use server";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus, Role } from "@prisma/client";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canBuy, canSell } from "@/lib/access";
import {
  checkoutSchema,
  productSchema,
  profileSchema,
  registerSchema,
} from "@/lib/validation";
import { symbols } from "@/lib/commerce";
async function userId() {
  const s = await auth();
  if (!s?.user?.id) redirect("/signin");
  return s.user.id;
}

async function currentAccount() {
  const id = await userId();
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!user) redirect("/signin");
  return user;
}

async function requireBuyer() {
  const user = await currentAccount();
  if (!canBuy(user.role)) redirect("/workspace?access=buyer");
  return user;
}

async function requireSeller() {
  const user = await currentAccount();
  if (!canSell(user.role)) redirect("/workspace?access=seller");
  return user;
}
export async function registerAction(fd: FormData) {
  const p = registerSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) redirect("/register?error=invalid");
  if (
    await prisma.user.findUnique({
      where: { email: p.data.email.toLowerCase() },
    })
  )
    redirect("/register?error=exists");
  const { password, ...account } = p.data;
  await prisma.user.create({
    data: {
      ...account,
      email: account.email.toLowerCase(),
      passwordHash: await hash(password, 12),
    },
  });
  redirect("/signin?registered=1");
}
export async function loginAction(fd: FormData) {
  try {
    await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirectTo: "/marketplace",
    });
  } catch (e) {
    if (e instanceof AuthError) redirect("/signin?error=credentials");
    throw e;
  }
}
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
export async function createProduct(fd: FormData) {
  const { id } = await requireSeller();
  const p = productSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) redirect("/sell?error=invalid");
  const imageUrl = p.data.imageUrl?.trim() || null;
  await prisma.product.create({
    data: {
      sellerId: id,
      name: p.data.name,
      price: p.data.price,
      category: p.data.category,
      material: p.data.material,
      story: p.data.story,
      symbol: symbols[p.data.category],
      tradeEnabled: !!p.data.tradeEnabled,
      imageUrl,
    },
  });
  revalidatePath("/workspace");
  redirect("/listings");
}
export async function updateProductStatus(fd: FormData) {
  const { id } = await requireSeller(),
    status = String(fd.get("status"));
  if (!["ACTIVE", "SOLD", "ARCHIVED"].includes(status)) return;
  await prisma.product.updateMany({
    where: { id: String(fd.get("id")), sellerId: id },
    data: { status: status as "ACTIVE" | "SOLD" | "ARCHIVED" },
  });
  revalidatePath("/listings");
  revalidatePath("/marketplace");
  revalidatePath("/workspace");
}
export async function addToCartDirect(productId: string) {
  const s = await auth();
  if (!s?.user?.id) {
    return { success: false, requireAuth: true };
  }
  const user = await prisma.user.findUnique({
    where: { id: s.user.id },
    select: { role: true },
  });
  if (!canBuy(user?.role))
    return { success: false, error: "Switch to a buyer account to add items." };
  const product = await prisma.product.findFirst({
    where: { id: productId, status: "ACTIVE" },
  });
  if (!product) return { success: false, error: "Product not available" };
  if (product.sellerId === s.user.id)
    return {
      success: false,
      error: "You cannot add your own listing to your bag.",
    };
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: s.user.id, productId } },
    update: { quantity: { increment: 1 } },
    create: { userId: s.user.id, productId, quantity: 1 },
  });
  revalidatePath("/", "layout");
  revalidatePath("/marketplace");
  revalidatePath("/cart");
  revalidatePath("/workspace");
  return { success: true };
}

export async function addToCart(fd: FormData) {
  const { id } = await requireBuyer(),
    productId = String(fd.get("productId"));
  const product = await prisma.product.findFirst({
    where: { id: productId, status: "ACTIVE" },
  });
  if (!product || product.sellerId === id) return;
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: id, productId } },
    update: { quantity: { increment: 1 } },
    create: { userId: id, productId, quantity: 1 },
  });
  revalidatePath("/", "layout");
  revalidatePath("/marketplace");
  revalidatePath("/cart");
  revalidatePath("/workspace");
}

export async function buyNow(fd: FormData) {
  const { id } = await requireBuyer(),
    productId = String(fd.get("productId"));
  const product = await prisma.product.findFirst({
    where: { id: productId, status: "ACTIVE" },
  });
  if (product && product.sellerId !== id) {
    await prisma.cartItem.upsert({
      where: { userId_productId: { userId: id, productId } },
      update: { quantity: { increment: 1 } },
      create: { userId: id, productId, quantity: 1 },
    });
  }
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  redirect("/cart");
}
export async function removeCartItem(fd: FormData) {
  const { id } = await requireBuyer();
  await prisma.cartItem.deleteMany({
    where: { id: String(fd.get("id")), userId: id },
  });
  revalidatePath("/", "layout");
  revalidatePath("/cart");
}

export async function updateCartQuantity(fd: FormData) {
  const { id } = await requireBuyer();
  const cartItemId = String(fd.get("id"));
  const delta = parseInt(String(fd.get("delta") || "0"), 10);
  if (!cartItemId || isNaN(delta) || delta === 0) return;

  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId: id },
  });
  if (!item) return;

  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: newQty },
    });
  }
  revalidatePath("/", "layout");
  revalidatePath("/cart");
}
async function requireAdmin() {
  const s = await auth();
  if (!s?.user?.id) redirect("/signin");
  const user = await prisma.user.findUnique({ where: { id: s.user.id } });
  if (user?.role !== "ADMIN") redirect("/admin");
  return user;
}

export async function checkout(fd: FormData) {
  const { id } = await requireBuyer(),
    p = checkoutSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) redirect("/cart?error=invalid");
  const cart = await prisma.cartItem.findMany({
    where: { userId: id, product: { status: "ACTIVE" } },
    include: { product: true },
  });
  if (!cart.length) redirect("/cart");
  if (cart.some((item) => item.product.sellerId === id))
    redirect("/cart?error=own-listing");
  const subtotal = cart.reduce(
    (s, x) => s + x.product.price.toNumber() * x.quantity,
    0,
  );
  const discountAmount = Math.min(
    subtotal,
    Math.max(0, parseFloat(p.data.discountAmount || "0") || 0),
  );
  const total = Math.max(0, subtotal - discountAmount);
  const isRazorpay =
    p.data.paymentMethod === "RAZORPAY" ||
    p.data.paymentMethod === "RAZORPAY_DEMO";
  const paymentStatus = isRazorpay
    ? "PAID"
    : p.data.paymentMethod === "COD"
      ? "PENDING_COD"
      : "PAID";
  const randomSuffix = Math.random()
    .toString(36)
    .substring(2, 12)
    .toUpperCase();
  const razorpayPaymentId =
    p.data.razorpayPaymentId || (isRazorpay ? `pay_${randomSuffix}` : null);
  const razorpayOrderId =
    p.data.razorpayOrderId || (isRazorpay ? `order_${randomSuffix}` : null);

  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        buyerId: id,
        total,
        paymentMethod: isRazorpay ? "Online Payment" : p.data.paymentMethod,
        paymentStatus,
        shippingAddress: p.data.address,
        razorpayPaymentId,
        razorpayOrderId,
        items: {
          create: cart.map((x) => ({
            productId: x.productId,
            productName: x.product.name,
            price: x.product.price,
            quantity: x.quantity,
          })),
        },
      },
    });
    const purchasedProductIds = cart.map((item) => item.productId);
    await tx.product.updateMany({
      where: { id: { in: purchasedProductIds }, status: "ACTIVE" },
      data: { status: "SOLD" },
    });
    await tx.cartItem.deleteMany({
      where: { userId: id, productId: { in: purchasedProductIds } },
    });
  });
  revalidatePath("/", "layout");
  revalidatePath("/marketplace");
  revalidatePath("/orders");
  revalidatePath("/cart");
  revalidatePath("/workspace");
  redirect(
    `/orders?success=1${razorpayPaymentId ? `&pay_id=${razorpayPaymentId}` : ""}`,
  );
}

export async function proposeTrade(fd: FormData) {
  const { id } = await requireBuyer(),
    offer = String(fd.get("offerText") || "").trim(),
    productId = String(fd.get("productId"));
  if (offer.length < 5) return;
  const product = await prisma.product.findFirst({
    where: { id: productId, tradeEnabled: true, status: "ACTIVE" },
  });
  if (product && product.sellerId !== id)
    await prisma.tradeProposal.create({
      data: { requesterId: id, productId, offerText: offer },
    });
  revalidatePath("/marketplace");
  revalidatePath("/trades");
  revalidatePath("/workspace");
}

export async function acceptTrade(fd: FormData) {
  const { id } = await requireSeller();
  const tradeId = String(fd.get("tradeId"));
  const trade = await prisma.tradeProposal.findUnique({
    where: { id: tradeId },
    include: { product: true },
  });
  if (!trade || trade.product.sellerId !== id) return;
  await prisma.$transaction(async (tx) => {
    await tx.tradeProposal.update({
      where: { id: tradeId },
      data: { status: "ACCEPTED" },
    });
    await tx.product.update({
      where: { id: trade.productId },
      data: { status: "SOLD" },
    });
    await tx.tradeProposal.updateMany({
      where: {
        productId: trade.productId,
        id: { not: tradeId },
        status: "PENDING",
      },
      data: { status: "REJECTED" },
    });
  });
  revalidatePath("/trades");
  revalidatePath("/listings");
  revalidatePath("/marketplace");
  revalidatePath("/workspace");
}

export async function rejectTrade(fd: FormData) {
  const { id } = await requireSeller();
  const tradeId = String(fd.get("tradeId"));
  const trade = await prisma.tradeProposal.findUnique({
    where: { id: tradeId },
    include: { product: true },
  });
  if (!trade || trade.product.sellerId !== id) return;
  await prisma.tradeProposal.update({
    where: { id: tradeId },
    data: { status: "REJECTED" },
  });
  revalidatePath("/trades");
  revalidatePath("/workspace");
}

export async function adminUpdateProductStatus(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const status = String(fd.get("status"));
  if (!["ACTIVE", "SOLD", "ARCHIVED"].includes(status)) return;
  await prisma.product.update({
    where: { id },
    data: { status: status as "ACTIVE" | "SOLD" | "ARCHIVED" },
  });
  revalidatePath("/admin");
  revalidatePath("/marketplace");
  revalidatePath("/listings");
}

export async function adminDeleteProduct(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/marketplace");
}

export async function adminUpdateOrderStatus(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const status = String(fd.get("status"));
  if (
    !["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(
      status,
    )
  )
    return;
  await prisma.order.update({
    where: { id },
    data: { status: status as OrderStatus },
  });
  revalidatePath("/admin");
  revalidatePath("/orders");
}

export async function adminUpdateUserRole(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const role = String(fd.get("role"));
  if (!["BUYER", "CREATOR", "BOTH", "ADMIN"].includes(role)) return;
  await prisma.user.update({
    where: { id },
    data: { role: role as Role },
  });
  revalidatePath("/admin");
}

export async function updateProfile(fd: FormData) {
  const id = await userId();
  const p = profileSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) redirect("/profile?error=invalid");
  await prisma.user.update({ where: { id }, data: p.data });
  revalidatePath("/profile");
  revalidatePath("/workspace");
  redirect("/profile?saved=1");
}
