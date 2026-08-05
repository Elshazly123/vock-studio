"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/lib/locale-actions";
import type { Locale } from "@/lib/i18n";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-sm border border-neutral-800 p-0.5 font-mono text-[11px]">
      <button
        onClick={() => switchTo("en")}
        disabled={pending}
        className={"rounded-sm px-2 py-1 " + (locale === "en" ? "bg-orange-600 text-white" : "text-neutral-400 hover:text-neutral-100")}
      >
        EN
      </button>
      <button
        onClick={() => switchTo("ar")}
        disabled={pending}
        className={"rounded-sm px-2 py-1 " + (locale === "ar" ? "bg-orange-600 text-white" : "text-neutral-400 hover:text-neutral-100")}
      >
        عربي
      </button>
    </div>
  );
}
