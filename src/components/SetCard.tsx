import Image from "next/image";
import Link from "next/link";
import type { SetSummary } from "@/lib/types";

export default function SetCard({ s, index }: { s: SetSummary; index: number }) {
  return (
    <Link
      href={`/sets/${s.slug}`}
      className="card-frame group block overflow-hidden transition-colors hover:border-orange-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
        {s.images[0] && (
          <Image
            src={s.images[0]}
            alt={s.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute right-2 top-2 rounded-sm bg-black/70 px-2 py-1 font-mono text-[10px] text-orange-500">
          No. {String(index + 1).padStart(2, "0")}
        </span>
        {s.images.length > 1 && (
          <span className="absolute left-2 top-2 rounded-sm bg-black/70 px-2 py-1 font-mono text-[10px] text-neutral-300">
            {s.images.length} صور
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-orange-500">{s.tag}</p>
        <h3 className="mt-1 font-black tracking-tight text-lg text-neutral-50">{s.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{s.description}</p>
      </div>
    </Link>
  );
}
