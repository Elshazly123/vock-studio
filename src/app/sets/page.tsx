import { prisma } from "@/lib/prisma";
import { parseSet } from "@/lib/types";
import SetCard from "@/components/SetCard";

export const revalidate = 30;
export const metadata = { title: "السيتات | VOCK" };

export default async function SetsPage() {
  const raw = await prisma.set.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const sets = raw.map(parseSet);

  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-orange-500">السيتات</p>
      <h1 className="font-black tracking-tight text-3xl text-neutral-50">{sets.length} سيتات جاهزة لجلستك</h1>
      <p className="mt-2 max-w-xl text-sm text-neutral-400">
        كل سيت في استوديو VOCK بمدينة نصر ليه طابع مختلف تمامًا — من المودرن للفينتاج للمينيمال.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sets.map((s, i) => (
          <SetCard key={s.id} s={s} index={i} />
        ))}
      </div>
    </section>
  );
}
