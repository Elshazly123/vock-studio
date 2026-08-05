"use client";

import { useState } from "react";
import { formatEGP, depositFor, hoursLabel, localizeCategory, type PricingCategoryData, type PricingTierData } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";

export type SelectedPackage = {
  categoryId: string;
  categoryLabel: string;
  hours: number;
  price: number;
  original: number;
  deposit: number;
  name: string;
};

export default function PackagePicker({
  categories,
  selectedId,
  onSelect,
  locale,
}: {
  categories: PricingCategoryData[];
  selectedId?: string | null;
  onSelect: (pkg: SelectedPackage) => void;
  locale: Locale;
}) {
  const s = t(locale);
  const [activeCat, setActiveCat] = useState(categories[0]?.id);
  const category = categories.find((c) => c.id === activeCat) ?? categories[0];

  if (!category) return <p className="text-sm text-neutral-500">{locale === "ar" ? "مفيش باقات متاحة دلوقتي." : "No packages available right now."}</p>;

  const localizedCurrent = localizeCategory(category, locale);

  return (
    <div>
      <div className="mb-5 flex gap-2">
        {categories.map((cat) => {
          const l = localizeCategory(cat, locale);
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={
                "rounded-sm border px-4 py-2 text-sm font-semibold " +
                (activeCat === cat.id
                  ? "border-orange-500 bg-orange-600 text-white"
                  : "border-neutral-800 text-neutral-300 hover:border-neutral-600")
              }
            >
              {l.label}
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {localizedCurrent.includes.map((inc) => (
          <span key={inc} className="rounded-sm border border-neutral-800 px-2.5 py-1 text-[11px] text-neutral-400">
            {inc}
          </span>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {category.tiers.length === 0 && (
          <p className="text-sm text-neutral-500">{locale === "ar" ? "لسه مفيش مدد متاحة لهذه الفئة." : "No durations available for this category yet."}</p>
        )}
        {category.tiers.map((tier: PricingTierData) => {
          const id = category.id + "-" + tier.hours;
          const deposit = depositFor(tier.price);
          const isSelected = selectedId === id;
          return (
            <div
              key={tier.id}
              className={"rounded-sm border p-4 " + (isSelected ? "border-orange-500 bg-neutral-900" : "border-neutral-800 bg-neutral-900")}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-50">
                  {tier.hours} {hoursLabel(tier.hours, locale)}
                </h3>
                <span className="rounded-sm bg-orange-600/20 px-1.5 py-0.5 font-mono text-[10px] text-orange-400">
                  {locale === "ar"
                    ? `خصم ${Math.round((1 - tier.price / tier.original) * 100)}%`
                    : `${Math.round((1 - tier.price / tier.original) * 100)}% off`}
                </span>
              </div>
              <p className="mt-2 font-mono text-xs text-neutral-500 line-through">{formatEGP(tier.original, locale)}</p>
              <p className="font-black tracking-tight text-xl text-orange-500">{formatEGP(tier.price, locale)}</p>
              <p className="mt-1 font-mono text-[11px] text-neutral-500">{s.deposit_label} {formatEGP(deposit, locale)}</p>
              <button
                onClick={() =>
                  onSelect({
                    categoryId: category.id,
                    categoryLabel: localizedCurrent.label,
                    hours: tier.hours,
                    price: tier.price,
                    original: tier.original,
                    deposit,
                    name: localizedCurrent.label + " · " + tier.hours + " " + hoursLabel(tier.hours, locale),
                  })
                }
                className={
                  "mt-3 w-full rounded-sm py-2 text-sm font-semibold " +
                  (isSelected
                    ? "bg-orange-600 text-white"
                    : "border border-neutral-700 text-neutral-200 hover:border-orange-500 hover:text-orange-500")
                }
              >
                {isSelected ? s.package_selected : s.select_package}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
