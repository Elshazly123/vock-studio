import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseCategory } from "@/lib/types";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import PricingBrowser from "@/components/PricingBrowser";

export const revalidate = 30;

export async function generateMetadata() {
  const locale = getLocale();
  return { title: locale === "ar" ? "الأسعار | VOCK" : "Pricing | VOCK" };
}

export default async function PricingPage() {
  const raw = await prisma.pricingCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { tiers: { orderBy: { hours: "asc" } } },
  });
  const categories = raw.map(parseCategory);
  const locale = getLocale();
  const s = t(locale);

  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-orange-500">{s.nav_pricing}</p>
      <h1 className="font-black tracking-tight text-3xl text-neutral-50">{s.pricing_page_title}</h1>
      <p className="mt-2 max-w-xl text-sm text-neutral-400">{s.pricing_page_sub}</p>

      <div className="mt-8">
        <PricingBrowser categories={categories} locale={locale} />
      </div>

      <div className="mt-10 text-center">
        <Link href="/sets" className="btn-primary inline-flex">
          {s.pricing_cta}
        </Link>
      </div>
    </section>
  );
}
