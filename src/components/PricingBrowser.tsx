"use client";

import { useRouter } from "next/navigation";
import PackagePicker from "./PackagePicker";
import type { PricingCategoryData } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

export default function PricingBrowser({ categories, locale }: { categories: PricingCategoryData[]; locale: Locale }) {
  const router = useRouter();
  return <PackagePicker categories={categories} onSelect={() => router.push("/sets")} locale={locale} />;
}
