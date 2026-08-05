"use client";

import { useRouter } from "next/navigation";
import PackagePicker, { type SelectedPackage } from "./PackagePicker";
import type { PricingCategoryData } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

export default function BookFromSetPackages({
  setSlug,
  categories,
  locale,
}: {
  setSlug: string;
  categories: PricingCategoryData[];
  locale: Locale;
}) {
  const router = useRouter();

  function handleSelect(pkg: SelectedPackage) {
    const params = new URLSearchParams({
      categoryId: pkg.categoryId,
      hours: String(pkg.hours),
    });
    router.push(`/book/${setSlug}?${params.toString()}`);
  }

  return <PackagePicker categories={categories} onSelect={handleSelect} locale={locale} />;
}
