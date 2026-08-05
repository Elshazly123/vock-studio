import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseCategory, parseSet, localizeSet } from "@/lib/types";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import BookingWizard from "@/components/BookingWizard";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: { setSlug: string };
  searchParams: { categoryId?: string; hours?: string };
}) {
  const raw = await prisma.set.findUnique({ where: { slug: params.setSlug } });
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

  const preselected =
    searchParams.categoryId && searchParams.hours
      ? { categoryId: searchParams.categoryId, hours: Number(searchParams.hours) }
      : undefined;

  return (
    <section className="mx-auto max-w-xl px-5 py-12">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-orange-500">{s.book_session}</p>
      <h1 className="mb-8 font-black tracking-tight text-2xl text-neutral-50">{l.name}</h1>
      <BookingWizard setId={set.id} setName={l.name} categories={categories} preselected={preselected} locale={locale} />
    </section>
  );
}
