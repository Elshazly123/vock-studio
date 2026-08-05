import { prisma } from "@/lib/prisma";
import { parseSet } from "@/lib/types";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import BentoGrid from "@/components/BentoGrid";

export const revalidate = 30;

export async function generateMetadata() {
  const locale = getLocale();
  return { title: locale === "ar" ? "السيتات | VOCK" : "Sets | VOCK" };
}

export default async function SetsPage() {
  const raw = await prisma.set.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const sets = raw.map(parseSet);
  const locale = getLocale();
  const s = t(locale);

  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-orange-500">{s.nav_sets}</p>
      <h1 className="font-black tracking-tight text-3xl text-neutral-50">{sets.length} {s.sets_title_suffix}</h1>
      <p className="mt-2 max-w-xl text-sm text-neutral-400">{s.sets_sub}</p>
      <div className="mt-8">
        <BentoGrid sets={sets} locale={locale} />
      </div>
    </section>
  );
}
