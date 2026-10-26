export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
export function cartTotal(items: { price: number; quantity: number }[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
export const symbols: Record<string, string> = {
  Bags: "👜",
  Clothing: "👕",
  Accessories: "◈",
  Home: "🌱",
};
