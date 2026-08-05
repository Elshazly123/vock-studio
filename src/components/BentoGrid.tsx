import SetCard from "./SetCard";
import type { SetSummary } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

export default function BentoGrid({ sets, limit, locale }: { sets: SetSummary[]; limit?: number; locale: Locale }) {
  const list = limit ? sets.slice(0, limit) : sets;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {list.map((s, i) => {
        const big = i === 0 || (i > 0 && i % 4 === 3);
        return (
          <div key={s.id} className={big ? "col-span-2" : "col-span-2 sm:col-span-1"}>
            <SetCard s={s} index={i} big={big} locale={locale} />
          </div>
        );
      })}
    </div>
  );
}
