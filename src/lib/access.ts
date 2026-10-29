import type { Role } from "@prisma/client";

export type MarketplaceRole = Role | null | undefined;

export function canBuy(role: MarketplaceRole) {
  return role === "BUYER" || role === "BOTH" || role === "ADMIN";
}

export function canSell(role: MarketplaceRole) {
  return role === "CREATOR" || role === "BOTH" || role === "ADMIN";
}

export function roleLabel(role: MarketplaceRole) {
  switch (role) {
    case "BUYER":
      return "Buyer";
    case "CREATOR":
      return "Seller";
    case "BOTH":
      return "Buyer & Seller";
    case "ADMIN":
      return "Administrator";
    default:
      return "Member";
  }
}

export function workspaceLabel(role: MarketplaceRole) {
  if (role === "ADMIN") return "Platform control";
  if (canSell(role) && canBuy(role)) return "Buyer & seller workspace";
  if (canSell(role)) return "Seller workspace";
  return "Buyer workspace";
}
