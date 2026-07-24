"use client";

import { useRouter } from "next/navigation";
import PackagePicker, { type SelectedPackage } from "./PackagePicker";
import type { PricingCategoryData } from "@/lib/types";

export default function BookFromSetPackages({
  setSlug,
  categories,
}: {
  setSlug: string;
  categories: PricingCategoryData[];
}) {
  const router = useRouter();

  function handleSelect(pkg: SelectedPackage) {
    const params = new URLSearchParams({
      categoryId: pkg.categoryId,
      hours: String(pkg.hours),
    });
    router.push(`/book/${setSlug}?${params.toString()}`);
  }

  return <PackagePicker categories={categories} onSelect={handleSelect} />;
}
