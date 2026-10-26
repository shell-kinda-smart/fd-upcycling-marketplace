import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WishlistPageView } from "@/components/wishlist-page-view";

export default async function WishlistPage() {
  const session = await auth();

  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      price: true,
      category: true,
      material: true,
      imageUrl: true,
      symbol: true,
      tradeEnabled: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Guarantee 100% plain serializable primitives for Client Components
  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    category: p.category,
    material: p.material,
    imageUrl: p.imageUrl || null,
    symbol: p.symbol,
    tradeEnabled: Boolean(p.tradeEnabled),
  }));

  return (
    <main>
      <WishlistPageView
        allProducts={serializedProducts}
        isLoggedIn={Boolean(session?.user?.id)}
      />
    </main>
  );
}
