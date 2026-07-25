import Image from "next/image";
import Link from "next/link";
import type { SetSummary } from "@/lib/types";

export default function SetCard({ s, index, big }: { s: SetSummary; index: number; big?: boolean }) {
  return (
    <Link
      href={`/sets/${s.slug}`}
      className={
        "group relative block w-full overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900 transition-colors hover:border-orange-500 " +
        (big ? "aspect-video" : "aspect-square")
      }
    >
      {s.images[0] ? (
        <Image
          src={s.images[0]}
          alt={s.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
          <span className="font-mono text-[10px] text-neutral-500">لسه مفيش صور للسيت ده</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

      <span className="absolute right-2 top-2 rounded-sm bg-black/70 px-2 py-1 font-mono text-[10px] text-orange-500">
        No. {String(index + 1).padStart(2, "0")}
      </span>
      {s.images.length > 1 && (
        <span className="absolute left-2 top-2 rounded-sm bg-black/70 px-2 py-1 font-mono text-[10px] text-neutral-300">
          {s.images.length} صور
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-orange-400">{s.tag}</p>
        <h3 className={"mt-1 font-black tracking-tight text-neutral-50 " + (big ? "text-2xl" : "text-lg")}>
          {s.name}
        </h3>
        <p
          className={
            "mt-0 max-h-0 overflow-hidden text-sm text-neutral-300 opacity-0 transition-all duration-300 ease-out group-hover:mt-2 group-hover:max-h-20 group-hover:opacity-100 " +
            (big ? "line-clamp-3" : "line-clamp-2")
          }
        >
          {s.description}
        </p>
      </div>
    </Link>
  );
}
