import { prisma } from "@/lib/prisma";
import { ArrowRight, Hammer, Recycle, Repeat2, Sprout } from "lucide-react";
export default async function Impact() {
  const count = await prisma.product.count({
    where: { status: { in: ["ACTIVE", "SOLD"] } },
  });
  return (
    <main>
      <section className="grid min-h-[520px] items-center gap-12 bg-[#29243d] px-[max(1rem,calc((100vw-1280px)/2))] py-16 text-white sm:px-[max(1.5rem,calc((100vw-1280px)/2))] sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow !text-[#f3c94b]">WHY UPCYCLING?</p>
          <h1 className="mt-4 text-4xl font-black leading-[.95] tracking-[-.07em] sm:text-6xl">
            Wear the change
            <br />
            you want to see.
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {[
            [String(count), "items recirculated"],
            [`${(count * 0.75).toFixed(1)} kg`, "estimated waste diverted"],
            ["Local", "student makers"],
          ].map(([v, l]) => (
            <article key={l} className="border-l border-white/20 p-4 sm:p-6">
              <b className="text-3xl">{v}</b>
              <p className="mt-2 text-xs text-white/60">{l}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-20 md:grid-cols-3">
        {[
          {
            n: "01",
            t: "Rescue",
            Icon: Recycle,
            copy: "Collect useful discarded material before it becomes waste.",
          },
          {
            n: "02",
            t: "Redesign",
            Icon: Hammer,
            copy: "Use design thinking and craft to create a higher-value product.",
          },
          {
            n: "03",
            t: "Recirculate",
            Icon: Repeat2,
            copy: "List, trade and purchase the finished item through ReThread.",
          },
        ].map(({ n, t, Icon, copy }) => (
          <article key={n} className="border-t-4 border-[#cf5036] bg-white p-8">
            <div className="flex items-center justify-between">
              <b className="text-[#cf5036]">{n}</b>
              <Icon className="size-6 text-[#cf5036]" />
            </div>
            <h2 className="mt-7 text-2xl font-bold">{t}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">{copy}</p>
            <ArrowRight className="mt-7 size-5" />
          </article>
        ))}
      </section>
      <section className="mx-auto mb-20 flex max-w-7xl flex-col items-start justify-between gap-6 bg-[#f3c94b] p-8 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow !text-[#29243d]">PRACTICAL OUTCOME</p>
          <h2 className="mt-2 text-2xl font-black">
            Student creativity becomes circular commerce.
          </h2>
        </div>
        <Sprout className="size-12 text-[#29243d]" />
      </section>
    </main>
  );
}
