import type { Metadata } from "next";
import { Leaf } from "lucide-react";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: { default: "ReThread", template: "%s | ReThread" },
  description: "Full-stack FD upcycling marketplace",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="pb-24 md:pb-0">
        <Header />
        {children}
        <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-t border-[#d9d0c9] px-6 py-9 text-xs text-slate-500">
          <b className="flex items-center gap-2 text-[#29243d]">
            <Leaf className="size-4" /> RETHREAD
          </b>
          <span>Student-made pieces. Lighter footprint.</span>
          <span>BTech full-stack project</span>
        </footer>
      </body>
    </html>
  );
}
