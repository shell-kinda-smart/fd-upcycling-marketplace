import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      price: true,
      category: true,
      material: true,
      tradeEnabled: true,
      imageUrl: true,
    },
  });
  return NextResponse.json(
    rows.map((x) => ({ ...x, price: x.price.toNumber() })),
  );
}
