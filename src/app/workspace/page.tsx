import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowRightLeft,
  Box,
  ClipboardList,
  LayoutDashboard,
  PackagePlus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canBuy, canSell, roleLabel, workspaceLabel } from "@/lib/access";
import { inr } from "@/lib/commerce";

export default async function Workspace() {
  const session = await auth();
  if (!session?.user.id) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, role: true },
  });
  if (!user) redirect("/signin");

  const buyerEnabled = canBuy(user.role);
  const sellerEnabled = canSell(user.role);
  const adminEnabled = user.role === "ADMIN";

  const [
    orderCount,
    cartCount,
    savedCount,
    listingCount,
    soldCount,
    tradeCount,
    platform,
  ] = await Promise.all([
    buyerEnabled ? prisma.order.count({ where: { buyerId: user.id } }) : 0,
    buyerEnabled ? prisma.cartItem.count({ where: { userId: user.id } }) : 0,
    buyerEnabled
      ? prisma.tradeProposal.count({ where: { requesterId: user.id } })
      : 0,
    sellerEnabled ? prisma.product.count({ where: { sellerId: user.id } }) : 0,
    sellerEnabled
      ? prisma.product.count({ where: { sellerId: user.id, status: "SOLD" } })
      : 0,
    sellerEnabled
      ? prisma.tradeProposal.count({
          where: { product: { sellerId: user.id } },
        })
      : 0,
    adminEnabled
      ? Promise.all([
          prisma.user.count(),
          prisma.product.count({ where: { status: "ACTIVE" } }),
          prisma.order.aggregate({ _sum: { total: true } }),
        ])
      : null,
  ]);

  return (
    <main className="market-shell">
      <header className="workspace-heading">
        <div>
          <p className="section-kicker">
            <LayoutDashboard className="size-3.5" /> {workspaceLabel(user.role)}
          </p>
          <h1>Welcome back, {user.name.split(" ")[0]}.</h1>
          <p>Use one place to manage your marketplace activity.</p>
        </div>
        <span className="role-chip">{roleLabel(user.role)}</span>
      </header>

      {buyerEnabled && (
        <WorkspaceSection
          title="Buyer activity"
          description="Discover pieces, keep a short bag and track every order."
          icon={<ShoppingBag className="size-5" />}
          tone="buyer"
          stats={[
            [String(orderCount), "Orders placed"],
            [String(cartCount), "Items in bag"],
            [String(savedCount), "Trade offers sent"],
          ]}
          actions={[
            [
              "Browse marketplace",
              "/marketplace",
              <Store key="browse" className="size-4" />,
            ],
            [
              "View orders",
              "/orders",
              <ClipboardList key="orders" className="size-4" />,
            ],
            ["Open bag", "/cart", <ShoppingBag key="bag" className="size-4" />],
          ]}
        />
      )}

      {sellerEnabled && (
        <WorkspaceSection
          title="Seller studio"
          description="Publish upcycled work, keep listings current and respond to swap offers."
          icon={<Store className="size-5" />}
          tone="seller"
          stats={[
            [String(listingCount), "All listings"],
            [String(soldCount), "Sold or traded"],
            [String(tradeCount), "Offers received"],
          ]}
          actions={[
            [
              "New listing",
              "/sell",
              <PackagePlus key="new" className="size-4" />,
            ],
            [
              "Manage inventory",
              "/listings",
              <Box key="inventory" className="size-4" />,
            ],
            [
              "Review trades",
              "/trades",
              <ArrowRightLeft key="trades" className="size-4" />,
            ],
          ]}
        />
      )}

      {adminEnabled && platform && (
        <WorkspaceSection
          title="Platform administration"
          description="Moderate the catalogue, orders and community access."
          icon={<ShieldCheck className="size-5" />}
          tone="admin"
          stats={[
            [String(platform[0]), "Community accounts"],
            [String(platform[1]), "Active listings"],
            [inr(platform[2]._sum.total?.toNumber() ?? 0), "Recorded GMV"],
          ]}
          actions={[
            [
              "Open admin console",
              "/admin",
              <Users key="admin" className="size-4" />,
            ],
          ]}
        />
      )}
    </main>
  );
}

function WorkspaceSection({
  title,
  description,
  icon,
  tone,
  stats,
  actions,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: "buyer" | "seller" | "admin";
  stats: [string, string][];
  actions: [string, string, React.ReactNode][];
}) {
  return (
    <section className={`workspace-panel workspace-panel-${tone}`}>
      <div className="workspace-panel-head">
        <div className="workspace-panel-icon">{icon}</div>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="workspace-stats">
        {stats.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="workspace-actions">
        {actions.map(([label, href, icon]) => (
          <Link key={href} href={href} className="workspace-action">
            {icon} {label} <ArrowRight className="ml-auto size-4" />
          </Link>
        ))}
      </div>
    </section>
  );
}
