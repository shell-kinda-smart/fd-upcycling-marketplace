import type { Metadata } from "next";
import { Leaf } from "lucide-react";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: { default: "ReThread", template: "%s | ReThread" },
  description: "Curated circular fashion and textile upcycling marketplace",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="pb-24 md:pb-0">
        <Header />
        {children}
        <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-[#d9d0c9] px-6 py-8 text-xs text-slate-500">
          <b className="flex items-center gap-2 text-[#29243d] font-black">
            <Leaf className="size-4 text-[#cf5036]" /> RETHREAD
          </b>
          <span>Circular fashion & sustainable designer marketplace.</span>
          <span>© 2026 ReThread. All rights reserved.</span>
        </footer>
      </body>
    </html>
  );
}
