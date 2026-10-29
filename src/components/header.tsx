import Link from "next/link";
import {
  Leaf,
  LogOut,
  ShoppingBag,
  Store,
  UserRound,
  ShieldCheck,
  LayoutDashboard,
  PackagePlus,
} from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { WishlistHeaderCount } from "@/components/wishlist-header-count";
import { canBuy, canSell, roleLabel } from "@/lib/access";

export async function Header() {
  const session = await auth();
  const userId = session?.user?.id;

  const [count, userRecord] = await Promise.all([
    userId
      ? prisma.cartItem
          .aggregate({
            where: { userId },
            _sum: { quantity: true },
          })
          .then((x) => x._sum.quantity || 0)
      : 0,
    userId
      ? prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        })
      : null,
  ]);

  const isAdmin = userRecord?.role === "ADMIN";
  const buyerEnabled = canBuy(userRecord?.role);
  const sellerEnabled = canSell(userRecord?.role);

  const mobileLinks = [
    { href: "/marketplace", label: "Shop", Icon: Store },
    ...(buyerEnabled
      ? [{ href: "/cart", label: `Bag (${count})`, Icon: ShoppingBag }]
      : []),
    ...(sellerEnabled
      ? [{ href: "/sell", label: "Sell", Icon: PackagePlus }]
      : []),
    {
      href: session ? "/workspace" : "/signin",
      label: session ? "Workspace" : "Sign In",
      Icon: LayoutDashboard,
    },
    {
      href: session ? "/profile" : "/signin",
      label: session ? "Profile" : "Sign In",
      Icon: UserRound,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b-2 border-[#29243d] bg-[#fff5e9]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-3 sm:px-6">
          <Link
            className="brand flex items-center gap-2 text-lg sm:text-xl shrink-0"
            href="/"
            aria-label="ReThread home"
          >
            <span className="grid size-9 sm:size-10 -rotate-6 place-items-center rounded bg-[#f3c94b]">
              <Leaf className="size-4 sm:size-5" />
            </span>
            <span>
              re<span className="text-[#cf5036]">thread</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-4 xl:gap-6 text-xs font-black uppercase tracking-wider lg:flex"
            aria-label="Marketplace navigation"
          >
            <Link
              className="nav-link py-1 hover:text-[#cf5036]"
              href="/marketplace"
            >
              Marketplace
            </Link>
            <Link className="nav-link py-1 hover:text-[#cf5036]" href="/impact">
              Impact
            </Link>
            {buyerEnabled && (
              <>
                <Link
                  className="nav-link py-1 hover:text-[#cf5036]"
                  href="/orders"
                >
                  Orders
                </Link>
                <Link
                  className="nav-link py-1 hover:text-[#cf5036]"
                  href="/trades"
                >
                  Trades
                </Link>
              </>
            )}
            {sellerEnabled && (
              <>
                <Link
                  className="nav-link py-1 hover:text-[#cf5036]"
                  href="/sell"
                >
                  Sell
                </Link>
                <Link
                  className="nav-link py-1 hover:text-[#cf5036]"
                  href="/listings"
                >
                  Inventory
                </Link>
              </>
            )}
            {session && (
              <Link
                className="nav-link flex items-center gap-1 py-1 hover:text-[#cf5036]"
                href="/workspace"
              >
                <LayoutDashboard className="size-3.5" /> Workspace
              </Link>
            )}
            {isAdmin && (
              <Link
                className="nav-link flex items-center gap-1 rounded bg-purple-100 px-2.5 py-1 text-purple-950 hover:bg-purple-200"
                href="/admin"
              >
                <ShieldCheck className="size-3.5 text-purple-700" /> Admin
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <WishlistHeaderCount />

            {session?.user ? (
              <>
                {buyerEnabled && (
                  <Link
                    className="btn border border-[#29243d] !px-2.5 sm:!px-3 !py-2 text-xs"
                    href="/cart"
                    aria-label={`Shopping bag with ${count} items`}
                  >
                    <ShoppingBag className="size-4" />
                    <span className="hidden sm:inline">Bag</span>
                    <b className="bg-[#f3c94b] px-1.5 py-0.5 rounded-xs text-[11px]">
                      {count}
                    </b>
                  </Link>
                )}

                <Link
                  className="grid size-9 sm:size-10 place-items-center rounded-full bg-[#29243d] text-xs font-bold text-white transition hover:bg-[#cf5036]"
                  href="/profile"
                  aria-label="Your profile"
                  title={`${session.user.name || "Profile"} (${roleLabel(userRecord?.role)})`}
                >
                  {session.user.name?.slice(0, 2).toUpperCase() || "ME"}
                </Link>

                <form action={logoutAction} className="hidden sm:block">
                  <button
                    className="grid size-9 place-items-center text-slate-500 transition hover:text-[#cf5036]"
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <LogOut className="size-4" />
                  </button>
                </form>
              </>
            ) : (
              <Link
                className="btn border border-[#29243d] !py-2 text-xs"
                href="/signin"
              >
                <UserRound className="size-4" /> Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed inset-x-2 bottom-2 z-40 grid grid-cols-5 rounded-lg border-2 border-[#29243d] bg-[#fffaf3]/95 p-1 shadow-[4px_4px_0_#29243d] backdrop-blur-md lg:hidden"
        aria-label="Mobile navigation"
      >
        {mobileLinks.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-w-0 flex-col items-center justify-center gap-0.5 rounded px-1 py-1.5 text-[10px] font-black uppercase tracking-tight text-slate-700 hover:bg-[#f3c94b] transition"
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate max-w-full">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
