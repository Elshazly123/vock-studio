import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseSet, parseCategory, localizeSet } from "@/lib/types";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import Gallery from "@/components/Gallery";
import BookFromSetPackages from "@/components/BookFromSetPackages";

export const revalidate = 30;

export default async function SetDetailPage({ params }: { params: { slug: string } }) {
  const raw = await prisma.set.findUnique({ where: { slug: params.slug } });
  if (!raw) notFound();
  const set = parseSet(raw);
  const locale = getLocale();
  const s = t(locale);
  const l = localizeSet(set, locale);

  const rawCategories = await prisma.pricingCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { tiers: { orderBy: { hours: "asc" } } },
  });
  const categories = rawCategories.map(parseCategory);

  return (
    <section className="mx-auto max-w-5xl px-5 py-12">
      <nav className="mb-6 font-mono text-xs text-neutral-500">
        <Link href="/sets" className="hover:text-orange-500">{s.nav_sets}</Link> / <span className="text-neutral-200">{l.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Gallery images={set.images} alt={l.name} />
        </div>
        <div className="lg:col-span-2">
          <p className="font-mono text-[11px] uppercase tracking-widest text-orange-500">{l.tag}</p>
          <h1 className="mt-1 font-black tracking-tight text-2xl text-neutral-50">{l.name}</h1>
          <p className="mt-1 text-sm text-neutral-400">{set.address}</p>
          <p className="mt-4 text-sm leading-relaxed text-neutral-300">{l.description}</p>
          {l.amenities.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {l.amenities.map((a) => (
                <span key={a} className="rounded-sm border border-neutral-800 px-3 py-1 text-xs text-neutral-300">
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-5 mt-12 font-black tracking-tight text-xl text-neutral-50">{s.packages_title}</h2>
      <BookFromSetPackages setSlug={set.slug} categories={categories} locale={locale} />
    </section>
  );
}
